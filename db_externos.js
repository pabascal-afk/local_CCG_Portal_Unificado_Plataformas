const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/db/colegio.db');

db.serialize(() => {
    db.run("ALTER TABLE eventos ADD COLUMN externos TEXT DEFAULT '[]'", function(err) {
        if (err && !err.message.includes("duplicate column")) {
            console.error("Error alterando tabla eventos:", err.message);
        } else {
            console.log("Columna externos agregada o ya existía en eventos.");
        }
    });
});

db.close();
