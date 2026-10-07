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

module.exports = router;
