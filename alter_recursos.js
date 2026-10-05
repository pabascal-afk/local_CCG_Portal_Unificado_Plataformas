const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('server/db/colegio.db');
db.serialize(() => {
    try {
        db.run("ALTER TABLE recursos_config ADD COLUMN bloques_agrupados TEXT DEFAULT '[]'");
        console.log("Columna bloques_agrupados añadida");
    } catch(e) { console.log(e); }
});
db.close();
