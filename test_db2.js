const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('server/db/colegio.db');
db.all("SELECT * FROM config_global", (err, rows) => {
    console.log(err || rows);
});
