const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, '../db/colegio.db');

// Función helper para DB
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

// GET Evaluaciones
router.get('/', async (req, res) => {
    try {
        const rows = await queryAll("SELECT * FROM evaluaciones");
        res.json(rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// GET Horarios
router.get('/horarios', async (req, res) => {
    try {
        const rows = await queryAll("SELECT * FROM horarios");
        res.json(rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// POST Agendar
router.post('/agendar', async (req, res) => {
    const { fecha, curso, asignatura, tipo, recurso, detalles } = req.body;
    const user = req.user || { email: 'dev@colegio.edu', nombre: 'Admin Dev', rol: 'Administrador' };
    const rolNorm = user.rol.toLowerCase().trim();

    try {
        // Validar RBAC para recursos
        if (recurso && recurso !== "Ninguno" && recurso !== "") {
            if (rolNorm === 'profesor') {
                return res.status(403).json({ error: "Acceso denegado: Solo Coordinación Pedagógica o Directivos pueden solicitar laboratorios o el auditorio para evaluaciones." });
            }
            
            // Validar si recurso está ocupado
            // En una app real cruzaríamos con los horarios de clase del día
            const bloqueadas = await queryAll("SELECT * FROM reservas WHERE fecha = ? AND recurso = ? AND estado != 'Cancelada'", [fecha, recurso]);
            if (bloqueadas.length > 0) {
                 return res.status(400).json({ error: `El recurso ${recurso} ya tiene reservas ese día.` });
            }
        }

        const nuevoId = Math.random().toString(36).substr(2, 9);
        
        await run(
            "INSERT INTO evaluaciones (id, fecha, curso, asignatura, tipo, recurso, profesor_email, profesor_nombre, detalles) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [nuevoId, fecha, curso, asignatura, tipo, recurso, user.email, user.nombre, detalles]
        );

        // Si hay recurso, guardar en tabla reservas
        if (recurso && recurso !== "Ninguno" && recurso !== "") {
            const resId = Math.random().toString(36).substr(2, 9);
            await run(
                "INSERT INTO reservas (id, id_evaluacion, fecha, bloques, recurso, curso, motivo, profesor_email) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                [resId, nuevoId, fecha, "1,2", recurso, curso, `Prueba de ${asignatura}`, user.email]
            );
        }

        res.json({ message: "Evaluación agendada exitosamente." });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;
