/**
 * Procesador Local de Reportes de Libro Digital
 * 
 * Este script desacopla la lógica original de Google Sheets y utiliza SheetJS (xlsx)
 * y SQLite para procesar los reportes semanales en Node.js de forma ultra rápida.
 */

const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, '../server/db/colegio.db');
const db = new sqlite3.Database(dbPath);

function formatearFechaTexto(val) {
    if (val === null || val === undefined) return '';
    if (typeof val === 'number') {
        try {
            const dateObj = xlsx.SSF.parse_date_code(val);
            if (dateObj) {
                const d = String(dateObj.d).padStart(2, '0');
                const m = String(dateObj.m).padStart(2, '0');
                const y = dateObj.y;
                return `${d}/${m}/${y}`;
            }
        } catch (e) {}
    }
    const str = String(val).trim();
    const matchDDMM = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (matchDDMM) {
        return `${String(matchDDMM[1]).padStart(2, '0')}/${String(matchDDMM[2]).padStart(2, '0')}/${matchDDMM[3]}`;
    }
    const matchISO = str.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
    if (matchISO) {
        return `${String(matchISO[3]).padStart(2, '0')}/${String(matchISO[2]).padStart(2, '0')}/${matchISO[1]}`;
    }
    return str;
}

/**
 * Parsea un archivo Excel local y devuelve las filas extraídas.
 */
function parsearReporteExcel(filePath, blacklist = [], diasExcluidos = []) {
    const buffer = fs.readFileSync(filePath);
    const wb = xlsx.read(buffer, { type: 'buffer', cellDates: false, raw: false });
    const sheetName = wb.SheetNames[0];
    if (!sheetName) throw new Error('El archivo no contiene hojas de cálculo.');
    
    const sheet = wb.Sheets[sheetName];
    const rawData = xlsx.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: '' });
    
    if (!rawData || rawData.length < 3) {
        throw new Error('El archivo no cumple con el formato mínimo de 3 filas.');
    }
    
    const row0 = rawData[0] || [];
    const diasDetectados = [];
    
    for (let col = 1; col < row0.length; col += 5) {
        const fechaRaw = row0[col];
        if (fechaRaw) {
            const f = formatearFechaTexto(fechaRaw);
            if (f) diasDetectados.push({ colInicio: col, fecha: f });
        }
    }
    
    if (diasDetectados.length === 0) {
        for (let d = 0; d < 5; d++) {
            const col = 1 + (d * 5);
            if (col < row0.length && row0[col]) {
                const f = formatearFechaTexto(row0[col]);
                if (f) diasDetectados.push({ colInicio: col, fecha: f });
            }
        }
    }
    
    const blacklistNorm = (blacklist || []).map(b => String(b).trim().toLowerCase());
    const diasExcluidosNorm = (diasExcluidos || []).map(d => formatearFechaTexto(d));
    const nombreArchivo = path.basename(filePath);
    const filas = [];
    
    for (let i = 2; i < rawData.length; i++) {
        const row = rawData[i];
        const nombreProfesor = (row[0] || '').toString().trim();
        if (!nombreProfesor) continue;
        
        const profNorm = nombreProfesor.toLowerCase();
        if (blacklistNorm.includes(profNorm)) continue;
        
        for (const diaInfo of diasDetectados) {
            const col = diaInfo.colInicio;
            const fecha = diaInfo.fecha;
            if (diasExcluidosNorm.includes(fecha)) continue;
            
            const creadas = parseInt(row[col], 10) || 0;
            const requeridas = parseInt(row[col + 1], 10) || 0;
            const contenido = parseInt(row[col + 2], 10) || 0;
            const asistencia = parseInt(row[col + 3], 10) || 0;
            const firma = parseInt(row[col + 4], 10) || 0;
            
            if (requeridas > 0) {
                filas.push({
                    fecha,
                    profesor: nombreProfesor,
                    profesor_normalizado: profNorm,
                    creadas,
                    requeridas,
                    contenido,
                    asistencia,
                    firma,
                    critico: (creadas === 0) ? 1 : 0,
                    archivo_origen: nombreArchivo
                });
            }
        }
    }
    
    return { diasDetectados, filas };
}

/**
 * Guarda las filas en la base de datos SQLite con upsert atómico.
 */
function guardarEnBD(filas) {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run("BEGIN TRANSACTION");
            const stmt = db.prepare(`
                INSERT INTO libro_registros (
                    fecha, profesor, profesor_normalizado, creadas, requeridas,
                    contenido, asistencia, firma, critico, archivo_origen, actualizado_en
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(fecha, profesor_normalizado) DO UPDATE SET
                    profesor = excluded.profesor,
                    creadas = excluded.creadas,
                    requeridas = excluded.requeridas,
                    contenido = excluded.contenido,
                    asistencia = excluded.asistencia,
                    firma = excluded.firma,
                    critico = excluded.critico,
                    archivo_origen = excluded.archivo_origen,
                    actualizado_en = CURRENT_TIMESTAMP
            `);
            
            for (const f of filas) {
                stmt.run(
                    f.fecha, f.profesor, f.profesor_normalizado, f.creadas, f.requeridas,
                    f.contenido, f.asistencia, f.firma, f.critico, f.archivo_origen
                );
            }
            stmt.finalize();
            db.run("COMMIT", (err) => {
                if (err) reject(err);
                else resolve(filas.length);
            });
        });
    });
}

// Ejecución directa por CLI si se pasa un archivo como argumento: node procesador_libro.js reporte.xlsx
if (require.main === module) {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.log("Uso CLI: node procesador_libro.js <archivo1.xlsx> [archivo2.xlsx ...]");
        process.exit(0);
    }
    
    (async () => {
        console.log(`Iniciando procesamiento de ${args.length} archivo(s) en orden...`);
        for (let i = 0; i < args.length; i++) {
            const archivo = args[i];
            console.log(`[#${i + 1}] Procesando: ${archivo}...`);
            try {
                const { diasDetectados, filas } = parsearReporteExcel(archivo);
                const total = await guardarEnBD(filas);
                console.log(`    ✅ Éxito: ${diasDetectados.length} días detectados, ${total} registros procesados.`);
            } catch (e) {
                console.error(`    ❌ Error en ${archivo}: ${e.message}`);
            }
        }
        console.log("Procesamiento por CLI finalizado.");
        db.close();
    })();
}

module.exports = {
    formatearFechaTexto,
    parsearReporteExcel,
    guardarEnBD
};
