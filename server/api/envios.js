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

const mailer = require('../services/mailer');
const transporter = mailer.crearTransporter();

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
            
        // Send email via mailer queue
        const confRows = await queryAll("SELECT valor FROM config_global WHERE clave = 'emails_activados'");
        const emailsActivados = confRows.length > 0 ? confRows[0].valor === 'true' : true;
        
        if (emailsActivados && emailDestino) {
            let attachments = [];
            if (archivo) {
                attachments.push({
                    filename: archivo.originalname,
                    path: archivo.path
                });
            }

            const linkDocHtml = link_doc ? `<p style="margin: 12px 0;"><b>Enlace Google Docs:</b> <a href="${link_doc}" style="color: #2563eb;">${link_doc}</a></p>` : '';
            
            await mailer.enviarConPlantilla({
                clave: 'evaluacion_entrega',
                variables: {
                    coordinador_nombre: nombreDestino,
                    profesor_nombre: ev.profesor_nombre,
                    curso: ev.curso,
                    asignatura: ev.asignatura,
                    fecha: ev.fecha,
                    tipo: ev.tipo,
                    instrucciones: instrucciones || 'Ninguna',
                    link_doc: link_doc || '',
                    bloque_link_doc: linkDocHtml
                },
                destinatario: emailDestino,
                adjuntos: attachments,
                modulo: 'Evaluaciones'
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
