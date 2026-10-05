const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('server/db/colegio.db');

db.serialize(() => {
    db.all("SELECT * FROM horarios WHERE profesor LIKE '%(%'", (err, rows) => {
        if (err) throw err;
        
        let count = 0;
        rows.forEach(row => {
            const match = row.profesor.match(/^(.*?)\s*\((.*?)\)$/);
            if (match) {
                const nombreLimpio = match[1].trim();
                const asignaturaExtra = match[2].trim();
                const nuevaAsignatura = row.asignatura + " - " + asignaturaExtra;
                
                db.run("UPDATE horarios SET profesor = ?, asignatura = ? WHERE id = ?", [nombreLimpio, nuevaAsignatura, row.id], (err2) => {
                    if (err2) console.error(err2);
                    else count++;
                });
            }
        });
        
        // Use a timeout to wait for async db.run to finish before logging.
        setTimeout(() => {
            console.log(`Actualizados ${count} registros en la base de datos.`);
        }, 1000);
    });
});
