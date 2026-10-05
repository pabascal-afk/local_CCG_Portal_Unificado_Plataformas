const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('server/db/colegio.db');
db.all("SELECT * FROM evaluaciones", (err, rows) => {
    rows.forEach(r => {
        if (typeof r.profesor_nombre !== 'string' && r.profesor_nombre !== null) console.log("NO STRING:", r.profesor_nombre);
    });
});
db.close();
