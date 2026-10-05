const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('server/db/colegio.db');
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS roles_config (id INTEGER PRIMARY KEY AUTOINCREMENT, nombre TEXT UNIQUE, permisos TEXT)");
    
    // Insert defaults
    const stmt = db.prepare("INSERT OR IGNORE INTO roles_config (nombre, permisos) VALUES (?, ?)");
    stmt.run("Profesor", JSON.stringify({ esAdminGeneral: false, puedeAgendarSinRestricciones: false }));
    stmt.run("Coordinación Pedagógica", JSON.stringify({ esAdminGeneral: false, puedeAgendarSinRestricciones: true }));
    stmt.run("Convivencia Escolar", JSON.stringify({ esAdminGeneral: false, puedeAgendarSinRestricciones: true }));
    stmt.run("Directivo General", JSON.stringify({ esAdminGeneral: true, puedeAgendarSinRestricciones: true }));
    stmt.run("Administrador", JSON.stringify({ esAdminGeneral: true, puedeAgendarSinRestricciones: true }));
    stmt.finalize();
    console.log("Tabla roles_config lista.");
});
db.close();
