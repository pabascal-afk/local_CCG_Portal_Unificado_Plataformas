const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/db/colegio.db');

db.get("SELECT sql FROM sqlite_master WHERE type='table' AND name='recursos_config'", (err, row) => {
    console.log(row.sql);
    db.close();
});
