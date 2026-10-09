const express = require('express');
const router = express.Router();
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const dbPath = path.join(__dirname, '../db/colegio.db');
const db = new sqlite3.Database(dbPath);
const nodemailer = require('nodemailer');

// Promisify queries
const run = (query, params = []) => new Promise((res, rej) => db.run(query, params, function(err) { if (err) rej(err); else res(this); }));
const queryAll = (query, params = []) => new Promise((res, rej) => db.all(query, params, (err, rows) => { if (err) rej(err); else res(rows); }));

// Auto-crear tablas si no existen
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS config_materiales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        responsable TEXT NOT NULL
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS actividades (
        id TEXT PRIMARY KEY,
        titulo TEXT NOT NULL,
        descripcion TEXT,
        fecha TEXT NOT NULL,
        bloques TEXT NOT NULL,
        solicitante_email TEXT NOT NULL,
        estado TEXT DEFAULT 'Pendiente',
        creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS actividades_req (
        id TEXT PRIMARY KEY,
        actividad_id TEXT,
        tipo TEXT,
        recurso_id INTEGER,
        cantidad INTEGER DEFAULT 1,
        responsable_email TEXT,
        estado TEXT DEFAULT 'Pendiente',
        token TEXT
    )`);
});

const queryGet = (query, params = []) => new Promise((res, rej) => db.get(query, params, (err, row) => { if (err) rej(err); else res(row); }));

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: (process.env.SMTP_SECURE === 'true' || !process.env.SMTP_SECURE), // default true
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});

// --- MATERIALES CRUD ---
router.get('/materiales', async (req, res) => {
    try {
        const rows = await queryAll("SELECT * FROM config_materiales");
        res.json(rows);
    } catch(e) { res.status(500).json({error: e.message}); }
});

router.post('/materiales', async (req, res) => {
    try {
        const { nombre, responsable } = req.body;
        await run("INSERT INTO config_materiales (nombre, responsable) VALUES (?, ?)", [nombre, responsable]);
        res.json({message: 'Material creado'});
    } catch(e) { res.status(500).json({error: e.message}); }
});

router.delete('/materiales/:id', async (req, res) => {
    try {
        await run("DELETE FROM config_materiales WHERE id = ?", [req.params.id]);
        res.json({message: 'Material eliminado'});
    } catch(e) { res.status(500).json({error: e.message}); }
});

// --- ACTIVIDADES WORKFLOW ---

// 1. Solicitar Actividad
router.post('/solicitar', async (req, res) => {
    try {
        const { titulo, descripcion, fecha, bloques, espacios, materiales } = req.body;
        const solicitante = req.isAuthenticated() ? req.user.email : 'test@colegio.edu';
        const actividad_id = Math.random().toString(36).substr(2, 9);
        
        await run("INSERT INTO actividades (id, titulo, descripcion, fecha, bloques, solicitante_email) VALUES (?, ?, ?, ?, ?, ?)",
            [actividad_id, titulo, descripcion, fecha, bloques, solicitante]);
            
        // Procesar Espacios
        for (const esp_id of (espacios || [])) {
            const espacio = await queryGet("SELECT nombre, responsable FROM recursos_config WHERE id = ?", [esp_id]);
            if (espacio) {
                const req_id = Math.random().toString(36).substr(2, 9);
                const token = Math.random().toString(36).substr(2, 15);
                await run("INSERT INTO actividades_req (id, actividad_id, tipo, recurso_id, responsable_email, token) VALUES (?, ?, 'ESPACIO', ?, ?, ?)",
                    [req_id, actividad_id, esp_id, espacio.responsable, token]);
                    
                enviarCorreoAprobacion(espacio.responsable, solicitante, titulo, fecha, bloques, "Espacio: " + espacio.nombre, token);
            }
        }
        
        // Procesar Materiales
        for (const mat of (materiales || [])) {
            const material = await queryGet("SELECT nombre, responsable FROM config_materiales WHERE id = ?", [mat.id]);
            if (material) {
                const req_id = Math.random().toString(36).substr(2, 9);
                const token = Math.random().toString(36).substr(2, 15);
                await run("INSERT INTO actividades_req (id, actividad_id, tipo, recurso_id, cantidad, responsable_email, token) VALUES (?, ?, 'MATERIAL', ?, ?, ?, ?)",
                    [req_id, actividad_id, mat.id, mat.cantidad, material.responsable, token]);
                    
                enviarCorreoAprobacion(material.responsable, solicitante, titulo, fecha, bloques, `Material: ${mat.cantidad}x ${material.nombre}`, token);
            }
        }
        
        // Check if there are no requests (auto-approve)
        const reqs = await queryAll("SELECT * FROM actividades_req WHERE actividad_id = ?", [actividad_id]);
        if (reqs.length === 0) {
            await run("UPDATE actividades SET estado = 'Aprobada' WHERE id = ?", [actividad_id]);
        }
        
        res.json({message: "Solicitud de actividad enviada correctamente."});
    } catch(e) {
        res.status(500).json({error: e.message});
    }
});

// 2. Aprobar / Rechazar desde Correo
router.get('/aprobar', async (req, res) => {
    try {
        const { token, action } = req.query; // action = approve | reject
        const requerimiento = await queryGet("SELECT * FROM actividades_req WHERE token = ?", [token]);
        
        if (!requerimiento) return res.send("<h1>Enlace invA!lido o caducado</h1>");
        if (requerimiento.estado !== 'Pendiente') return res.send(`<h1>Esta solicitud ya fue ${requerimiento.estado}</h1>`);
        
        const nuevoEstado = (action === 'approve') ? 'Autorizado' : 'Rechazado';
        await run("UPDATE actividades_req SET estado = ? WHERE id = ?", [nuevoEstado, requerimiento.id]);
        
        // Check global activity state
        const reqs = await queryAll("SELECT estado FROM actividades_req WHERE actividad_id = ?", [requerimiento.actividad_id]);
        const rechazados = reqs.filter(r => r.estado === 'Rechazado');
        const pendientes = reqs.filter(r => r.estado === 'Pendiente');
        
        let actEstado = null;
        if (rechazados.length > 0) actEstado = 'Rechazada'; // Si 1 rechaza, se cae? O aprobaciA3n parcial? Mejor que si 1 rechaza, rechaza todo (o se deja Aprobada Parcial). Lo dejaremos como "Rechazada".
        else if (pendientes.length === 0) actEstado = 'Aprobada'; // Todos autorizaron
        
        if (actEstado) {
            await run("UPDATE actividades SET estado = ? WHERE id = ?", [actEstado, requerimiento.actividad_id]);
            // Avisar al solicitante
            const act = await queryGet("SELECT * FROM actividades WHERE id = ?", [requerimiento.actividad_id]);
            if (process.env.SMTP_USER) {
                transporter.sendMail({
                    from: `"Sistema Colegio" <${process.env.SMTP_USER}>`,
                    to: act.solicitante_email,
                    subject: `Solicitud de Actividad: ${actEstado}`,
                    html: `<h3>Tu actividad "${act.titulo}" ha sido ${actEstado}.</h3><p>Fecha: ${act.fecha}</p>`
                }).catch(()=>{});
            }
        }
        
        res.send(`
            <div style="text-align: center; font-family: sans-serif; padding: 50px;">
                <h1 style="color: ${action === 'approve' ? 'green' : 'red'};">${action === 'approve' ? 'Aprobado' : 'Rechazado'}</h1>
                <p>El recurso ha sido ${nuevoEstado.toLowerCase()} exitosamente. Ya puedes cerrar esta pestaA+a.</p>
            </div>
        `);
    } catch(e) { res.status(500).send("Error del servidor: " + e.message); }
});

// Función Auxiliar para enviar el correo con los botones mágicos
function enviarCorreoAprobacion(dest, solicitante, titulo, fecha, bloques, desc_recurso, token) {
    if (!process.env.SMTP_USER) return;
    
    // Obtener la URL base dinAmicamente podrIa ser complejo (ngrok, localhost, cloudflare).
    // Se recomienda configurar BASE_URL en el .env, pero si no, asumimos la actual (esto es difIcil en emails).
    // Usaremos process.env.GAS_TUNNEL_DB_URL o NGROK_DOMAIN si existe, pero como fallback ponemos una variable BASE_URL
    let baseUrl = process.env.BASE_URL || 'http://localhost:9000';
    if (process.env.NGROK_DOMAIN) baseUrl = 'https://' + process.env.NGROK_DOMAIN;
    
    const approveUrl = `${baseUrl}/api/actividades/aprobar?token=${token}&action=approve`;
    const rejectUrl = `${baseUrl}/api/actividades/aprobar?token=${token}&action=reject`;
    
    transporter.sendMail({
        from: `"Sistema Colegio" <${process.env.SMTP_USER}>`,
        to: dest,
        subject: `Requerimiento de AutorizaciA3n: ${titulo}`,
        html: `
            <div style="font-family: sans-serif;">
                <h2>Nueva solicitud de actividad</h2>
                <p><b>Solicitante:</b> ${solicitante}</p>
                <p><b>Actividad:</b> ${titulo}</p>
                <p><b>Fecha:</b> ${fecha} (Bloques: ${bloques})</p>
                <hr>
                <p>Se ha solicitado tu autorizaciA3n para el uso de:</p>
                <h3>${desc_recurso}</h3>
                <br>
                <a href="${approveUrl}" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-right: 10px;">Aprobar Uso</a>
                <a href="${rejectUrl}" style="background-color: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Rechazar</a>
            </div>
        `
    }).catch(e => console.error("Error enviando email de autorizaciA3n", e));
}

// Obtener mis actividades
router.get('/mis-actividades', async (req, res) => {
    try {
        const email = req.isAuthenticated() ? req.user.email : 'test@colegio.edu';
        const rows = await queryAll("SELECT * FROM actividades WHERE solicitante_email = ?", [email]);
        // Include requirements
        for (let r of rows) {
            r.requerimientos = await queryAll("SELECT * FROM actividades_req WHERE actividad_id = ?", [r.id]);
        }
        res.json(rows);
    } catch(e) { res.status(500).json({error: e.message}); }
});

module.exports = router;
