const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('server/db/colegio.db');
db.all("SELECT estado_doc, link_doc, archivo_doc FROM evaluaciones", (err, rows) => {
    console.log(err || 'Columns exist!');
});
