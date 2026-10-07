const fs = require('fs');
let code = fs.readFileSync('server/db/init_db.js', 'utf8');

code = code.replace("creado_en DATETIME DEFAULT CURRENT_TIMESTAMP", "creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,\n    estado_doc TEXT DEFAULT 'Pendiente',\n    link_doc TEXT,\n    archivo_doc TEXT");

if (!code.includes("CREATE TABLE IF NOT EXISTS coordinadores_areas")) {
    const tableDef = `  \`CREATE TABLE IF NOT EXISTS coordinadores_areas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    nombre TEXT NOT NULL,
    curso_regla TEXT NOT NULL,
    asignatura_regla TEXT NOT NULL
  )\`,`;
    code = code.replace("`CREATE TABLE IF NOT EXISTS config_topes (", tableDef + "\n  `CREATE TABLE IF NOT EXISTS config_topes (");
}

fs.writeFileSync('server/db/init_db.js', code, 'utf8');
console.log("init_db.js actualizado");
