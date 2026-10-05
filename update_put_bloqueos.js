const fs = require('fs');
let code = fs.readFileSync('server/index.js', 'utf8');

const putRegex = /app\.put\('\/api\/recursos\/config\/:id', \(req, res\) => \{\s*const \{ disponibilidad, bloques_agrupados, horarios_exactos \} = req\.body;\s*db\.run\("UPDATE recursos_config SET disponibilidad = COALESCE\(\?, disponibilidad\), bloques_agrupados = COALESCE\(\?, bloques_agrupados\), horarios_exactos = COALESCE\(\?, horarios_exactos\) WHERE id = \?", \s*\[disponibilidad \? JSON\.stringify\(disponibilidad\) : null, bloques_agrupados \? JSON\.stringify\(bloques_agrupados\) : null, horarios_exactos \|\| null, req\.params\.id\], function\(err\) \{/g;

const putReplacement = `app.put('/api/recursos/config/:id', (req, res) => {
  const { disponibilidad, bloques_agrupados, horarios_exactos, bloqueos_fechas } = req.body;
  db.run("UPDATE recursos_config SET disponibilidad = COALESCE(?, disponibilidad), bloques_agrupados = COALESCE(?, bloques_agrupados), horarios_exactos = COALESCE(?, horarios_exactos), bloqueos_fechas = COALESCE(?, bloqueos_fechas) WHERE id = ?", 
    [disponibilidad ? JSON.stringify(disponibilidad) : null, bloques_agrupados ? JSON.stringify(bloques_agrupados) : null, horarios_exactos || null, bloqueos_fechas ? JSON.stringify(bloqueos_fechas) : null, req.params.id], function(err) {`;

code = code.replace(putRegex, putReplacement);
fs.writeFileSync('server/index.js', code, 'utf8');
console.log('Ruta PUT actualizada con bloqueos_fechas');
