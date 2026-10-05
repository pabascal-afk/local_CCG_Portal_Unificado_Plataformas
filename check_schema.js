const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/db/colegio.db');

db.get("SELECT sql FROM sqlite_master WHERE type='table' AND name='eventos'", (err, row) => {
    if (err) console.error(err.message);
    else console.log(row.sql);
    db.close();
});
