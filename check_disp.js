const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('server/db/colegio.db');
db.all("SELECT id, disponibilidad FROM recursos_config WHERE id = 1", (err, rows) => console.log(rows));
db.close();
