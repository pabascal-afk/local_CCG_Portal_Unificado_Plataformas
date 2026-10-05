const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('server/db/colegio.db');
db.run("ALTER TABLE eventos ADD COLUMN recurso TEXT", (err) => {
    if(err && !err.message.includes('duplicate column')) console.error(err);
    else console.log("Added recurso column to eventos");
});
