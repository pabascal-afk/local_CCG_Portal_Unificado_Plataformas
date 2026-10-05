const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/db/colegio.db');

db.all("SELECT * FROM roles_config", (err, rows) => {
    console.log(rows);
});
