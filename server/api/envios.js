const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const sqlite3 = require('sqlite3').verbose();
const dbPath = path.join(__dirname, '../db/colegio.db');

const queryAll = (query, params = []) => new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath);
    db.all(query, params, (err, rows) => {
        db.close();
        if(err) reject(err); else resolve(rows);
    });
});
const run = (query, params = []) => new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath);
    db.run(query, params, function(err) {
        db.close();
        if(err) reject(err); else resolve(this.lastID);
    });
});

// Ensure uploads dir exists
const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

router.post('/enviar/:id', upload.single('archivo'), async (req, res) => {
    try {
        const { id } = req.params;
        const { link_doc, instrucciones } = req.body;
        const archivo = req.file;
        
        // Find the evaluation
        const evals = await queryAll("SELECT * FROM evaluaciones WHERE id = ?", [id]);
        if (evals.length === 0) return res.status(404).json({error: "Evaluación no encontrada"});
        const ev = evals[0];
        
        // Find coordinator
        const coords = await queryAll(`
            SELECT * FROM coordinadores_areas 
            WHERE (curso_regla = ? OR curso_regla = '*')
            AND (asignatura_regla = ? OR asignatura_regla = '*')
            ORDER BY (curso_regla != '*') DESC, (asignatura_regla != '*') DESC
        `, [ev.curso, ev.asignatura]);
        
        const emailDestino = coords.length > 0 ? coords[0].email : (process.env.DIRECTOR_EMAIL || 'utp@colegio.edu');
        const nombreDestino = coords.length > 0 ? coords[0].nombre : 'Coordinación General';
        
        // Update database
        const archivoPath = archivo ? archivo.filename : null;
        await run("UPDATE evaluaciones SET estado_doc = 'Enviada', link_doc = ?, archivo_doc = ? WHERE id = ?", 
            [link_doc || null, archivoPath, id]);
            
        // Send email
        const confRows = await queryAll("SELECT valor FROM config_global WHERE clave = 'emails_activados'");
        const emailsActivados = confRows.length > 0 ? confRows[0].valor === 'true' : true;
        
        if (emailsActivados && process.env.SMTP_USER && process.env.SMTP_PASS) {
            let attachments = [];
            if (archivo) {
                attachments.push({
                    filename: archivo.originalname,
                    path: archivo.path
                });
            }
            
            const htmlMsg = `
                <h3>Nueva Evaluación para Revisión/Impresión</h3>
                <p>Hola ${nombreDestino},</p>
                <p>El profesor <b>${ev.profesor_nombre}</b> ha enviado una evaluación para su revisión y/o impresión.</p>
                <ul>
                    <li><b>Curso:</b> ${ev.curso}</li>
                    <li><b>Asignatura:</b> ${ev.asignatura}</li>
                    <li><b>Fecha Programada:</b> ${ev.fecha}</li>
                    <li><b>Tipo:</b> ${ev.tipo}</li>
                </ul>
                <p><b>Instrucciones del profesor:</b><br/>${instrucciones || 'Ninguna'}</p>
                ${link_doc ? `<p><b>Enlace Google Docs:</b> <a href="${link_doc}">${link_doc}</a></p>` : ''}
            `;
            
            await transporter.sendMail({
                from: '"Sistema Colegio" <' + process.env.SMTP_USER + '>',
                to: emailDestino,
                subject: `Entrega Evaluación: ${ev.curso} - ${ev.asignatura}`,
                html: htmlMsg,
                attachments: attachments
            });
        }
        
        res.json({message: "Enviado correctamente a " + emailDestino});
    } catch (e) {
        console.error(e);
        res.status(500).json({error: e.message});
    }
});

router.get('/coordinadores', async (req, res) => {
    try {
        const rows = await queryAll("SELECT * FROM coordinadores_areas");
        res.json(rows);
    } catch (e) {
        res.status(500).json({error: e.message});
    }
});

router.post('/coordinadores', async (req, res) => {
    try {
        const { email, nombre, curso_regla, asignatura_regla } = req.body;
        await run("INSERT INTO coordinadores_areas (email, nombre, curso_regla, asignatura_regla) VALUES (?, ?, ?, ?)", 
            [email, nombre, curso_regla, asignatura_regla]);
        res.json({message: "Coordinador añadido"});
    } catch (e) {
        res.status(500).json({error: e.message});
    }
});

router.delete('/coordinadores/:id', async (req, res) => {
    try {
        await run("DELETE FROM coordinadores_areas WHERE id = ?", [req.params.id]);
        res.json({message: "Coordinador eliminado"});
    } catch (e) {
        res.status(500).json({error: e.message});
    }
});

module.exports = router;
