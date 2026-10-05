const fs = require('fs');
let code = fs.readFileSync('server/index.js', 'utf8');

// Find the section from app.get('/api/recursos/config' to before app.get('/api/reservas'
const startIdx = code.indexOf("app.get('/api/recursos/config'");
const endIdx = code.indexOf("// --- Reservas ---");

if (startIdx !== -1 && endIdx !== -1) {
    const newSection = `
app.get('/api/recursos/config', (req, res) => {
  db.all("SELECT * FROM recursos_config WHERE activo = 1", (err, rows) => {
    if (err) return res.status(500).json({error: err.message});
    res.json(rows);
  });
});

app.post('/api/recursos/config', (req, res) => {
  const { nombre, responsable, duracion_bloque, horario_inicio, horario_fin, disponibilidad } = req.body;
  const dispStr = disponibilidad ? JSON.stringify(disponibilidad) : '{}';
  db.run("INSERT INTO recursos_config (nombre, responsable, duracion_bloque, horario_inicio, horario_fin, disponibilidad) VALUES (?, ?, ?, ?, ?, ?)",
    [nombre, responsable, duracion_bloque || 45, horario_inicio || '08:00', horario_fin || '18:00', dispStr], function(err) {
    if (err) return res.status(500).json({error: err.message});
    res.json({ message: 'Recurso creado', id: this.lastID });
  });
});

app.put('/api/recursos/config/:id', (req, res) => {
  const { disponibilidad } = req.body;
  db.run("UPDATE recursos_config SET disponibilidad = ? WHERE id = ?", [JSON.stringify(disponibilidad), req.params.id], function(err) {
    if (err) return res.status(500).json({error: err.message});
    res.json({ message: 'Configuración actualizada' });
  });
});

`;
    code = code.substring(0, startIdx) + newSection + code.substring(endIdx);
    fs.writeFileSync('server/index.js', code, 'utf8');
    console.log("Section replaced successfully.");
}
