const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('server/db/colegio.db');

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS config_tipos_evaluacion (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT UNIQUE NOT NULL,
        es_prueba BOOLEAN NOT NULL DEFAULT 0
    )`);
    
    db.get("SELECT COUNT(*) as count FROM config_tipos_evaluacion", (err, row) => {
        if (!err && row.count === 0) {
            const stmt = db.prepare("INSERT INTO config_tipos_evaluacion (nombre, es_prueba) VALUES (?, ?)");
            stmt.run('📝 Prueba', 1);
            stmt.run('🗣️ Exposición Oral', 1);
            stmt.run('📂 Trabajo', 0);
            stmt.run('🔄 Ev. de Proceso', 0);
            stmt.run('⏱️ Quiz', 0);
            stmt.finalize();
            console.log("Tipos por defecto insertados.");
        } else {
            console.log("Tabla config_tipos_evaluacion ya existía y tiene datos.");
        }
    });
});
