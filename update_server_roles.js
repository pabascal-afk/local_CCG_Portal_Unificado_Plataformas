const fs = require('fs');
let code = fs.readFileSync('server/index.js', 'utf8');

const rolesAPI = `
// --- Roles Config ---
app.get('/api/roles', (req, res) => {
    db.all("SELECT * FROM roles_config", (err, rows) => {
        if (err) return res.status(500).json({error: err.message});
        res.json(rows);
    });
});

app.post('/api/roles', (req, res) => {
    const { nombre, permisos } = req.body;
    db.run("INSERT INTO roles_config (nombre, permisos) VALUES (?, ?)", [nombre, JSON.stringify(permisos)], function(err) {
        if (err) return res.status(500).json({error: err.message});
        res.json({ message: 'Rol creado', id: this.lastID });
    });
});

app.put('/api/roles/:id', (req, res) => {
    const { nombre, permisos } = req.body;
    db.run("UPDATE roles_config SET nombre = ?, permisos = ? WHERE id = ?", [nombre, JSON.stringify(permisos), req.params.id], function(err) {
        if (err) return res.status(500).json({error: err.message});
        res.json({ message: 'Rol actualizado' });
    });
});

app.delete('/api/roles/:id', (req, res) => {
    db.run("DELETE FROM roles_config WHERE id = ?", [req.params.id], function(err) {
        if (err) return res.status(500).json({error: err.message});
        res.json({ message: 'Rol eliminado' });
    });
});
`;

code = code.replace("// --- Start Server ---", rolesAPI + "\n// --- Start Server ---");

fs.writeFileSync('server/index.js', code, 'utf8');
console.log('API de roles inyectada en server/index.js');
