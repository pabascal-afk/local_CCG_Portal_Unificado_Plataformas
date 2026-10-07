const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
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

router.get('/emails', async (req, res) => {
    try {
        const rows = await queryAll("SELECT valor FROM config_global WHERE clave = 'emails_activados'");
        if (rows.length > 0) {
            res.json({ activados: rows[0].valor === 'true' });
        } else {
            res.json({ activados: true });
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.post('/emails', async (req, res) => {
    try {
        // Only admins should do this (in real app add role check)
        const { activados } = req.body;
        await run("UPDATE config_global SET valor = ? WHERE clave = 'emails_activados'", [activados ? 'true' : 'false']);
        res.json({ message: "Configuración actualizada" });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});


router.get('/gas', async (req, res) => {
    res.json({ url: process.env.GAS_WEB_APP_URL });
});


// ==================== TIPOS DE EVALUACION ====================
router.get('/tipos-evaluacion', async (req, res) => {
    try {
        const rows = await queryAll("SELECT * FROM config_tipos_evaluacion ORDER BY orden ASC, id ASC");
        res.json(rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.post('/tipos-evaluacion/reordenar', async (req, res) => {
    try {
        const { ordenIds } = req.body;
        for (let i = 0; i < ordenIds.length; i++) {
            await run("UPDATE config_tipos_evaluacion SET orden = ? WHERE id = ?", [i, ordenIds[i]]);
        }
        res.json({ message: "Orden actualizado" });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.post('/tipos-evaluacion', async (req, res) => {
    try {
        const { nombre, es_prueba } = req.body;
        const maxOrdenRow = await queryAll("SELECT MAX(orden) as maxO FROM config_tipos_evaluacion");
        let nextOrden = 0;
        if (maxOrdenRow.length > 0 && maxOrdenRow[0].maxO !== null) nextOrden = maxOrdenRow[0].maxO + 1;
        const id = await run("INSERT INTO config_tipos_evaluacion (nombre, es_prueba, orden) VALUES (?, ?, ?)", [nombre, es_prueba ? 1 : 0, nextOrden]);
        res.json({ id, message: "Tipo agregado" });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.delete('/tipos-evaluacion/:id', async (req, res) => {
    try {
        await run("DELETE FROM config_tipos_evaluacion WHERE id = ?", [req.params.id]);
        res.json({ message: "Tipo eliminado" });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.put('/tipos-evaluacion/:id', async (req, res) => {
    try {
        const { nombre, es_prueba } = req.body;
        await run("UPDATE config_tipos_evaluacion SET nombre = ?, es_prueba = ? WHERE id = ?", [nombre, es_prueba ? 1 : 0, req.params.id]);
        res.json({ message: "Tipo actualizado" });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;
