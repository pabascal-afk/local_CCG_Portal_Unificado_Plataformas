const xlsx = require('xlsx');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'server/db/colegio.db');
const db = new sqlite3.Database(dbPath);

const run = (query, params = []) => new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
        if(err) reject(err); else resolve(this.lastID);
    });
});

async function importar() {
    try {
        console.log("Iniciando importación...");

        // 1. Usuarios
        console.log("Importando Usuarios...");
        const wb1 = xlsx.readFile('RESPALDOS XLSX/CCG_Calendario 2.0.xlsx');
        const wsUsr = wb1.Sheets['Usuarios_Autorizados'];
        const datosUsr = xlsx.utils.sheet_to_json(wsUsr, {header: 1});
        for (let i = 1; i < datosUsr.length; i++) {
            const r = datosUsr[i];
            if (r[0]) {
                await run("INSERT OR IGNORE INTO usuarios (email, rol, nombre) VALUES (?, ?, ?)", [r[0], r[1]||'Profesor', r[2]||r[0]]);
            }
        }

        // 2. Config Topes
        console.log("Importando Topes...");
        const wsTopes = wb1.Sheets['Config_Topes'];
        const datosTopes = xlsx.utils.sheet_to_json(wsTopes, {header: 1});
        for (let i = 1; i < datosTopes.length; i++) {
            const r = datosTopes[i];
            if (r[0]) {
                await run("INSERT OR REPLACE INTO config_topes (curso, max_dia_escritas, max_dia_otras, max_sem_escritas, max_sem_total) VALUES (?, ?, ?, ?, ?)", 
                [r[0], r[1], r[2], r[3], r[4]]);
            }
        }

        // 3. Evaluaciones
        console.log("Importando Evaluaciones...");
        const wsEval = wb1.Sheets['Evaluaciones'];
        const datosEval = xlsx.utils.sheet_to_json(wsEval, {header: 1, raw: false, dateNF: 'yyyy-mm-dd'});
        for (let i = 1; i < datosEval.length; i++) {
            const r = datosEval[i];
            if (r[2]) { // Fecha de evaluacion
                const id = r[0] ? String(r[0]) : Math.random().toString(36).substr(2, 9);
                // raw: false means dates are parsed as strings using dateNF if it was a real date cell
                const fecha = r[2]; 
                await run("INSERT OR REPLACE INTO evaluaciones (id, fecha, curso, asignatura, tipo, recurso, profesor_email, profesor_nombre, detalles) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [id, fecha, r[3], r[4], r[5], r[9]||'', r[6], r[7], r[8]]);
            }
        }

        // 4. Horarios
        console.log("Importando Horarios...");
        await run("DELETE FROM horarios"); // Clear before import
        const wb2 = xlsx.readFile('RESPALDOS XLSX/CCG_Horarios.xlsx');
        const wsHor = wb2.Sheets['Base de Datos Final Horarios 20'];
        const datosHor = xlsx.utils.sheet_to_json(wsHor, {header: 1});
        for (let i = 1; i < datosHor.length; i++) {
            const r = datosHor[i];
            if (r[0] && r[1]) {
                await run("INSERT INTO horarios (curso, dia, bloque, asignatura, profesor) VALUES (?, ?, ?, ?, ?)",
                [r[0], r[1], parseInt(r[2]), r[5], r[6]]);
            }
        }

        // 5. Eventos Anuales
        console.log("Importando Calendario Anual...");
        await run("DELETE FROM eventos");
        const wb3 = xlsx.readFile('RESPALDOS XLSX/CALENDARIO ANUAL 2026 UTP .xlsx');
        const wsEv = wb3.Sheets['DatosWeb'];
        const datosEv = xlsx.utils.sheet_to_json(wsEv, {header: 1, raw: false, dateNF: 'yyyy-mm-dd'});
        for (let i = 1; i < datosEv.length; i++) {
            const r = datosEv[i];
            if (r[0]) {
                let bloquea = r[3] && String(r[3]).trim().toLowerCase() === 'si' ? 'TODOS' : null;
                if (r[4]) bloquea = r[4];
                await run("INSERT INTO eventos (fecha, titulo, categoria, bloques, creador_email) VALUES (?, ?, ?, ?, ?)",
                [r[0], r[1], r[2]||'General', bloquea, 'importado@colegio.edu']);
            }
        }

        console.log("¡Importación finalizada con éxito!");
        db.close();
    } catch (e) {
        console.error("Error:", e);
        db.close();
    }
}

importar();
