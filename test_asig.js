const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('server/db/colegio.db');
db.all("SELECT DISTINCT asignatura FROM evaluaciones WHERE asignatura LIKE '%ELECTIVO%' LIMIT 10", (err, rows) => console.log(err || rows));
