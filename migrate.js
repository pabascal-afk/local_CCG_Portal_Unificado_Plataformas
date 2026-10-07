const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('server/db/colegio.db');

db.serialize(() => {
    db.run("ALTER TABLE evaluaciones ADD COLUMN estado_doc TEXT DEFAULT 'Pendiente'", (err) => {
        if(err && !err.message.includes('duplicate column')) console.log(err);
    });
    db.run("ALTER TABLE evaluaciones ADD COLUMN link_doc TEXT", (err) => {
        if(err && !err.message.includes('duplicate column')) console.log(err);
    });
    db.run("ALTER TABLE evaluaciones ADD COLUMN archivo_doc TEXT", (err) => {
        if(err && !err.message.includes('duplicate column')) console.log(err);
    });

    db.run(`CREATE TABLE IF NOT EXISTS coordinadores_areas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        nombre TEXT NOT NULL,
        curso_regla TEXT NOT NULL,
        asignatura_regla TEXT NOT NULL
    )`, (err) => {
        if(err) console.log(err);
        else console.log('Database schema updated');
    });
    
    db.get("SELECT count(*) as count FROM coordinadores_areas", (err, row) => {
        if (row && row.count === 0) {
            db.run("INSERT INTO coordinadores_areas (email, nombre, curso_regla, asignatura_regla) VALUES ('utp@colegio.edu', 'Coordinador General (Fallback)', '*', '*')");
        }
    });
});
