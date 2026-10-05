const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/db/colegio.db');

db.serialize(() => {
    // 1. Añadir columna a usuarios (ignorando el error si ya existe)
    db.run("ALTER TABLE usuarios ADD COLUMN preferencias_mail TEXT DEFAULT '{\"nueva_reserva\": true, \"edicion_admin\": true, \"nuevo_aviso\": false, \"recordatorio_eval\": true}'", function(err) {
        if (err && !err.message.includes("duplicate column")) {
            console.error("Error alterando tabla usuarios:", err.message);
        } else {
            console.log("Columna preferencias_mail agregada o ya existía.");
        }
    });

    // 2. Crear tabla avisos_muro
    db.run(`CREATE TABLE IF NOT EXISTS avisos_muro (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT NOT NULL,
        mensaje TEXT NOT NULL,
        autor TEXT NOT NULL,
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        importancia TEXT DEFAULT 'Normal'
    )`, (err) => {
        if(err) console.error("Error creando tabla avisos_muro:", err.message);
        else console.log("Tabla avisos_muro creada exitosamente.");
    });
});

db.close();
