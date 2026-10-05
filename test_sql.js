const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/db/colegio.db');

db.run("INSERT INTO eventos (fecha, titulo, categoria, bloques, creador_email, cursos, externos) VALUES (?, ?, ?, ?, ?, ?, ?)",
    ['2026-10-02', 'Test', 'General', null, 'dev@colegio.edu', 'TODOS', '[]'], function(err) {
        if(err) console.error(err);
        else console.log('Insertado bien.');
    });
