const fs = require('fs');
let code = fs.readFileSync('server/index.js', 'utf8');

// The original POST endpoint:
// app.post('/api/recursos/config', (req, res) => {
//   const { nombre, responsable, duracion_bloque, horario_inicio, horario_fin } = req.body;
//   db.run("INSERT INTO recursos_config (nombre, responsable, duracion_bloque, horario_inicio, horario_fin) VALUES (?, ?, ?, ?, ?)",
//     [nombre, responsable, duracion_bloque, horario_inicio, horario_fin], function(err) {
// ...

const replacementPost = `
app.post('/api/recursos/config', (req, res) => {
  const { nombre, responsable, duracion_bloque, horario_inicio, horario_fin, disponibilidad } = req.body;
  const dispStr = disponibilidad ? JSON.stringify(disponibilidad) : '{}';
  db.run("INSERT INTO recursos_config (nombre, responsable, duracion_bloque, horario_inicio, horario_fin, disponibilidad) VALUES (?, ?, ?, ?, ?, ?)",
    [nombre, responsable, duracion_bloque, horario_inicio, horario_fin, dispStr], function(err) {
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

code = code.replace(/app\.post\('\/api\/recursos\/config', \(req, res\) => \{[\s\S]*?\}\);/g, replacementPost);
fs.writeFileSync('server/index.js', code, 'utf8');
console.log("Endpoint recursos update injected");
