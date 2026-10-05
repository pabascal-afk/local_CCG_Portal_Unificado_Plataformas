const fs = require('fs');
let code = fs.readFileSync('server/index.js', 'utf8');

const putRegex = /app\.put\('\/api\/recursos\/config\/:id', \(req, res\) => \{\s*const \{ disponibilidad, bloques_agrupados \} = req\.body;\s*db\.run\("UPDATE recursos_config SET disponibilidad = COALESCE\(\?, disponibilidad\), bloques_agrupados = COALESCE\(\?, bloques_agrupados\) WHERE id = \?", \s*\[disponibilidad \? JSON\.stringify\(disponibilidad\) : null, bloques_agrupados \? JSON\.stringify\(bloques_agrupados\) : null, req\.params\.id\], function\(err\) \{\s*if \(err\) return res\.status\(500\)\.json\(\{error: err\.message\}\);\s*res\.json\(\{ message: 'Configuración actualizada' \}\);\s*\}\);\s*\}\);/;

const putReplacement = `app.put('/api/recursos/config/:id', (req, res) => {
  const { disponibilidad, bloques_agrupados, horarios_exactos } = req.body;
  db.run("UPDATE recursos_config SET disponibilidad = COALESCE(?, disponibilidad), bloques_agrupados = COALESCE(?, bloques_agrupados), horarios_exactos = COALESCE(?, horarios_exactos) WHERE id = ?", 
    [disponibilidad ? JSON.stringify(disponibilidad) : null, bloques_agrupados ? JSON.stringify(bloques_agrupados) : null, horarios_exactos || null, req.params.id], function(err) {
    if (err) return res.status(500).json({error: err.message});
    res.json({ message: 'Configuración actualizada' });
  });
});`;

code = code.replace(putRegex, putReplacement);
fs.writeFileSync('server/index.js', code, 'utf8');
console.log('Ruta PUT actualizada con horarios_exactos');
