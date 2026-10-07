const fs = require('fs');
let code = fs.readFileSync('server/db/init_db.js', 'utf8');

if (!code.includes("INSERT OR IGNORE INTO config_global")) {
    const defaultVal = `\n    db.run("INSERT OR IGNORE INTO config_global (clave, valor) VALUES ('emails_activados', 'true')");\n`;
    code = code.replace("console.log('Base de datos inicializada');", defaultVal + "\n    console.log('Base de datos inicializada');");
}

fs.writeFileSync('server/db/init_db.js', code, 'utf8');
console.log("init_db.js default value");
