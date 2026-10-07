const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('server/db/colegio.db');
db.run("CREATE TABLE IF NOT EXISTS config_global (clave TEXT PRIMARY KEY, valor TEXT)", () => {
    db.run("INSERT OR IGNORE INTO config_global (clave, valor) VALUES ('emails_activados', 'true')", () => {
        console.log("Tabla de config global creada");
    });
});
