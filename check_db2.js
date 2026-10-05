const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('server/db/colegio.db');
db.all("SELECT * FROM evaluaciones LIMIT 5", (err, rows) => console.log(rows));
db.close();
