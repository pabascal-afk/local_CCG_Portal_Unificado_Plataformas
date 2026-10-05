const fs = require('fs');
let code = fs.readFileSync('server/index.js', 'utf8');

const regex = /db\.run\("UPDATE recursos_config SET disponibilidad = COALESCE\(\?, disponibilidad\), bloques_agrupados = COALESCE\(\?, bloques_agrupados\), horarios_exactos = COALESCE\(\?, horarios_exactos\), bloqueos_fechas = COALESCE\(\?, bloqueos_fechas\) WHERE id = \?", \s*\[disponibilidad \? JSON\.stringify\(disponibilidad\) : null, bloques_agrupados \? JSON\.stringify\(bloques_agrupados\) : null, horarios_exactos \|\| null, bloqueos_fechas \? JSON\.stringify\(bloqueos_fechas\) : null, req\.params\.id\]/g;

const replacement = `db.run("UPDATE recursos_config SET disponibilidad = COALESCE(?, disponibilidad), bloques_agrupados = COALESCE(?, bloques_agrupados), horarios_exactos = ?, bloqueos_fechas = COALESCE(?, bloqueos_fechas) WHERE id = ?", 
      [disponibilidad ? JSON.stringify(disponibilidad) : null, bloques_agrupados ? JSON.stringify(bloques_agrupados) : null, horarios_exactos !== undefined ? horarios_exactos : null, bloqueos_fechas ? JSON.stringify(bloqueos_fechas) : null, req.params.id]`;

code = code.replace(regex, replacement);

fs.writeFileSync('server/index.js', code, 'utf8');
console.log('Fixed COALESCE issue in PUT /api/recursos/config');
