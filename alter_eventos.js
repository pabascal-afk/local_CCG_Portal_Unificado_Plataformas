const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('server/db/colegio.db');
db.serialize(() => {
    try {
        db.run("ALTER TABLE eventos ADD COLUMN cursos TEXT DEFAULT 'TODOS'");
        console.log("Columna cursos añadida a eventos");
    } catch(e) { console.log(e); }
});
db.close();
