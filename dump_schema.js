const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('server/db/colegio.db');
db.all("SELECT name, sql FROM sqlite_master WHERE type='table';", (err, rows) => {
    console.log(JSON.stringify(rows, null, 2));
});
