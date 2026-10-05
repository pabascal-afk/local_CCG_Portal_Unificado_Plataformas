const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('server/db/colegio.db');
db.serialize(() => {
    try {
        db.run("ALTER TABLE recursos_config ADD COLUMN horarios_exactos TEXT DEFAULT '08:00,08:45,09:30,10:15,11:00,11:45,12:30,13:15,14:00,14:45,15:30,16:15'");
        console.log("Columna horarios_exactos añadida");
    } catch(e) { console.log(e); }
});
db.close();
