const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('server/db/colegio.db');
db.all("PRAGMA table_info(usuarios);", (err, rows) => {
    console.log(rows);
});
