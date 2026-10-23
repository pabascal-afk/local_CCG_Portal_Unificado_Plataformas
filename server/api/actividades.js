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

const mailer = require('../services/mailer');
const auditoria = require('../services/auditoria');
const transporter = mailer.crearTransporter();

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
        
        auditoria.registrarAuditoria({
            req,
            modulo: 'Actividades',
            accion: 'Solicitar Actividad',
            nivel: 'info',
            entidad: 'actividades',
            entidad_id: actividad_id,
            descripcion: `Solicitud de actividad creada: "${titulo}" para el ${fecha} (Bloques: ${bloques})`,
            detalles: { id: actividad_id, titulo, fecha, bloques, solicitante }
        });

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
            if (act && act.solicitante_email) {
                const colorEstado = actEstado === 'Aprobada' ? '#28a745' : '#dc3545';
                mailer.enviarConPlantilla({
                    clave: 'actividad_resultado_estado',
                    variables: {
                        solicitante: act.solicitante_email,
                        titulo: act.titulo,
                        fecha: act.fecha,
                        estado: actEstado,
                        color_estado: colorEstado
                    },
                    destinatario: act.solicitante_email,
                    modulo: 'Actividades'
                }).catch(e => console.error("Error encolando resultado actividad:", e.message));
            }
        }
        
        auditoria.registrarAuditoria({
            usuario: { email: requerimiento.responsable_email },
            modulo: 'Actividades',
            accion: action === 'approve' ? 'Autorizar Requerimiento' : 'Rechazar Requerimiento',
            nivel: action === 'approve' ? 'success' : 'warning',
            entidad: 'actividades_req',
            entidad_id: requerimiento.id,
            descripcion: `Requerimiento de actividad ${requerimiento.actividad_id} fue ${nuevoEstado.toLowerCase()} por ${requerimiento.responsable_email}`,
            detalles: { requerimiento_id: requerimiento.id, nuevoEstado, estadoActividad: actEstado }
        });

        res.send(`
            <div style="text-align: center; font-family: sans-serif; padding: 50px;">
                <h1 style="color: ${action === 'approve' ? 'green' : 'red'};">${action === 'approve' ? 'Aprobado' : 'Rechazado'}</h1>
                <p>El recurso ha sido ${nuevoEstado.toLowerCase()} exitosamente. Ya puedes cerrar esta pestaña.</p>
            </div>
        `);
    } catch(e) { res.status(500).send("Error del servidor: " + e.message); }
});

// Función Auxiliar para enviar el correo con los botones de autorización
function enviarCorreoAprobacion(dest, solicitante, titulo, fecha, bloques, desc_recurso, token) {
    if (!dest) return;
    let baseUrl = process.env.PUBLIC_URL || process.env.BASE_URL || 'http://localhost:9000';
    const approveUrl = `${baseUrl}/api/actividades/aprobar?token=${token}&action=approve`;
    const rejectUrl = `${baseUrl}/api/actividades/aprobar?token=${token}&action=reject`;
    
    mailer.enviarConPlantilla({
        clave: 'actividad_solicitud_autorizacion',
        variables: {
            solicitante,
            titulo,
            fecha,
            bloques,
            desc_recurso,
            enlace_aprobar: approveUrl,
            enlace_rechazar: rejectUrl
        },
        destinatario: dest,
        modulo: 'Actividades'
    }).catch(e => console.error("Error encolando autorización actividad:", e.message));
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


router.delete('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        await run('DELETE FROM actividades_req WHERE actividad_id = ?', [id]);
        await run('DELETE FROM actividades WHERE id = ?', [id]);

        auditoria.registrarAuditoria({
            req,
            modulo: 'Actividades',
            accion: 'Eliminar Actividad',
            nivel: 'warning',
            entidad: 'actividades',
            entidad_id: id,
            descripcion: `Actividad institucional eliminada (ID: ${id})`
        });

        res.json({success: true});
    } catch(e) {
        console.error(e);
        res.status(500).json({error: e.message});
    }
});

module.exports = router;

