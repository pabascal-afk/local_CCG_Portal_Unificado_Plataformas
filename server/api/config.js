const express = require('express');
const router = express.Router();
const { queryAll, run } = require('../db/db');

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

module.exports = router;
