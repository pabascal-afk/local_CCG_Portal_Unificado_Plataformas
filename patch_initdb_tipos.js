const fs = require('fs');
let code = fs.readFileSync('server/db/init_db.js', 'utf8');

const anchor = "CREATE TABLE IF NOT EXISTS config_topes";
const tableDef = `CREATE TABLE IF NOT EXISTS config_tipos_evaluacion (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT UNIQUE NOT NULL,
      es_prueba BOOLEAN NOT NULL DEFAULT 0
  );
  
  `;

code = code.replace(anchor, tableDef + anchor);

// Add default inserts to init_db as well
const insertAnchor = "INSERT OR IGNORE INTO config_global (clave, valor) VALUES ('emails_activados', 'true');";
const insertTipos = `
  db.run("INSERT OR IGNORE INTO config_tipos_evaluacion (nombre, es_prueba) VALUES ('📝 Prueba', 1)");
  db.run("INSERT OR IGNORE INTO config_tipos_evaluacion (nombre, es_prueba) VALUES ('🗣️ Exposición Oral', 1)");
  db.run("INSERT OR IGNORE INTO config_tipos_evaluacion (nombre, es_prueba) VALUES ('📂 Trabajo', 0)");
  db.run("INSERT OR IGNORE INTO config_tipos_evaluacion (nombre, es_prueba) VALUES ('🔄 Ev. de Proceso', 0)");
  db.run("INSERT OR IGNORE INTO config_tipos_evaluacion (nombre, es_prueba) VALUES ('⏱️ Quiz', 0)");
`;
code = code.replace(insertAnchor, insertAnchor + "\n" + insertTipos);

fs.writeFileSync('server/db/init_db.js', code, 'utf8');
console.log("init_db.js actualizado");
