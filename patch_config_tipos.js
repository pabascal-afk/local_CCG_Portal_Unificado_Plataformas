const fs = require('fs');
let code = fs.readFileSync('server/api/config.js', 'utf8');

const newEndpoints = `
// ==================== TIPOS DE EVALUACION ====================
router.get('/tipos-evaluacion', async (req, res) => {
    try {
        const rows = await queryAll("SELECT * FROM config_tipos_evaluacion ORDER BY id ASC");
        res.json(rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.post('/tipos-evaluacion', async (req, res) => {
    try {
        const { nombre, es_prueba } = req.body;
        const id = await run("INSERT INTO config_tipos_evaluacion (nombre, es_prueba) VALUES (?, ?)", [nombre, es_prueba ? 1 : 0]);
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
`;

code = code.replace("module.exports = router;", newEndpoints + "\nmodule.exports = router;");
fs.writeFileSync('server/api/config.js', code, 'utf8');
console.log("Endpoints agregados a config.js");
