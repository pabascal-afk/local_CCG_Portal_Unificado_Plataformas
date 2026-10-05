const fs = require('fs');
let code = fs.readFileSync('server/index.js', 'utf8');

const injection = `
// --- Recursos Config ---
app.get('/api/recursos/config', (req, res) => {
  db.all("SELECT * FROM recursos_config WHERE activo = 1", (err, rows) => {
    if (err) return res.status(500).json({error: err.message});
    res.json(rows);
  });
});

app.post('/api/recursos/config', (req, res) => {
  const { nombre, responsable, duracion_bloque, horario_inicio, horario_fin } = req.body;
  db.run("INSERT INTO recursos_config (nombre, responsable, duracion_bloque, horario_inicio, horario_fin) VALUES (?, ?, ?, ?, ?)",
    [nombre, responsable, duracion_bloque, horario_inicio, horario_fin], function(err) {
    if (err) return res.status(500).json({error: err.message});
    res.json({ message: 'Recurso creado', id: this.lastID });
  });
});
`;

if (!code.includes('/api/recursos/config')) {
    code = code.replace('// --- Reservas ---', injection + '\n// --- Reservas ---');
    fs.writeFileSync('server/index.js', code, 'utf8');
}
