/**
 * Servicio Centralizado de Asistencia Diaria y Notificaciones de Bloque 1
 * Conexión con Google Sheets, procesamiento de asistencias y envíos automáticos a las 12:00 PM
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const axios = require('axios');
const xlsx = require('xlsx');
const mailer = require('./mailer');
const auditoria = require('./auditoria');

const dbPath = path.join(__dirname, '..', 'db', 'colegio.db');
let db = null;

function getDb() {
    if (!db) {
        db = new sqlite3.Database(dbPath);
    }
    return db;
}

// Helpers de Promesas para SQLite
const queryGet = (sql, params = []) => new Promise((resolve, reject) => {
    getDb().get(sql, params, (err, row) => err ? reject(err) : resolve(row));
});

const queryAll = (sql, params = []) => new Promise((resolve, reject) => {
    getDb().all(sql, params, (err, rows) => err ? reject(err) : resolve(rows));
});

const queryRun = (sql, params = []) => new Promise((resolve, reject) => {
    getDb().run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
    });
});

// Normalización de textos
function normalizarTexto(str) {
    return (str || '')
        .toString()
        .toUpperCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .replace(/\s+/g, ' ');
}

// Normalización estricta de nombres de cursos para asegurar match perfecto
function normalizarCurso(str) {
    if (!str) return '';
    let s = normalizarTexto(str);
    s = s.replace(/º/g, '°');
    // Normalizar números a romanos en Enseñanza Media
    s = s.replace(/\b1(?:°|º)?\s*MEDIO\b/g, 'I° MEDIO')
         .replace(/\b2(?:°|º)?\s*MEDIO\b/g, 'II° MEDIO')
         .replace(/\b3(?:°|º)?\s*MEDIO\b/g, 'III° MEDIO')
         .replace(/\b4(?:°|º)?\s*MEDIO\b/g, 'IV° MEDIO');
    // Normalizar Enseñanza Básica
    s = s.replace(/\b([1-8])(?:°|º)?\s*BASICO\b/g, '$1° BASICO');
    return s.replace(/\s+/g, ' ').trim();
}

// Detecta si una celda corresponde al título de un curso del colegio
function detectarCursoEncabezado(valor) {
    if (!valor) return null;
    const norm = normalizarCurso(valor);
    const patronCurso = /^(KINDER\s+[AB]|[1-8]°\s+BASICO\s+[AB]|I{1,3}°\s+MEDIO\s+[AB]|IV°\s+MEDIO\s+[AB])$/i;
    if (patronCurso.test(norm)) return norm;
    return null;
}

// Cálculo de fecha y hora local exacta en Chile (Santiago UTC-3 / UTC-4)
function obtenerFechaHoraChile() {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('es-CL', {
        timeZone: 'America/Santiago',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        weekday: 'long',
        hour12: false
    });
    const parts = formatter.formatToParts(now);
    const map = {};
    parts.forEach(p => map[p.type] = p.value);

    const fecha = `${map.year}-${map.month}-${map.day}`;
    const hora = parseInt(map.hour, 10);
    const minuto = parseInt(map.minute, 10);
    const diaSemana = (map.weekday || '').toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return { fecha, hora, minuto, diaSemana, now };
}

// -------------------------------------------------------------
// 1. Inicialización de Tablas y Plantillas
// -------------------------------------------------------------
function inicializarTablasAsistencia(callback) {
    const database = getDb();
    database.serialize(() => {
        // Tabla de registros consolidados de asistencia por curso y fecha
        database.run(`CREATE TABLE IF NOT EXISTS asistencia_diaria (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fecha TEXT NOT NULL,
            curso TEXT NOT NULL,
            curso_normalizado TEXT NOT NULL,
            matricula_total INTEGER DEFAULT 0,
            presentes INTEGER DEFAULT 0,
            ausentes INTEGER DEFAULT 0,
            porcentaje REAL DEFAULT 0.0,
            alumnos_ausentes TEXT DEFAULT '[]',
            observaciones TEXT,
            origen TEXT DEFAULT 'google_sheets',
            actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(fecha, curso_normalizado) ON CONFLICT REPLACE
        )`);

        database.run(`CREATE INDEX IF NOT EXISTS idx_asist_fecha ON asistencia_diaria(fecha)`);
        database.run(`CREATE INDEX IF NOT EXISTS idx_asist_curso ON asistencia_diaria(curso_normalizado)`);

        // Tabla de registro de envíos a docentes de bloque 1
        database.run(`CREATE TABLE IF NOT EXISTS asistencia_envios_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fecha TEXT NOT NULL,
            profesor_email TEXT NOT NULL,
            profesor_nombre TEXT,
            cursos TEXT,
            estado TEXT DEFAULT 'Enviado',
            detalles TEXT,
            enviado_en DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        database.run(`CREATE INDEX IF NOT EXISTS idx_asist_envio ON asistencia_envios_log(fecha, profesor_email)`);

        // Tabla de configuración general del módulo de asistencia
        database.run(`CREATE TABLE IF NOT EXISTS asistencia_config (
            clave TEXT PRIMARY KEY,
            valor TEXT
        )`);

        // Valores iniciales por defecto
        const urlDefault = 'https://docs.google.com/spreadsheets/d/1jePX95x8YU5N8TTSGyiCTkXu3sQO7BwYiMktZDtoyFo/edit?gid=1052336650#gid=1052336650';
        database.run(`INSERT OR IGNORE INTO asistencia_config (clave, valor) VALUES ('sheet_url', ?)`, [urlDefault]);
        database.run(`INSERT OR IGNORE INTO asistencia_config (clave, valor) VALUES ('sheet_gid', '1052336650')`);
        database.run(`INSERT OR IGNORE INTO asistencia_config (clave, valor) VALUES ('hora_envio', '12:00')`);
        database.run(`INSERT OR IGNORE INTO asistencia_config (clave, valor) VALUES ('envio_automatico_activo', '1')`);

        // Plantilla oficial en plantillas_correo
        const plantillaAsistencia = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 650px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
  <!-- Encabezado Institucional -->
  <div style="background: linear-gradient(135deg, #1e3a8a 0%, #0284c7 100%); padding: 28px 24px; text-align: center; color: #ffffff;">
    <h2 style="margin: 0 0 6px 0; font-size: 1.35rem; font-weight: 700; letter-spacing: 0.5px;">Colegio Cerro Grande La Serena</h2>
    <p style="margin: 0; font-size: 0.95rem; opacity: 0.95; font-weight: 500;">Reporte Diario de Asistencia - Primer Bloque</p>
  </div>

  <div style="padding: 24px;">
    <p style="font-size: 1rem; color: #1e293b; margin-top: 0;">
      Estimado(a) <strong>{{profesor_nombre}}</strong>,
    </p>
    <p style="font-size: 0.92rem; color: #475569; line-height: 1.55;">
      A continuación te compartimos el resumen consolidado de asistencia correspondiente al <strong>primer bloque</strong> de hoy <strong>{{dia_semana}} {{fecha}}</strong> para los cursos en los que impartes clases:
    </p>

    <!-- Resumen Cards / Cursos -->
    <div style="margin: 20px 0;">
      {{cursos_tabla_html}}
    </div>

    <!-- Indicador General -->
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px; margin-top: 20px; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <span style="font-size: 0.82rem; color: #64748b; text-transform: uppercase; font-weight: 600; display: block;">Promedio General Tus Cursos</span>
        <span style="font-size: 1.15rem; font-weight: 700; color: #1e293b;">{{porcentaje_promedio}}% de Asistencia</span>
      </div>
      <div style="text-align: right;">
        <span style="font-size: 0.85rem; color: #16a34a; font-weight: 600;">Presentes: {{total_presentes}}</span> | 
        <span style="font-size: 0.85rem; color: #dc2626; font-weight: 600;">Ausentes: {{total_ausentes}}</span>
      </div>
    </div>

    <!-- Botón de Acción -->
    <div style="text-align: center; margin: 28px 0 10px 0;">
      <a href="{{enlace_plataforma}}" style="background-color: #0284c7; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 0.92rem; display: inline-block; box-shadow: 0 2px 8px rgba(2, 132, 199, 0.3);">
        Ver Asistencia Completa en la Plataforma
      </a>
    </div>
  </div>

  <div style="background-color: #f1f5f9; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 0.78rem; color: #64748b;">
    Este es un reporte automático generado a las 12:00 PM por la Plataforma Unificada del Colegio Cerro Grande.<br>
    Información sincronizada con el Libro de Asistencia Oficial.
  </div>
</div>
        `;

        database.run(`INSERT OR IGNORE INTO plantillas_correo 
            (clave, nombre, asunto, cuerpo_html, variables_disponibles, descripcion, modulo)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                'asistencia_resumen_bloque1',
                'Resumen Diario de Asistencia - Bloque 1',
                '📋 Resumen de Asistencia - {{fecha}} - Primer Bloque ({{cursos}})',
                plantillaAsistencia.trim(),
                JSON.stringify([
                    { var: 'profesor_nombre', desc: 'Nombre del docente asignado al primer bloque' },
                    { var: 'fecha', desc: 'Fecha del reporte (DD/MM/YYYY)' },
                    { var: 'dia_semana', desc: 'Día de la semana (Lunes, Martes, etc.)' },
                    { var: 'cursos', desc: 'Nombres de los cursos impartidos en bloque 1' },
                    { var: 'cursos_tabla_html', desc: 'Tarjetas HTML con el desglose de asistencia por curso' },
                    { var: 'total_presentes', desc: 'Suma de alumnos presentes en sus cursos' },
                    { var: 'total_ausentes', desc: 'Suma de alumnos ausentes en sus cursos' },
                    { var: 'porcentaje_promedio', desc: 'Porcentaje promedio de asistencia' },
                    { var: 'enlace_plataforma', desc: 'Enlace directo a la vista de asistencia' }
                ]),
                'Enviado automáticamente cada día a las 12:00 PM a los docentes que tienen clases en el bloque 1.',
                'Asistencia'
            ]
        );

        if (typeof callback === 'function') callback();
    });
}

// -------------------------------------------------------------
// 2. Gestión de Configuración
// -------------------------------------------------------------
async function obtenerConfiguracion() {
    const rows = await queryAll(`SELECT clave, valor FROM asistencia_config`);
    const config = {};
    rows.forEach(r => config[r.clave] = r.valor);
    return {
        sheet_url: config.sheet_url || 'https://docs.google.com/spreadsheets/d/1jePX95x8YU5N8TTSGyiCTkXu3sQO7BwYiMktZDtoyFo/edit?gid=1052336650#gid=1052336650',
        sheet_gid: config.sheet_gid || '1052336650',
        hora_envio: config.hora_envio || '12:00',
        envio_automatico_activo: config.envio_automatico_activo === '1'
    };
}

async function guardarConfiguracion(datos, usuario = null) {
    const { sheet_url, sheet_gid, hora_envio, envio_automatico_activo } = datos;

    if (sheet_url !== undefined) {
        await queryRun(`INSERT INTO asistencia_config (clave, valor) VALUES ('sheet_url', ?) ON CONFLICT(clave) DO UPDATE SET valor=excluded.valor`, [sheet_url]);
    }
    if (sheet_gid !== undefined) {
        await queryRun(`INSERT INTO asistencia_config (clave, valor) VALUES ('sheet_gid', ?) ON CONFLICT(clave) DO UPDATE SET valor=excluded.valor`, [sheet_gid]);
    }
    if (hora_envio !== undefined) {
        await queryRun(`INSERT INTO asistencia_config (clave, valor) VALUES ('hora_envio', ?) ON CONFLICT(clave) DO UPDATE SET valor=excluded.valor`, [hora_envio]);
    }
    if (envio_automatico_activo !== undefined) {
        const val = envio_automatico_activo ? '1' : '0';
        await queryRun(`INSERT INTO asistencia_config (clave, valor) VALUES ('envio_automatico_activo', ?) ON CONFLICT(clave) DO UPDATE SET valor=excluded.valor`, [val]);
    }

    auditoria.registrarAuditoria({
        usuario,
        modulo: 'Asistencia',
        accion: 'Guardar Configuración',
        descripcion: 'Se actualizó la configuración de la hoja Google Sheets y envíos de asistencia.',
        detalles: datos
    });

    return await obtenerConfiguracion();
}

// -------------------------------------------------------------
// 3. Procesamiento y Descarga desde Google Sheets
// -------------------------------------------------------------

// Extrae spreadsheetId y gid de cualquier URL de Google Sheets
function extraerIdsGoogleSheet(url) {
    if (!url || typeof url !== 'string') return null;

    // Patrón: /spreadsheets/d/([a-zA-Z0-9-_]+)
    const matchId = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    const spreadsheetId = matchId ? matchId[1] : null;

    // Gid: gid=([0-9]+)
    const matchGid = url.match(/[?&#]gid=([0-9]+)/);
    const gid = matchGid ? matchGid[1] : '0';

    if (!spreadsheetId) return null;
    return { spreadsheetId, gid };
}

// Convierte URL a endpoint CSV descargable
function construirUrlCsvGoogle(url, gidManual = null) {
    const ids = extraerIdsGoogleSheet(url);
    if (!ids) {
        // Podría ser ya una URL directa de exportación
        if (url.includes('output=csv') || url.includes('format=csv')) return url;
        return null;
    }
    const finalGid = gidManual || ids.gid || '0';
    return `https://docs.google.com/spreadsheets/d/${ids.spreadsheetId}/export?format=csv&gid=${finalGid}`;
}

/**
 * Parser inteligente de filas de asistencia (admite formatos de consolidado por curso, lista de alumnos o bloques matriciales por día)
 */
function procesarMatrizAsistencia(datosMatriz, fechaReferencia) {
    if (!Array.isArray(datosMatriz) || datosMatriz.length < 2) {
        throw new Error("El archivo no contiene suficientes filas de datos.");
    }

    const { fecha: hoyChile } = obtenerFechaHoraChile();
    const fechaFinal = fechaReferencia || hoyChile;
    const diaDelMes = parseInt(fechaFinal.split('-')[2], 10);

    const cursosConsolidados = new Map();

    // ------------------------------------------------------------------
    // ESTRATEGIA 1: DETECCIÓN DE BLOQUES MATRICIALES POR CURSO (Formato Google Sheets Colegio Cerro Grande)
    // Cada curso tiene su bloque: encabezado [Curso], fila de días [N°, Nombre, 2, 3, 4, ...],
    // lista de alumnos (True/False por día), y filas de TOTAL MATRÍCULA / Total Ausentes / Total Asistentes.
    // ------------------------------------------------------------------
    const indicesBloques = [];
    for (let r = 0; r < datosMatriz.length; r++) {
        const c = detectarCursoEncabezado(datosMatriz[r] ? datosMatriz[r][0] : null);
        if (c) {
            indicesBloques.push({ fila: r, curso: c });
        }
    }

    if (indicesBloques.length > 0) {
        for (let b = 0; b < indicesBloques.length; b++) {
            const bloque = indicesBloques[b];
            const filaInicio = bloque.fila;
            const filaFin = (b + 1 < indicesBloques.length) ? indicesBloques[b + 1].fila : datosMatriz.length;
            const cursoNombre = bloque.curso;

            // Fila siguiente suele ser N°, Nombre del Estudiante, 2, 3, 4, ... (días)
            const filaDias = datosMatriz[filaInicio + 1] || [];
            
            // Buscar la columna correspondiente al día
            let colDia = -1;
            for (let c = 2; c < filaDias.length; c++) {
                const val = (filaDias[c] || '').toString().trim();
                if (parseInt(val, 10) === diaDelMes) {
                    colDia = c;
                    break;
                }
            }

            // Si no encuentra el día exacto (por ser fin de semana, etc.), tomar la última columna de día disponible
            if (colDia === -1) {
                for (let c = filaDias.length - 1; c >= 2; c--) {
                    const num = parseInt((filaDias[c] || '').toString().trim(), 10);
                    if (!isNaN(num) && num > 0) {
                        colDia = c;
                        break;
                    }
                }
            }

            let matriculaTotal = 0;
            let ausentesCount = 0;
            let presentesCount = 0;
            const alumnosAusentes = [];

            // Recorrer los alumnos y totales del bloque
            for (let r = filaInicio + 2; r < filaFin; r++) {
                const row = datosMatriz[r] || [];
                const col0 = normalizarTexto(row[0] || '');
                const col1 = (row[1] || '').toString().trim();
                const col1Norm = normalizarTexto(col1);

                if (col1Norm.startsWith('TOTAL MATRICULA') || col0.startsWith('TOTAL MATRICULA')) {
                    if (colDia !== -1 && row[colDia]) matriculaTotal = parseInt(row[colDia], 10) || matriculaTotal;
                    continue;
                }
                if (col1Norm.startsWith('TOTAL AUSENTES') || col0.startsWith('TOTAL AUSENTES')) {
                    if (colDia !== -1 && row[colDia]) ausentesCount = parseInt(row[colDia], 10) || ausentesCount;
                    continue;
                }
                if (col1Norm.startsWith('TOTAL ASISTENTES') || col0.startsWith('TOTAL ASISTENTES')) {
                    if (colDia !== -1 && row[colDia]) presentesCount = parseInt(row[colDia], 10) || presentesCount;
                    continue;
                }
                if (col1Norm.startsWith('ASISTENCIA COMPLETA') || col1Norm.startsWith('HTTP')) {
                    continue;
                }

                // Es una fila de estudiante
                if (col1 && !col1Norm.includes('RETIRADO') && !col1Norm.startsWith('TOTAL')) {
                    const nombreEstudiante = col1.replace(/\(retirado\)/i, '').trim();
                    const estadoDia = colDia !== -1 ? (row[colDia] || '').toString().trim().toUpperCase() : '';
                    
                    // True = inasistencia registrada
                    const esAusente = estadoDia === 'TRUE' || estadoDia === 'VERDADERO' || estadoDia.startsWith('VERDADERO');
                    if (esAusente) {
                        alumnosAusentes.push(nombreEstudiante);
                    }
                }
            }

            if (!matriculaTotal) {
                matriculaTotal = presentesCount + ausentesCount;
            }
            if (ausentesCount === 0 && alumnosAusentes.length > 0) {
                ausentesCount = alumnosAusentes.length;
            }
            if (presentesCount === 0 && matriculaTotal > 0) {
                presentesCount = Math.max(0, matriculaTotal - ausentesCount);
            }

            const porcentaje = matriculaTotal > 0 ? Math.round((presentesCount / matriculaTotal) * 1000) / 10 : 0;

            cursosConsolidados.set(cursoNombre, {
                fecha: fechaFinal,
                curso: cursoNombre,
                curso_normalizado: cursoNombre,
                matricula_total: matriculaTotal,
                presentes: presentesCount,
                ausentes: ausentesCount,
                porcentaje,
                alumnos_ausentes: alumnosAusentes,
                observaciones: `Registro diario (Día ${colDia !== -1 ? filaDias[colDia] : diaDelMes})`
            });
        }

        if (cursosConsolidados.size > 0) {
            return Array.from(cursosConsolidados.values());
        }
    }

    // ------------------------------------------------------------------
    // ESTRATEGIA 2: TABLA CONSOLIDADA O LISTA DE ESTUDIANTES POR COLUMNAS
    // ------------------------------------------------------------------
    let headerRowIdx = -1;
    let headers = [];

    for (let r = 0; r < Math.min(6, datosMatriz.length); r++) {
        const row = datosMatriz[r] || [];
        const strRow = row.map(c => normalizarTexto(c));
        const tieneCurso = strRow.some(c => c.includes('CURSO') || c.includes('NIVEL') || c.includes('GRADO'));
        const tieneAsistencia = strRow.some(c => c.includes('ASIST') || c.includes('PRESENTE') || c.includes('AUSENTE') || c.includes('%') || c.includes('TOTAL') || c.includes('MATRICULA'));
        if (tieneCurso || tieneAsistencia) {
            headerRowIdx = r;
            headers = strRow;
            break;
        }
    }

    if (headerRowIdx === -1) {
        headerRowIdx = 0;
        headers = (datosMatriz[0] || []).map(c => normalizarTexto(c));
    }

    // Identificar índices de columnas
    let colCurso = -1;
    let colMatricula = -1;
    let colPresentes = -1;
    let colAusentes = -1;
    let colPorcentaje = -1;
    let colNombresAusentes = -1;
    let colAlumno = -1;
    let colEstado = -1;

    headers.forEach((h, idx) => {
        if (h.includes('CURSO') || h.includes('NIVEL') || h.includes('GRADO')) {
            if (colCurso === -1) colCurso = idx;
        } else if (h.includes('MATRICULA') || h.includes('TOTAL ALUM') || h.includes('TOTAL ESTUD') || h === 'TOTAL') {
            if (colMatricula === -1) colMatricula = idx;
        } else if (h.includes('PRESENTE') || h.includes('ASISTIERON') || h.includes('ASISTENCIA TOTAL')) {
            if (colPresentes === -1) colPresentes = idx;
        } else if (h.includes('AUSENTE') || h.includes('INASIST') || h.includes('FALTARON')) {
            if (colAusentes === -1) colAusentes = idx;
        } else if (h.includes('%') || h.includes('PORCENTAJE') || h.includes('ASISTENCIA %')) {
            if (colPorcentaje === -1) colPorcentaje = idx;
        } else if (h.includes('ALUMNOS AUSENTES') || h.includes('DETALLE AUSENTES') || h.includes('LISTA AUSENTES') || h.includes('ESTUDIANTES AUSENTES') || h.includes('INASISTENCIAS')) {
            if (colNombresAusentes === -1) colNombresAusentes = idx;
        } else if (h.includes('ALUMNO') || h.includes('ESTUDIANTE') || h.includes('NOMBRE')) {
            if (colAlumno === -1) colAlumno = idx;
        } else if (h.includes('ESTADO') || h.includes('CONDICION')) {
            if (colEstado === -1) colEstado = idx;
        }
    });

    // FORMATO A: Una fila por curso (Consolidado)
    if (colCurso !== -1 && (colPresentes !== -1 || colAusentes !== -1 || colMatricula !== -1 || colPorcentaje !== -1)) {
        for (let r = headerRowIdx + 1; r < datosMatriz.length; r++) {
            const row = datosMatriz[r] || [];
            const rawCurso = (row[colCurso] || '').toString().trim();
            if (!rawCurso || normalizarTexto(rawCurso).startsWith('TOTAL') || normalizarTexto(rawCurso).startsWith('PROMEDIO')) {
                continue;
            }

            const cursoNorm = normalizarCurso(rawCurso);
            const matricula = colMatricula !== -1 ? parseInt(row[colMatricula], 10) || 0 : 0;
            const presentes = colPresentes !== -1 ? parseInt(row[colPresentes], 10) || 0 : 0;
            const ausentes = colAusentes !== -1 ? parseInt(row[colAusentes], 10) || 0 : (matricula > presentes ? matricula - presentes : 0);
            
            let porcentaje = 0;
            if (colPorcentaje !== -1 && row[colPorcentaje] !== undefined && row[colPorcentaje] !== null && row[colPorcentaje] !== '') {
                const pVal = row[colPorcentaje].toString().replace('%', '').replace(',', '.').trim();
                porcentaje = parseFloat(pVal) || 0;
                if (porcentaje <= 1 && porcentaje > 0) porcentaje = Math.round(porcentaje * 1000) / 10;
            } else if (matricula > 0) {
                porcentaje = Math.round((presentes / matricula) * 1000) / 10;
            }

            let ausentesList = [];
            if (colNombresAusentes !== -1 && row[colNombresAusentes]) {
                const rawAus = row[colNombresAusentes].toString();
                ausentesList = rawAus.split(/[,;\n\r]+/).map(s => s.trim()).filter(Boolean);
            }

            cursosConsolidados.set(cursoNorm, {
                fecha: fechaFinal,
                curso: rawCurso,
                curso_normalizado: cursoNorm,
                matricula_total: matricula || (presentes + ausentes),
                presentes,
                ausentes,
                porcentaje,
                alumnos_ausentes: ausentesList,
                observaciones: ''
            });
        }
    } 
    // FORMATO B: Una fila por estudiante (Lista individual)
    else if (colCurso !== -1 && (colAlumno !== -1 || colEstado !== -1)) {
        for (let r = headerRowIdx + 1; r < datosMatriz.length; r++) {
            const row = datosMatriz[r] || [];
            const rawCurso = (row[colCurso] || '').toString().trim();
            const rawAlumno = colAlumno !== -1 ? (row[colAlumno] || '').toString().trim() : '';
            const rawEstado = colEstado !== -1 ? normalizarTexto(row[colEstado]) : 'PRESENTE';

            if (!rawCurso || !rawAlumno) continue;
            const cursoNorm = normalizarCurso(rawCurso);

            if (!cursosConsolidados.has(cursoNorm)) {
                cursosConsolidados.set(cursoNorm, {
                    fecha: fechaFinal,
                    curso: rawCurso,
                    curso_normalizado: cursoNorm,
                    matricula_total: 0,
                    presentes: 0,
                    ausentes: 0,
                    porcentaje: 0,
                    alumnos_ausentes: [],
                    observaciones: ''
                });
            }

            const item = cursosConsolidados.get(cursoNorm);
            item.matricula_total++;
            const esAusente = rawEstado.includes('AUSENTE') || rawEstado === 'A' || rawEstado.includes('INASIST') || rawEstado === 'TRUE';
            if (esAusente) {
                item.ausentes++;
                item.alumnos_ausentes.push(rawAlumno);
            } else {
                item.presentes++;
            }
        }

        for (const item of cursosConsolidados.values()) {
            if (item.matricula_total > 0) {
                item.porcentaje = Math.round((item.presentes / item.matricula_total) * 1000) / 10;
            }
        }
    } else {
        throw new Error("No se detectó un formato reconocible de asistencia (debe contener columnas de Curso y Asistencia/Alumnos).");
    }

    return Array.from(cursosConsolidados.values());
}

/**
 * Guarda o actualiza los registros en asistencia_diaria
 */
async function guardarRegistrosAsistencia(registros, origen = 'google_sheets') {
    if (!registros || registros.length === 0) return 0;

    let guardados = 0;
    for (const r of registros) {
        const ausentesJson = JSON.stringify(r.alumnos_ausentes || []);
        await queryRun(`
            INSERT INTO asistencia_diaria 
            (fecha, curso, curso_normalizado, matricula_total, presentes, ausentes, porcentaje, alumnos_ausentes, observaciones, origen, actualizado_en)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(fecha, curso_normalizado) DO UPDATE SET
                curso = excluded.curso,
                matricula_total = excluded.matricula_total,
                presentes = excluded.presentes,
                ausentes = excluded.ausentes,
                porcentaje = excluded.porcentaje,
                alumnos_ausentes = excluded.alumnos_ausentes,
                observaciones = excluded.observaciones,
                origen = excluded.origen,
                actualizado_en = CURRENT_TIMESTAMP
        `, [
            r.fecha,
            r.curso,
            r.curso_normalizado,
            r.matricula_total || 0,
            r.presentes || 0,
            r.ausentes || 0,
            r.porcentaje || 0.0,
            ausentesJson,
            r.observaciones || '',
            origen
        ]);
        guardados++;
    }
    return guardados;
}

/**
 * Descarga y sincroniza la asistencia desde Google Sheets
 */
async function descargarYProcesarGoogleSheet(urlCustom = null, gidCustom = null, fechaReferencia = null, usuario = null) {
    const config = await obtenerConfiguracion();
    const urlFinal = urlCustom || config.sheet_url;
    const gidFinal = gidCustom || config.sheet_gid;

    const csvUrl = construirUrlCsvGoogle(urlFinal, gidFinal);
    if (!csvUrl) {
        throw new Error("URL de Google Sheets inválida o no compatible.");
    }

    let csvData = '';
    try {
        const res = await axios.get(csvUrl, {
            timeout: 15000,
            responseType: 'arraybuffer',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ColegioCerroGrande/Platform 1.2.0'
            }
        });
        csvData = Buffer.from(res.data).toString('utf-8');
    } catch (e) {
        if (e.response && (e.response.status === 401 || e.response.status === 403)) {
            throw new Error("Google Sheets devolvió Acceso Denegado (401/403). La hoja debe estar configurada en Google Drive como 'Cualquier persona que tenga el vínculo (Lector)' o ser publicada en la web (Archivo > Compartir > Publicar en la web).");
        }
        throw new Error(`Error de conexión con Google Sheets: ${e.message}`);
    }

    if (csvData.includes('<!DOCTYPE html>') || csvData.includes('<html')) {
        throw new Error("Google Sheets devolvió una página de inicio de sesión en lugar del archivo CSV. Asegúrate de que la hoja tenga permisos de acceso público de lectura o esté publicada en la web.");
    }

    // Parsear el CSV a matriz usando xlsx
    const workbook = xlsx.read(csvData, { type: 'string' });
    const firstSheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheetName];
    const matriz = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    const registros = procesarMatrizAsistencia(matriz, fechaReferencia);
    const guardados = await guardarRegistrosAsistencia(registros, 'google_sheets');

    auditoria.registrarAuditoria({
        usuario,
        modulo: 'Asistencia',
        accion: 'Sincronizar Google Sheets',
        descripcion: `Sincronización exitosa desde Google Sheets: ${guardados} cursos actualizados para la fecha ${fechaReferencia || 'de hoy'}.`,
        detalles: { url: urlFinal, gid: gidFinal, cursos_guardados: guardados }
    });

    return {
        success: true,
        cursos_procesados: guardados,
        registros
    };
}

/**
 * Procesa un archivo Excel (.xlsx) o CSV subido manualmente
 */
async function procesarArchivoLocal(buffer, filename, fechaReferencia = null, usuario = null) {
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const firstSheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheetName];
    const matriz = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    const registros = procesarMatrizAsistencia(matriz, fechaReferencia);
    const guardados = await guardarRegistrosAsistencia(registros, `archivo_${filename}`);

    auditoria.registrarAuditoria({
        usuario,
        modulo: 'Asistencia',
        accion: 'Carga Manual Asistencia',
        descripcion: `Carga manual de asistencia (${filename}): ${guardados} cursos registrados.`,
        detalles: { archivo: filename, cursos_guardados: guardados }
    });

    return {
        success: true,
        cursos_procesados: guardados,
        registros
    };
}

// -------------------------------------------------------------
// 4. Consultas de Asistencia para Profesores y Administradores
// -------------------------------------------------------------

async function obtenerAsistenciaFecha(fecha) {
    const targetFecha = fecha || obtenerFechaHoraChile().fecha;
    const rows = await queryAll(`
        SELECT * FROM asistencia_diaria 
        WHERE fecha = ? 
        ORDER BY curso ASC
    `, [targetFecha]);

    const items = rows.map(r => {
        let ausentes = [];
        try { ausentes = JSON.parse(r.alumnos_ausentes || '[]'); } catch(e){}
        return {
            ...r,
            alumnos_ausentes: ausentes
        };
    });

    let totalMatricula = 0;
    let totalPresentes = 0;
    let totalAusentes = 0;

    items.forEach(i => {
        totalMatricula += i.matricula_total || 0;
        totalPresentes += i.presentes || 0;
        totalAusentes += i.ausentes || 0;
    });

    const porcentajeGlobal = totalMatricula > 0 ? Math.round((totalPresentes / totalMatricula) * 1000) / 10 : 0;

    return {
        fecha: targetFecha,
        total_cursos: items.length,
        total_matricula: totalMatricula,
        total_presentes: totalPresentes,
        total_ausentes: totalAusentes,
        porcentaje_global: porcentajeGlobal,
        cursos: items
    };
}

/**
 * Obtiene los docentes que tienen clases en el primer bloque del día actual (o del día especificado)
 */
async function obtenerCursosPrimerBloque(diaSemanaCustom = null, anno = 2026) {
    const { diaSemana: diaHoy } = obtenerFechaHoraChile();
    const diaConsulta = (diaSemanaCustom || diaHoy).toUpperCase().trim();

    // Consultar el horario del primer bloque para el día indicado
    const horarios = await queryAll(`
        SELECT curso, asignatura, profesor 
        FROM horarios 
        WHERE UPPER(dia) = ? AND bloque = 1 AND (anno = ? OR (anno IS NULL AND ? = 2026))
        ORDER BY curso ASC
    `, [diaConsulta, anno, anno]);

    // Obtener catálogo de usuarios para mapear profesor -> email
    const usuarios = await queryAll(`SELECT id, email, nombre, rol FROM usuarios`);
    const userMap = new Map();
    usuarios.forEach(u => {
        userMap.set(normalizarTexto(u.nombre), u);
        if (u.email) userMap.set(normalizarTexto(u.email.split('@')[0]), u);
    });

    // Mapeo docente -> lista de cursos en bloque 1
    const docentesMap = new Map();

    horarios.forEach(h => {
        const pNorm = normalizarTexto(h.profesor);
        let user = userMap.get(pNorm);

        // Fallback si no hay match directo por nombre
        if (!user) {
            for (const [uName, uObj] of userMap.entries()) {
                if (uName.length > 5 && (uName.includes(pNorm) || pNorm.includes(uName))) {
                    user = uObj;
                    break;
                }
            }
        }

        const email = user ? user.email.toLowerCase().trim() : null;
        const nombreDocente = user ? user.nombre : h.profesor;
        const key = email || pNorm;

        if (!docentesMap.has(key)) {
            docentesMap.set(key, {
                profesor_nombre: nombreDocente,
                profesor_email: email,
                profesor_horario: h.profesor,
                usuario_id: user ? user.id : null,
                cursos: []
            });
        }

        docentesMap.get(key).cursos.push({
            curso: h.curso,
            curso_normalizado: normalizarCurso(h.curso),
            asignatura: h.asignatura
        });
    });

    return Array.from(docentesMap.values());
}

// -------------------------------------------------------------
// 5. Generación y Envío de Resumen de Asistencia a Docentes (12:00 PM)
// -------------------------------------------------------------

async function enviarResumenesBloque1({ fecha = null, forzar = false, usuarioTrigger = null } = {}) {
    const { fecha: hoyChile, diaSemana } = obtenerFechaHoraChile();
    const fechaReporte = fecha || hoyChile;

    // Obtener los docentes que tuvieron clases en el Bloque 1 hoy
    const docentesBloque1 = await obtenerCursosPrimerBloque(diaSemana);
    if (!docentesBloque1 || docentesBloque1.length === 0) {
        return {
            fecha: fechaReporte,
            enviados: 0,
            omitidos: 0,
            mensaje: `No se encontraron docentes con clases programadas en el Bloque 1 para el día ${diaSemana}.`
        };
    }

    // Obtener los datos de asistencia cargados para esa fecha
    const asistenciaData = await obtenerAsistenciaFecha(fechaReporte);
    const mapaAsistencia = new Map();
    (asistenciaData.cursos || []).forEach(c => {
        mapaAsistencia.set(c.curso_normalizado, c);
    });

    let enviados = 0;
    let omitidos = 0;
    let errores = 0;
    const resultados = [];

    for (const doc of docentesBloque1) {
        if (!doc.profesor_email) {
            omitidos++;
            resultados.push({
                profesor: doc.profesor_nombre,
                estado: 'Omitido',
                motivo: 'Sin correo electrónico asignado'
            });
            continue;
        }

        // Si ya fue enviado hoy y no estamos forzando reenvío
        if (!forzar) {
            const previo = await queryGet(`
                SELECT id FROM asistencia_envios_log 
                WHERE fecha = ? AND LOWER(profesor_email) = ? AND estado = 'Enviado'
            `, [fechaReporte, doc.profesor_email.toLowerCase()]);

            if (previo) {
                omitidos++;
                resultados.push({
                    profesor: doc.profesor_nombre,
                    email: doc.profesor_email,
                    estado: 'Omitido',
                    motivo: 'Ya fue enviado previamente hoy'
                });
                continue;
            }
        }

        // Construir información de los cursos de este docente
        let totalPresentesDoc = 0;
        let totalAusentesDoc = 0;
        let totalMatriculaDoc = 0;
        let cursosNombres = [];
        let tarjetasCursosHtml = '';

        doc.cursos.forEach(c => {
            cursosNombres.push(c.curso);
            const asist = mapaAsistencia.get(c.curso_normalizado) || {
                matricula_total: 0,
                presentes: 0,
                ausentes: 0,
                porcentaje: 0,
                alumnos_ausentes: []
            };

            totalPresentesDoc += asist.presentes || 0;
            totalAusentesDoc += asist.ausentes || 0;
            totalMatriculaDoc += asist.matricula_total || 0;

            const badgeColor = asist.porcentaje >= 90 ? '#16a34a' : (asist.porcentaje >= 80 ? '#ca8a04' : '#dc2626');
            const listaAusentesStr = (asist.alumnos_ausentes && asist.alumnos_ausentes.length > 0)
                ? `<div style="margin-top: 8px; font-size: 0.8rem; color: #64748b;">
                     <strong>Ausentes registrados:</strong> ${asist.alumnos_ausentes.join(', ')}
                   </div>`
                : '<div style="margin-top: 6px; font-size: 0.78rem; color: #16a34a;">✓ 100% Asistencia / Sin ausencias reportadas</div>';

            tarjetasCursosHtml += `
              <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-bottom: 12px; background-color: #ffffff;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; margin-bottom: 8px;">
                  <strong style="font-size: 1rem; color: #1e3a8a;">${c.curso}</strong>
                  <span style="font-size: 0.82rem; color: #64748b; background: #f1f5f9; padding: 2px 8px; border-radius: 4px;">${c.asignatura}</span>
                </div>
                <div style="display: flex; gap: 15px; font-size: 0.88rem; margin: 6px 0;">
                  <span>Matrícula: <strong>${asist.matricula_total}</strong></span>
                  <span style="color: #16a34a;">Presentes: <strong>${asist.presentes}</strong></span>
                  <span style="color: #dc2626;">Ausentes: <strong>${asist.ausentes}</strong></span>
                  <span style="color: ${badgeColor}; font-weight: bold; margin-left: auto;">${asist.porcentaje}%</span>
                </div>
                ${listaAusentesStr}
              </div>
            `;
        });

        const porcentajePromedioDoc = totalMatriculaDoc > 0 
            ? Math.round((totalPresentesDoc / totalMatriculaDoc) * 1000) / 10 
            : 0;

        const enlacePlataforma = process.env.BASE_URL 
            ? `${process.env.BASE_URL}/asistencia.html` 
            : 'http://localhost:9000/asistencia.html';

        try {
            await mailer.enviarConPlantilla({
                clave: 'asistencia_resumen_bloque1',
                destinatario: doc.profesor_email,
                variables: {
                    profesor_nombre: doc.profesor_nombre,
                    fecha: fechaReporte,
                    dia_semana: diaSemana,
                    cursos: cursosNombres.join(', '),
                    cursos_tabla_html: tarjetasCursosHtml,
                    total_presentes: totalPresentesDoc,
                    total_ausentes: totalAusentesDoc,
                    porcentaje_promedio: porcentajePromedioDoc,
                    enlace_plataforma: enlacePlataforma
                },
                modulo: 'Asistencia'
            });

            await queryRun(`
                INSERT INTO asistencia_envios_log (fecha, profesor_email, profesor_nombre, cursos, estado, detalles)
                VALUES (?, ?, ?, ?, 'Enviado', ?)
            `, [
                fechaReporte,
                doc.profesor_email.toLowerCase(),
                doc.profesor_nombre,
                cursosNombres.join(', '),
                JSON.stringify({ cursos: doc.cursos, presentes: totalPresentesDoc, ausentes: totalAusentesDoc, porcentaje: porcentajePromedioDoc })
            ]);

            enviados++;
            resultados.push({
                profesor: doc.profesor_nombre,
                email: doc.profesor_email,
                cursos: cursosNombres,
                estado: 'Enviado'
            });
        } catch (eMail) {
            errores++;
            await queryRun(`
                INSERT INTO asistencia_envios_log (fecha, profesor_email, profesor_nombre, cursos, estado, detalles)
                VALUES (?, ?, ?, ?, 'Fallido', ?)
            `, [
                fechaReporte,
                doc.profesor_email.toLowerCase(),
                doc.profesor_nombre,
                cursosNombres.join(', '),
                JSON.stringify({ error: eMail.message })
            ]);

            resultados.push({
                profesor: doc.profesor_nombre,
                email: doc.profesor_email,
                estado: 'Fallido',
                error: eMail.message
            });
        }
    }

    auditoria.registrarAuditoria({
        usuario: usuarioTrigger,
        modulo: 'Asistencia',
        accion: 'Envío Resumen Bloque 1',
        descripcion: `Envío de resúmenes de asistencia Bloque 1 (${fechaReporte}): ${enviados} enviados, ${omitidos} omitidos, ${errores} fallidos.`,
        detalles: { fecha: fechaReporte, diaSemana, enviados, omitidos, errores }
    });

    return {
        fecha: fechaReporte,
        dia_semana: diaSemana,
        total_docentes_bloque1: docentesBloque1.length,
        enviados,
        omitidos,
        errores,
        resultados
    };
}

// -------------------------------------------------------------
// 6. Cron / Intervalo Automático a las 12:00 PM (Hora de Chile)
// -------------------------------------------------------------
let cronInterval = null;
let ultimoDiaEnvio = null;

function iniciarCronAsistencia() {
    if (cronInterval) return;

    console.log('[ASISTENCIA] Tarea programada de las 12:00 PM iniciada.');

    cronInterval = setInterval(async () => {
        try {
            const config = await obtenerConfiguracion();
            if (!config.envio_automatico_activo) return;

            const { fecha, hora, minuto, diaSemana } = obtenerFechaHoraChile();

            // Solo de Lunes a Viernes
            const esFinDeSemana = diaSemana === 'SABADO' || diaSemana === 'DOMINGO';
            if (esFinDeSemana) return;

            // Hora meta (por defecto 12:00)
            const [horaMeta, minMeta] = (config.hora_envio || '12:00').split(':').map(n => parseInt(n, 10));

            // Verificar si estamos en la ventana de envío (ej. 12:00 - 12:05) y no se ha ejecutado hoy
            if (hora === horaMeta && minuto >= minMeta && minuto <= (minMeta + 5)) {
                if (ultimoDiaEnvio === fecha) return; // Ya ejecutado hoy

                console.log(`[ASISTENCIA] Disparando envío automático de las ${config.hora_envio} para ${fecha} (${diaSemana})...`);
                ultimoDiaEnvio = fecha;

                // 1. Sincronizar Google Sheets primero si es posible
                try {
                    await descargarYProcesarGoogleSheet();
                } catch(eSync) {
                    console.warn('[ASISTENCIA] Advertencia al sincronizar Sheets antes del envío:', eSync.message);
                }

                // 2. Enviar los correos de resumen
                const resEnvio = await enviarResumenesBloque1({
                    fecha,
                    forzar: false,
                    usuarioTrigger: { email: 'sistema@colegiocerrogrande.cl', nombre: 'Sistema Automático (Cron 12:00 PM)', rol: 'Sistema' }
                });
                console.log(`[ASISTENCIA] Envío completado: ${resEnvio.enviados} enviados.`);
            }
        } catch (e) {
            console.error('[ASISTENCIA] Error en ciclo cron:', e.message);
        }
    }, 60 * 1000); // Chequeo cada 1 minuto
}

module.exports = {
    getDb,
    inicializarTablasAsistencia,
    obtenerFechaHoraChile,
    obtenerConfiguracion,
    guardarConfiguracion,
    extraerIdsGoogleSheet,
    construirUrlCsvGoogle,
    procesarMatrizAsistencia,
    guardarRegistrosAsistencia,
    descargarYProcesarGoogleSheet,
    procesarArchivoLocal,
    obtenerAsistenciaFecha,
    obtenerCursosPrimerBloque,
    enviarResumenesBloque1,
    iniciarCronAsistencia
};
