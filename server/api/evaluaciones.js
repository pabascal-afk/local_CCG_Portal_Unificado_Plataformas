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

// GET Evaluaciones para vista pública / embebida (requiere sesión institucional activa)
router.get('/publico', async (req, res) => {
    try {
        if (!req.isAuthenticated() && process.env.GOOGLE_CLIENT_ID) {
            return res.status(401).json({ error: 'Debes iniciar sesión con tu cuenta de Google institucional para ver las evaluaciones.' });
        }

        const cursoFiltro = req.query.curso ? req.query.curso.trim() : null;
        let query = "SELECT id, fecha, curso, asignatura, tipo, detalles, profesor_nombre FROM evaluaciones WHERE 1=1";
        const params = [];

        if (cursoFiltro) {
            query += " AND LOWER(curso) = LOWER(?)";
            params.push(cursoFiltro);
        }
        query += " ORDER BY fecha ASC";

        const rows = await queryAll(query, params);
        res.json(rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// GET Lista ordenada de cursos para el selector público
router.get('/cursos-publico', async (req, res) => {
    try {
        const rows = await queryAll(`
            SELECT DISTINCT curso FROM (
                SELECT curso FROM evaluaciones WHERE curso IS NOT NULL AND TRIM(curso) != ''
                UNION
                SELECT curso FROM horarios WHERE curso IS NOT NULL AND TRIM(curso) != ''
            ) ORDER BY 
              CASE 
                WHEN curso LIKE '%KINDER%' THEN 1
                WHEN curso LIKE '%1°%' THEN 2
                WHEN curso LIKE '%2°%' THEN 3
                WHEN curso LIKE '%3°%' THEN 4
                WHEN curso LIKE '%4°%' THEN 5
                WHEN curso LIKE '%5°%' THEN 6
                WHEN curso LIKE '%6°%' THEN 7
                WHEN curso LIKE '%7°%' THEN 8
                WHEN curso LIKE '%8°%' THEN 9
                WHEN curso LIKE '%I°%' THEN 10
                WHEN curso LIKE '%II°%' THEN 11
                WHEN curso LIKE '%III°%' THEN 12
                WHEN curso LIKE '%IV°%' THEN 13
                ELSE 20
              END, curso ASC
        `);
        res.json(rows.map(r => r.curso));
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// GET Todas mis evaluaciones (sin limite)
router.get('/mis-evaluaciones-todas', async (req, res) => {
    try {
        const userEmail = req.isAuthenticated() ? req.user.email : 'dev@colegio.edu';
        const userName = req.isAuthenticated() ? (req.user.nombre || '') : '';
        const evals = await queryAll(`
            SELECT * FROM evaluaciones 
            WHERE (
                LOWER(profesor_email) = LOWER(?) 
                OR LOWER(profesor_nombre) = LOWER(?) 
                OR (profesor_nombre IS NOT NULL AND LOWER(profesor_nombre) LIKE '%' || LOWER(?) || '%')
                OR (profesor_email IS NOT NULL AND LOWER(profesor_email) LIKE '%' || LOWER(?) || '%')
            )
            ORDER BY fecha DESC
        `, [userEmail, userEmail, userName, userName]);
        res.json(evals);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

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
