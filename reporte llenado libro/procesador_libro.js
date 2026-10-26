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
    if (val instanceof Date) {
        const d = String(val.getDate()).padStart(2, '0');
        const m = String(val.getMonth() + 1).padStart(2, '0');
        const y = val.getFullYear();
        return `${d}/${m}/${y}`;
    }
    if (typeof val === 'number' || (!isNaN(Number(val)) && String(val).trim() !== '' && Number(val) > 30000 && Number(val) < 70000)) {
        try {
            const dateObj = xlsx.SSF.parse_date_code(Number(val));
            if (dateObj) {
                const d = String(dateObj.d).padStart(2, '0');
                const m = String(dateObj.m).padStart(2, '0');
                const y = dateObj.y;
                return `${d}/${m}/${y}`;
            }
        } catch (e) {}
    }
    const str = String(val).trim();
    const matchDDMM = str.match(/\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\b/);
    if (matchDDMM) {
        const d = String(matchDDMM[1]).padStart(2, '0');
        const m = String(matchDDMM[2]).padStart(2, '0');
        const y = matchDDMM[3];
        return `${d}/${m}/${y}`;
    }
    const matchISO = str.match(/\b(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})\b/);
    if (matchISO) {
        const y = matchISO[1];
        const m = String(matchISO[2]).padStart(2, '0');
        const d = String(matchISO[3]).padStart(2, '0');
        return `${d}/${m}/${y}`;
    }
    const matchYY = str.match(/\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2})\b/);
    if (matchYY) {
        const d = String(matchYY[1]).padStart(2, '0');
        const m = String(matchYY[2]).padStart(2, '0');
        let y = parseInt(matchYY[3], 10);
        y = y < 70 ? 2000 + y : 1900 + y;
        return `${d}/${m}/${y}`;
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

function normalizarTexto(str) {
    return (str || '')
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, ' ')
        .trim()
        .replace(/\s+/g, ' ');
}

function resolverCoincidencia(nombreReporte, listaUsuarios) {
    if (!nombreReporte) return null;
    const repNorm = normalizarTexto(nombreReporte);
    const repTokens = repNorm.split(' ').filter(t => t.length > 1);
    const repTokenSet = new Set(repTokens);

    const mapaPorNombre = new Map();
    listaUsuarios.forEach(u => {
        const normN = normalizarTexto(u.nombre);
        if (!mapaPorNombre.has(normN)) {
            mapaPorNombre.set(normN, u);
        } else {
            const existente = mapaPorNombre.get(normN);
            if ((existente.email || '').includes('noreply') && !(u.email || '').includes('noreply')) {
                mapaPorNombre.set(normN, u);
            }
        }
    });

    const usuariosUnicos = Array.from(mapaPorNombre.values());

    for (const u of usuariosUnicos) {
        if (normalizarTexto(u.nombre) === repNorm) {
            return { usuario: u, confianza: 1.0, metodo: 'exacto' };
        }
    }

    const candidatos = [];

    for (const u of usuariosUnicos) {
        const uNorm = normalizarTexto(u.nombre);
        const uTokens = uNorm.split(' ').filter(t => t.length > 1);
        if (uTokens.length === 0) continue;

        const tokensEncontrados = uTokens.filter(t => repTokenSet.has(t));
        const proporcionUsuario = tokensEncontrados.length / uTokens.length;

        if (proporcionUsuario === 1.0) {
            let bonusEmail = 0;
            if (u.email) {
                const prefix = u.email.split('@')[0].toLowerCase();
                if (repNorm.replace(/\s+/g, '').includes(prefix)) {
                    bonusEmail = 0.1;
                }
            }
            candidatos.push({
                usuario: u,
                score: 1.0 + (tokensEncontrados.length * 0.1) + bonusEmail,
                tokensCoincidentes: tokensEncontrados.length
            });
        }
    }

    if (candidatos.length === 1) {
        return { usuario: candidatos[0].usuario, confianza: 0.95, metodo: 'tokens_unico' };
    }

    if (candidatos.length > 1) {
        candidatos.sort((a, b) => b.score - a.score);
        if (candidatos[0].score > candidatos[1].score) {
            return { usuario: candidatos[0].usuario, confianza: 0.85, metodo: 'tokens_mejor' };
        }
    }

    return null;
}

/**
 * Guarda las filas en la base de datos SQLite con upsert atómico y resolución de nombres.
 */
function guardarEnBD(filas) {
    return new Promise((resolve, reject) => {
        db.all("SELECT id, nombre, email FROM usuarios", [], (errU, usuarios) => {
            if (errU) return reject(errU);
            db.all("SELECT * FROM libro_alias_docentes", [], (errA, aliasList) => {
                if (errA) aliasList = [];
                const aliasMap = new Map();
                (aliasList || []).forEach(a => aliasMap.set(normalizarTexto(a.nombre_reporte), a));

                db.serialize(() => {
                    db.run("BEGIN TRANSACTION");
                    const stmt = db.prepare(`
                        INSERT INTO libro_registros (
                            fecha, profesor, profesor_normalizado, creadas, requeridas,
                            contenido, asistencia, firma, critico, archivo_origen,
                            profesor_plataforma, profesor_email, usuario_id, actualizado_en
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                        ON CONFLICT(fecha, profesor_normalizado) DO UPDATE SET
                            profesor = excluded.profesor,
                            creadas = excluded.creadas,
                            requeridas = excluded.requeridas,
                            contenido = excluded.contenido,
                            asistencia = excluded.asistencia,
                            firma = excluded.firma,
                            critico = excluded.critico,
                            archivo_origen = excluded.archivo_origen,
                            profesor_plataforma = excluded.profesor_plataforma,
                            profesor_email = excluded.profesor_email,
                            usuario_id = excluded.usuario_id,
                            actualizado_en = CURRENT_TIMESTAMP
                    `);
                    
                    const stmtAlias = db.prepare(`
                        INSERT INTO libro_alias_docentes (
                            nombre_reporte, nombre_normalizado, usuario_id, nombre_plataforma, email, origen, actualizado_en
                        ) VALUES (?, ?, ?, ?, ?, 'auto', CURRENT_TIMESTAMP)
                        ON CONFLICT(nombre_reporte) DO NOTHING
                    `);

                    for (const f of filas) {
                        const norm = normalizarTexto(f.profesor);
                        let platNombre = null;
                        let mail = null;
                        let uId = null;

                        if (aliasMap.has(norm)) {
                            const al = aliasMap.get(norm);
                            platNombre = al.nombre_plataforma;
                            mail = al.email;
                            uId = al.usuario_id;
                        } else {
                            const match = resolverCoincidencia(f.profesor, usuarios);
                            if (match) {
                                platNombre = match.usuario.nombre;
                                mail = match.usuario.email;
                                uId = match.usuario.id;
                                aliasMap.set(norm, { nombre_plataforma: platNombre, email: mail, usuario_id: uId });
                                stmtAlias.run(f.profesor, norm, uId, platNombre, mail);
                            }
                        }

                        stmt.run(
                            f.fecha, f.profesor, f.profesor_normalizado, f.creadas, f.requeridas,
                            f.contenido, f.asistencia, f.firma, f.critico, f.archivo_origen,
                            platNombre, mail, uId
                        );
                    }
                    stmt.finalize();
                    stmtAlias.finalize();
                    db.run("COMMIT", (err) => {
                        if (err) reject(err);
                        else resolve(filas.length);
                    });
                });
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
