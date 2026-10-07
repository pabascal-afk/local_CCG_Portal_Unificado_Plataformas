const fs = require('fs');
let code = fs.readFileSync('server/db/init_db.js', 'utf8');

if (!code.includes("CREATE TABLE IF NOT EXISTS config_global")) {
    const tableDef = `  \`CREATE TABLE IF NOT EXISTS config_global (
    clave TEXT PRIMARY KEY,
    valor TEXT
  )\`,`;
    code = code.replace("`CREATE TABLE IF NOT EXISTS config_topes (", tableDef + "\n  `CREATE TABLE IF NOT EXISTS config_topes (");
}

fs.writeFileSync('server/db/init_db.js', code, 'utf8');
console.log("init_db.js actualizado con config_global");
