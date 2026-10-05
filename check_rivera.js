const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('server/db/colegio.db');
db.all("SELECT DISTINCT profesor FROM horarios WHERE profesor LIKE '%Rivera%'", (err, rows) => console.log(rows));
db.close();
