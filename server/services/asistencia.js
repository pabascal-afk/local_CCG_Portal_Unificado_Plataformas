/**
 * Servicio Integral Nativo de Asistencia Escolar (SGE Unificado)
 * Gestiona matrícula por curso, toma de asistencia diaria en vivo,
 * planilla mensual (Libro de Clases), feriados/sábados extra, novedades,
 * exportación Excel (.xlsx) y PDF (.pdf), cron Bloque 1 (12:00 PM) y cron Mensual (Día 1 hábil 07:30 AM).
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');
const PDFDocument = require('pdfkit');
const mailer = require('./mailer');
const auditoria = require('./auditoria');

const dbPath = path.join(__dirname, '..', 'db', 'colegio.db');
const storageReportesDir = path.join(__dirname, '..', 'storage', 'reportes_asistencia');
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
    getDb().all(sql, params, (err, rows) => err ? reject(err) : resolve(rows || []));
});

const queryRun = (sql, params = []) => new Promise((resolve, reject) => {
    getDb().run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
    });
});

// Mutex secuencial para transacciones SQLite seguras sin colisiones
let writeLock = Promise.resolve();
function withWriteLock(fn) {
    const prev = writeLock;
    let release;
    writeLock = new Promise(resolve => { release = resolve; });
    return prev.then(async () => {
        try {
            return await fn();
        } finally {
            release();
        }
    });
}

// -------------------------------------------------------------
// Catálogo Canónico de Cursos (26 Cursos Oficiales) y Helpers
// -------------------------------------------------------------
const CURSOS_OFICIALES = [
    { legible: 'Kinder A', normalizado: 'KINDER A', nivel: 'Parvularia' },
    { legible: 'Kinder B', normalizado: 'KINDER B', nivel: 'Parvularia' },
    { legible: '1° Básico A', normalizado: '1° BASICO A', nivel: 'Básica' },
    { legible: '1° Básico B', normalizado: '1° BASICO B', nivel: 'Básica' },
    { legible: '2° Básico A', normalizado: '2° BASICO A', nivel: 'Básica' },
    { legible: '2° Básico B', normalizado: '2° BASICO B', nivel: 'Básica' },
    { legible: '3° Básico A', normalizado: '3° BASICO A', nivel: 'Básica' },
    { legible: '3° Básico B', normalizado: '3° BASICO B', nivel: 'Básica' },
    { legible: '4° Básico A', normalizado: '4° BASICO A', nivel: 'Básica' },
    { legible: '4° Básico B', normalizado: '4° BASICO B', nivel: 'Básica' },
    { legible: '5° Básico A', normalizado: '5° BASICO A', nivel: 'Básica' },
    { legible: '5° Básico B', normalizado: '5° BASICO B', nivel: 'Básica' },
    { legible: '6° Básico A', normalizado: '6° BASICO A', nivel: 'Básica' },
    { legible: '6° Básico B', normalizado: '6° BASICO B', nivel: 'Básica' },
    { legible: '7° Básico A', normalizado: '7° BASICO A', nivel: 'Básica' },
    { legible: '7° Básico B', normalizado: '7° BASICO B', nivel: 'Básica' },
    { legible: '8° Básico A', normalizado: '8° BASICO A', nivel: 'Básica' },
    { legible: '8° Básico B', normalizado: '8° BASICO B', nivel: 'Básica' },
    { legible: 'I° Medio A', normalizado: 'I° MEDIO A', nivel: 'Media' },
    { legible: 'I° Medio B', normalizado: 'I° MEDIO B', nivel: 'Media' },
    { legible: 'II° Medio A', normalizado: 'II° MEDIO A', nivel: 'Media' },
    { legible: 'II° Medio B', normalizado: 'II° MEDIO B', nivel: 'Media' },
    { legible: 'III° Medio A', normalizado: 'III° MEDIO A', nivel: 'Media' },
    { legible: 'III° Medio B', normalizado: 'III° MEDIO B', nivel: 'Media' },
    { legible: 'IV° Medio A', normalizado: 'IV° MEDIO A', nivel: 'Media' },
    { legible: 'IV° Medio B', normalizado: 'IV° MEDIO B', nivel: 'Media' }
];

const CURSOS_VALIDOS_SET = new Set(CURSOS_OFICIALES.map(c => c.normalizado));
const MAPA_CURSO_LEGIBLE = new Map(CURSOS_OFICIALES.map(c => [c.normalizado, c.legible]));
const MAPA_CURSO_ORDEN = new Map(CURSOS_OFICIALES.map((c, i) => [c.normalizado, i]));

const DIAS_SEMANA_ES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const DIAS_SEMANA_CORTOS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MESES_ES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

function normalizarTexto(str) {
    return (str || '')
        .toString()
        .toUpperCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .replace(/\s+/g, ' ');
}

function normalizarCurso(str) {
    if (!str) return '';
    let s = normalizarTexto(str);
    s = s.replace(/[º°]/g, '°');
    s = s.replace(/°(?=\S)/g, '° ');
    // Arábigos a romanos para Media
    s = s.replace(/\b1(?:\s*°)?\s*MEDIO\b/g, 'I° MEDIO')
         .replace(/\b2(?:\s*°)?\s*MEDIO\b/g, 'II° MEDIO')
         .replace(/\b3(?:\s*°)?\s*MEDIO\b/g, 'III° MEDIO')
         .replace(/\b4(?:\s*°)?\s*MEDIO\b/g, 'IV° MEDIO');
    // Asegurar formato estándar Media y Básica
    s = s.replace(/\b(I{1,3}|IV)(?:\s*°)?\s*MEDIO\b/g, '$1° MEDIO');
    s = s.replace(/\b([1-8])(?:\s*°)?\s*BASICO\b/g, '$1° BASICO');
    return s.replace(/\s+/g, ' ').trim();
}

function esCursoValido(str) {
    return CURSOS_VALIDOS_SET.has(normalizarCurso(str));
}

function formatearCursoLegible(str) {
    const norm = normalizarCurso(str);
    return MAPA_CURSO_LEGIBLE.get(norm) || (str ? String(str).trim() : '');
}

function ordenarPorCurso(items, campo = 'curso_normalizado') {
    return [...items].sort((a, b) => {
        const na = normalizarCurso(a[campo] || a.curso || '');
        const nb = normalizarCurso(b[campo] || b.curso || '');
        const ia = MAPA_CURSO_ORDEN.has(na) ? MAPA_CURSO_ORDEN.get(na) : 999;
        const ib = MAPA_CURSO_ORDEN.has(nb) ? MAPA_CURSO_ORDEN.get(nb) : 999;
        if (ia !== ib) return ia - ib;
        return na.localeCompare(nb);
    });
}

// Cálculo de fecha y hora local exacta en Chile (Santiago)
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
    const hora = parseInt(map.hour, 10) % 24;
    const minuto = parseInt(map.minute, 10);
    const diaSemana = (map.weekday || '').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return { fecha, hora, minuto, diaSemana, anno: parseInt(map.year, 10), now };
}

function parsearFechaLocal(fechaStr) {
    if (!fechaStr || !/^\d{4}-\d{2}-\d{2}$/.test(String(fechaStr).trim())) return null;
    const [y, m, d] = String(fechaStr).trim().split('-').map(n => parseInt(n, 10));
    const dt = new Date(y, m - 1, d, 12, 0, 0);
    if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) return null;
    return { anio: y, mes: m, dia: d, date: dt, dayOfWeek: dt.getDay() };
}

function formatearFechaISO(dateObj) {
    if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) return null;
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

async function obtenerAnnoActivoSistema() {
    try {
        const row = await queryGet(`SELECT valor FROM config_global WHERE clave = 'anno_activo_predeterminado'`);
        if (row && row.valor) return parseInt(row.valor, 10) || 2026;
    } catch (e) {}
    return 2026;
}

// -------------------------------------------------------------
// 1. Inicialización de Tablas, Configuración y Plantillas
// -------------------------------------------------------------
function inicializarTablasAsistencia(callback) {
    const database = getDb();
    database.serialize(() => {
        // Resumen consolidado diario por curso
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
            origen TEXT DEFAULT 'nativo',
            tomada INTEGER DEFAULT 1,
            registrado_por TEXT,
            registrado_nombre TEXT,
            actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(fecha, curso_normalizado) ON CONFLICT REPLACE
        )`);

        database.run("ALTER TABLE asistencia_diaria ADD COLUMN tomada INTEGER DEFAULT 1", () => {});
        database.run("ALTER TABLE asistencia_diaria ADD COLUMN registrado_por TEXT", () => {});
        database.run("ALTER TABLE asistencia_diaria ADD COLUMN registrado_nombre TEXT", () => {});

        database.run(`CREATE INDEX IF NOT EXISTS idx_asist_fecha ON asistencia_diaria(fecha)`);
        database.run(`CREATE INDEX IF NOT EXISTS idx_asist_curso ON asistencia_diaria(curso_normalizado)`);

        // Matrícula de estudiantes para toma nativa
        database.run(`CREATE TABLE IF NOT EXISTS asistencia_estudiantes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            nombre_normalizado TEXT NOT NULL,
            curso TEXT NOT NULL,
            curso_normalizado TEXT NOT NULL,
            orden INTEGER DEFAULT 0,
            retirado INTEGER DEFAULT 0,
            fecha_retiro TEXT,
            anno INTEGER NOT NULL DEFAULT 2026,
            creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
            actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(nombre_normalizado, curso_normalizado, anno)
        )`);

        database.run(`CREATE INDEX IF NOT EXISTS idx_asist_est_curso ON asistencia_estudiantes(curso_normalizado, anno, retirado)`);

        // Registros diarios de inasistencia/observación por alumno
        database.run(`CREATE TABLE IF NOT EXISTS asistencia_registros (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fecha TEXT NOT NULL,
            estudiante_id INTEGER NOT NULL,
            curso_normalizado TEXT NOT NULL,
            ausente INTEGER NOT NULL DEFAULT 1,
            observacion TEXT DEFAULT '',
            registrado_por TEXT,
            registrado_nombre TEXT,
            actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(fecha, estudiante_id),
            FOREIGN KEY (estudiante_id) REFERENCES asistencia_estudiantes(id) ON DELETE CASCADE
        )`);

        database.run(`CREATE INDEX IF NOT EXISTS idx_asist_reg_fecha_curso ON asistencia_registros(fecha, curso_normalizado)`);
        database.run(`CREATE INDEX IF NOT EXISTS idx_asist_reg_est_fecha ON asistencia_registros(estudiante_id, fecha)`);

        // Días especiales (Feriados y Sábados Extra)
        database.run(`CREATE TABLE IF NOT EXISTS asistencia_dias_especiales (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fecha TEXT UNIQUE NOT NULL,
            tipo TEXT NOT NULL,
            descripcion TEXT,
            origen TEXT DEFAULT 'manual',
            creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Reportes de novedades desde el formulario ("Reportar")
        database.run(`CREATE TABLE IF NOT EXISTS asistencia_novedades (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fecha TEXT NOT NULL,
            curso TEXT NOT NULL,
            curso_normalizado TEXT NOT NULL,
            mensaje TEXT NOT NULL,
            reportado_por_email TEXT NOT NULL,
            reportado_por_nombre TEXT,
            destinatarios TEXT DEFAULT '[]',
            estado TEXT DEFAULT 'Pendiente',
            revisado_por TEXT,
            revisado_en DATETIME,
            creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        database.run(`CREATE INDEX IF NOT EXISTS idx_asist_nov_fecha ON asistencia_novedades(fecha, estado)`);

        // Historial de envíos Bloque 1
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

        // Configuración del módulo
        database.run(`CREATE TABLE IF NOT EXISTS asistencia_config (
            clave TEXT PRIMARY KEY,
            valor TEXT
        )`);

        const destinatariosDefault = JSON.stringify([
            'pabascal@colegiocerrogrande.cl',
            'mguerrero@colegiocerrogrande.cl',
            'szepeda@colegiocerrogrande.cl',
            'pguerrero@colegiocerrogrande.cl',
            'paolapizarro@colegiocerrogrande.cl'
        ]);

        database.run(`INSERT OR IGNORE INTO asistencia_config (clave, valor) VALUES ('sheet_url', '')`);
        database.run(`INSERT OR IGNORE INTO asistencia_config (clave, valor) VALUES ('sheet_gid', '')`);
        database.run(`INSERT OR IGNORE INTO asistencia_config (clave, valor) VALUES ('hora_envio', '12:00')`);
        database.run(`INSERT OR IGNORE INTO asistencia_config (clave, valor) VALUES ('envio_automatico_activo', '1')`);
        database.run(`INSERT OR IGNORE INTO asistencia_config (clave, valor) VALUES ('hora_envio_mensual', '07:30')`);
        database.run(`INSERT OR IGNORE INTO asistencia_config (clave, valor) VALUES ('envio_mensual_activo', '0')`);
        database.run(`INSERT OR IGNORE INTO asistencia_config (clave, valor) VALUES ('ultimo_mes_reporte_enviado', '')`);
        database.run(`INSERT OR IGNORE INTO asistencia_config (clave, valor) VALUES ('correos_destinatarios_reporte', ?)`, [destinatariosDefault]);
        database.run(`INSERT OR IGNORE INTO asistencia_config (clave, valor) VALUES ('encargados_asistencia', '[]')`);
        database.run(`INSERT OR IGNORE INTO asistencia_config (clave, valor) VALUES ('permitir_toma_docentes', '0')`);
        database.run(`INSERT OR IGNORE INTO asistencia_config (clave, valor) VALUES ('permitir_editar_pasado_docentes', '0')`);

        // Sincronizar plantillas oficiales de Asistencia desde mailer.PLANTILLAS_DEFAULT
        const plantillasClaves = ['asistencia_resumen_bloque1', 'asistencia_reporte_novedad', 'asistencia_reporte_mensual'];
        plantillasClaves.forEach(clave => {
            const p = mailer.PLANTILLAS_DEFAULT && mailer.PLANTILLAS_DEFAULT[clave];
            if (!p) return;
            database.run(`INSERT OR IGNORE INTO plantillas_correo 
                (clave, modulo, nombre, descripcion, asunto, saludo_tipo, cuerpo_html, pie_tipo, variables_disponibles)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [p.clave, p.modulo, p.nombre, p.descripcion, p.asunto, p.saludo_tipo, p.cuerpo_html, p.pie_tipo, p.variables_disponibles]
            );
        });

        // Corregir plantilla heredada de Bloque 1 si conservaba el doble envoltorio HTML antiguo
        const pBloque1 = mailer.PLANTILLAS_DEFAULT && mailer.PLANTILLAS_DEFAULT.asistencia_resumen_bloque1;
        if (pBloque1) {
            database.run(
                `UPDATE plantillas_correo 
                 SET asunto = ?, saludo_tipo = ?, cuerpo_html = ?, pie_tipo = ?, variables_disponibles = ?, modulo = 'Asistencia'
                 WHERE clave = 'asistencia_resumen_bloque1' AND cuerpo_html LIKE '<div style="font-family: -apple-system%'`,
                [pBloque1.asunto, pBloque1.saludo_tipo, pBloque1.cuerpo_html, pBloque1.pie_tipo, pBloque1.variables_disponibles],
                () => {}
            );
        }

        if (typeof callback === 'function') callback();
    });
}

// -------------------------------------------------------------
// 2. Configuración y Permisos de Acceso
// -------------------------------------------------------------
function parsearListaEmails(val) {
    if (!val) return [];
    let arr = [];
    if (Array.isArray(val)) {
        arr = val;
    } else if (typeof val === 'string') {
        const trimmed = val.trim();
        if (trimmed.startsWith('[')) {
            try { arr = JSON.parse(trimmed); } catch (e) { arr = []; }
        } else {
            arr = trimmed.split(/[,;\n\r]+/);
        }
    }
    const clean = new Set();
    arr.forEach(item => {
        const em = String(item || '').toLowerCase().trim();
        if (em && em.includes('@')) clean.add(em);
    });
    return Array.from(clean);
}

async function obtenerConfiguracion() {
    const rows = await queryAll(`SELECT clave, valor FROM asistencia_config`);
    const config = {};
    rows.forEach(r => config[r.clave] = r.valor);

    return {
        hora_envio: config.hora_envio || '12:00',
        envio_automatico_activo: config.envio_automatico_activo === '1',
        hora_envio_mensual: config.hora_envio_mensual || '07:30',
        envio_mensual_activo: config.envio_mensual_activo === '1',
        ultimo_mes_reporte_enviado: config.ultimo_mes_reporte_enviado || '',
        correos_destinatarios_reporte: parsearListaEmails(config.correos_destinatarios_reporte),
        encargados_asistencia: parsearListaEmails(config.encargados_asistencia),
        permitir_toma_docentes: config.permitir_toma_docentes === '1',
        permitir_editar_pasado_docentes: config.permitir_editar_pasado_docentes === '1'
    };
}

async function guardarConfiguracion(datos, usuario = null) {
    const updates = {};
    if (datos.hora_envio !== undefined) updates.hora_envio = String(datos.hora_envio || '12:00').trim();
    if (datos.envio_automatico_activo !== undefined) updates.envio_automatico_activo = datos.envio_automatico_activo ? '1' : '0';
    if (datos.hora_envio_mensual !== undefined) updates.hora_envio_mensual = String(datos.hora_envio_mensual || '07:30').trim();
    if (datos.envio_mensual_activo !== undefined) updates.envio_mensual_activo = datos.envio_mensual_activo ? '1' : '0';
    if (datos.correos_destinatarios_reporte !== undefined) {
        updates.correos_destinatarios_reporte = JSON.stringify(parsearListaEmails(datos.correos_destinatarios_reporte));
    }
    if (datos.encargados_asistencia !== undefined) {
        updates.encargados_asistencia = JSON.stringify(parsearListaEmails(datos.encargados_asistencia));
    }
    if (datos.permitir_toma_docentes !== undefined) updates.permitir_toma_docentes = datos.permitir_toma_docentes ? '1' : '0';
    if (datos.permitir_editar_pasado_docentes !== undefined) updates.permitir_editar_pasado_docentes = datos.permitir_editar_pasado_docentes ? '1' : '0';

    for (const [clave, valor] of Object.entries(updates)) {
        await queryRun(
            `INSERT INTO asistencia_config (clave, valor) VALUES (?, ?) ON CONFLICT(clave) DO UPDATE SET valor=excluded.valor`,
            [clave, valor]
        );
    }

    auditoria.registrarAuditoria({
        usuario,
        modulo: 'Asistencia',
        accion: 'Guardar Configuración',
        descripcion: 'Se actualizó la configuración del módulo nativo de asistencia.',
        detalles: updates
    });

    return await obtenerConfiguracion();
}

async function evaluarPermisosAsistencia(user) {
    if (!user) {
        return {
            esAdmin: false,
            esCoordinacion: false,
            esInspectoria: false,
            esEncargado: false,
            esGestorAsistencia: false,
            puedeTomarAsistencia: false,
            puedeEditarPasado: false
        };
    }

    const rolStr = (user.rol || '').toLowerCase().trim();
    const email = (user.email || '').toLowerCase().trim();

    const esAdmin = rolStr.includes('admin') || rolStr.includes('directiv');
    const esCoordinacion = rolStr.includes('coordinaci');
    const esConvivencia = rolStr.includes('convivencia');
    const esInspectoriaRol = rolStr.includes('inspect');

    let permisosRol = {};
    try {
        const rowRol = await queryGet(`SELECT permisos FROM roles_config WHERE LOWER(nombre) = ?`, [rolStr]);
        if (rowRol && rowRol.permisos) {
            permisosRol = JSON.parse(rowRol.permisos);
        }
    } catch (e) {}

    const cfg = await obtenerConfiguracion();
    const esEncargado = Boolean(email && cfg.encargados_asistencia.includes(email));
    const esVisitante = Boolean(user.esVisitanteInstitucional);

    const esGestorAsistencia = !esVisitante && Boolean(
        esAdmin ||
        esCoordinacion ||
        esConvivencia ||
        esInspectoriaRol ||
        permisosRol.esAdminGeneral ||
        permisosRol.gestionarAsistencia ||
        esEncargado
    );

    const puedeTomarAsistencia = !esVisitante && Boolean(
        esGestorAsistencia ||
        permisosRol.tomarAsistencia ||
        cfg.permitir_toma_docentes
    );

    const puedeEditarPasado = !esVisitante && Boolean(
        esGestorAsistencia ||
        (puedeTomarAsistencia && cfg.permitir_editar_pasado_docentes)
    );

    const esAdminFinal = !esVisitante && Boolean(
        esAdmin ||
        esCoordinacion ||
        permisosRol.esAdminGeneral
    );

    return {
        esAdmin: esAdminFinal,
        esCoordinacion,
        esInspectoria: esInspectoriaRol,
        esEncargado,
        esGestorAsistencia,
        puedeTomarAsistencia,
        puedeEditarPasado
    };
}

// -------------------------------------------------------------
// 3. Calendario Hábil, Feriados y Sábados Extra
// -------------------------------------------------------------
async function verificarDiaAsistencia(fechaStr) {
    const info = parsearFechaLocal(fechaStr);
    if (!info) {
        throw new Error(`Formato de fecha inválido (${fechaStr}). Usa AAAA-MM-DD.`);
    }

    const especial = await queryGet(`SELECT * FROM asistencia_dias_especiales WHERE fecha = ?`, [fechaStr]);
    const dow = info.dayOfWeek;
    const diaNombre = DIAS_SEMANA_ES[dow];
    const diaCorto = DIAS_SEMANA_CORTOS[dow];
    const mesCorto = MESES_ES[info.mes - 1];
    const fechaLegible = `${diaNombre} ${info.dia} de ${mesCorto} ${info.anio}`;
    const esFinDeSemana = (dow === 0 || dow === 6);

    if (especial && especial.tipo === 'FERIADO') {
        return {
            fecha: fechaStr,
            diaSemana: diaNombre,
            diaSemanaCorto: diaCorto,
            fechaLegible,
            habil: false,
            esFeriado: true,
            esExtra: false,
            esFinDeSemana,
            motivo: especial.descripcion || 'Feriado / Día sin actividades'
        };
    }

    if (especial && especial.tipo === 'CLASE_EXTRA') {
        return {
            fecha: fechaStr,
            diaSemana: diaNombre,
            diaSemanaCorto: diaCorto,
            fechaLegible,
            habil: true,
            esFeriado: false,
            esExtra: true,
            esFinDeSemana,
            motivo: especial.descripcion || 'Clase extra autorizada'
        };
    }

    if (esFinDeSemana) {
        return {
            fecha: fechaStr,
            diaSemana: diaNombre,
            diaSemanaCorto: diaCorto,
            fechaLegible,
            habil: false,
            esFeriado: false,
            esExtra: false,
            esFinDeSemana: true,
            motivo: `${diaNombre} (Fin de semana no laborable)`
        };
    }

    return {
        fecha: fechaStr,
        diaSemana: diaNombre,
        diaSemanaCorto: diaCorto,
        fechaLegible,
        habil: true,
        esFeriado: false,
        esExtra: false,
        esFinDeSemana: false,
        motivo: ''
    };
}

async function obtenerDiasMesAsistencia(anio, mes) {
    const y = parseInt(anio, 10);
    const m = parseInt(mes, 10);
    const diasEnMes = new Date(y, m, 0).getDate();
    const inicioStr = `${y}-${String(m).padStart(2, '0')}-01`;
    const finStr = `${y}-${String(m).padStart(2, '0')}-${String(diasEnMes).padStart(2, '0')}`;

    const especiales = await queryAll(
        `SELECT * FROM asistencia_dias_especiales WHERE fecha >= ? AND fecha <= ?`,
        [inicioStr, finStr]
    );
    const mapaEsp = new Map();
    especiales.forEach(e => mapaEsp.set(e.fecha, e));

    const dias = [];
    for (let d = 1; d <= diasEnMes; d++) {
        const fechaStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const dt = new Date(y, m - 1, d, 12, 0, 0);
        const dow = dt.getDay();
        const esp = mapaEsp.get(fechaStr);
        const esDiaHabilSemana = (dow !== 0 && dow !== 6);
        const esExtra = Boolean(esp && esp.tipo === 'CLASE_EXTRA');
        const esFeriado = Boolean(esp && esp.tipo === 'FERIADO');

        if (esDiaHabilSemana || esExtra) {
            dias.push({
                dia: d,
                fecha: fechaStr,
                diaCorto: DIAS_SEMANA_CORTOS[dow],
                diaSemana: DIAS_SEMANA_ES[dow],
                esFeriado,
                esExtra,
                motivo: esp ? esp.descripcion : ''
            });
        }
    }
    return dias;
}

async function listarDiasEspeciales(anio = null) {
    if (anio) {
        return await queryAll(
            `SELECT * FROM asistencia_dias_especiales WHERE fecha LIKE ? ORDER BY fecha ASC`,
            [`${anio}-%`]
        );
    }
    return await queryAll(`SELECT * FROM asistencia_dias_especiales ORDER BY fecha ASC`);
}

async function agregarDiaEspecial({ fecha, tipo, descripcion = '', origen = 'manual' }, usuario = null) {
    if (!parsearFechaLocal(fecha)) {
        throw new Error('Fecha inválida. Debe tener formato AAAA-MM-DD.');
    }
    const tipoNorm = String(tipo || '').toUpperCase().trim();
    if (tipoNorm !== 'FERIADO' && tipoNorm !== 'CLASE_EXTRA') {
        throw new Error("El tipo debe ser 'FERIADO' o 'CLASE_EXTRA'.");
    }

    await queryRun(
        `INSERT INTO asistencia_dias_especiales (fecha, tipo, descripcion, origen)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(fecha) DO UPDATE SET tipo=excluded.tipo, descripcion=excluded.descripcion, origen=excluded.origen`,
        [fecha, tipoNorm, String(descripcion || '').trim(), origen]
    );

    auditoria.registrarAuditoria({
        usuario,
        modulo: 'Asistencia',
        accion: 'Configurar Día Especial',
        descripcion: `Día ${fecha} configurado como ${tipoNorm}${descripcion ? `: ${descripcion}` : ''}.`,
        detalles: { fecha, tipo: tipoNorm, descripcion }
    });

    return await queryGet(`SELECT * FROM asistencia_dias_especiales WHERE fecha = ?`, [fecha]);
}

async function eliminarDiaEspecial(id, usuario = null) {
    const prev = await queryGet(`SELECT * FROM asistencia_dias_especiales WHERE id = ?`, [id]);
    if (!prev) return false;
    await queryRun(`DELETE FROM asistencia_dias_especiales WHERE id = ?`, [id]);

    auditoria.registrarAuditoria({
        usuario,
        modulo: 'Asistencia',
        accion: 'Eliminar Día Especial',
        descripcion: `Se eliminó la marca ${prev.tipo} de la fecha ${prev.fecha}.`,
        detalles: prev
    });
    return true;
}

function parsearFechaEventoFlexible(rawFecha, titulo = '') {
    if (!rawFecha) return [];
    const s = String(rawFecha).trim().split(' ')[0];
    let anio = 2026;
    let mes = null;
    let dia = null;

    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
        const p = s.split('-').map(Number);
        anio = p[0]; mes = p[1]; dia = p[2];
    } else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) {
        // Eventos históricos vienen en DD/MM/YYYY o M/D/YYYY según creador
        const p = s.split('/').map(Number);
        anio = p[2];
        if (p[1] > 12) {
            // M/D/YYYY
            mes = p[0]; dia = p[1];
        } else if (p[0] > 12) {
            // DD/MM/YYYY
            dia = p[0]; mes = p[1];
        } else if (rawFecha.includes('12:00:00')) {
            // En tabla eventos, strings con ' 12:00:00' provienen de US format M/D/YYYY
            mes = p[0]; dia = p[1];
        } else {
            dia = p[0]; mes = p[1];
        }
    }

    if (!mes || !dia || mes < 1 || mes > 12 || dia < 1 || dia > 31) return [];

    // Detectar rangos tipo "[21-22]" o "[14-18]" dentro del mismo mes
    const mRango = String(titulo || '').match(/\[(\d{1,2})-(\d{1,2})\]/);
    if (mRango) {
        const dIni = parseInt(mRango[1], 10);
        const dFin = parseInt(mRango[2], 10);
        const fechas = [];
        if (dFin >= dIni && (dFin - dIni) <= 15 && dIni === dia) {
            for (let d = dIni; d <= dFin; d++) {
                const f = `${anio}-${String(mes).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                if (parsearFechaLocal(f)) fechas.push(f);
            }
            if (fechas.length > 0) return fechas;
        }
    }

    const fUnica = `${anio}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    return parsearFechaLocal(fUnica) ? [fUnica] : [];
}

async function importarFeriadosDesdeEventos(anio = 2026, usuario = null) {
    const rows = await queryAll(`SELECT fecha, titulo FROM eventos WHERE UPPER(categoria) = 'FERIADO'`);
    let importados = 0;

    for (const ev of rows) {
        const fechas = parsearFechaEventoFlexible(ev.fecha, ev.titulo);
        for (const f of fechas) {
            if (anio && !f.startsWith(`${anio}-`)) continue;
            const res = await queryRun(
                `INSERT OR IGNORE INTO asistencia_dias_especiales (fecha, tipo, descripcion, origen) VALUES (?, 'FERIADO', ?, 'calendario_eventos')`,
                [f, (ev.titulo || 'Feriado').trim()]
            );
            if (res.changes > 0) importados++;
        }
    }

    auditoria.registrarAuditoria({
        usuario,
        modulo: 'Asistencia',
        accion: 'Importar Feriados Calendario',
        descripcion: `Se importaron ${importados} feriados desde el Calendario Académico (${anio}).`,
        detalles: { anio, importados }
    });

    return { importados };
}

// -------------------------------------------------------------
// 4. Matrícula y Estudiantes (CRUD)
// -------------------------------------------------------------
async function listarEstudiantes({ curso = null, incluirRetirados = true, busqueda = '', anno = null } = {}) {
    const annoFinal = parseInt(anno || await obtenerAnnoActivoSistema(), 10);
    let sql = `SELECT * FROM asistencia_estudiantes WHERE anno = ?`;
    const params = [annoFinal];

    if (curso && curso !== 'todos') {
        sql += ` AND curso_normalizado = ?`;
        params.push(normalizarCurso(curso));
    }
    if (!incluirRetirados) {
        sql += ` AND retirado = 0`;
    }
    if (busqueda && busqueda.trim()) {
        sql += ` AND nombre_normalizado LIKE ?`;
        params.push(`%${normalizarTexto(busqueda)}%`);
    }

    sql += ` ORDER BY orden ASC, nombre ASC`;
    const rows = await queryAll(sql, params);
    return ordenarPorCurso(rows, 'curso_normalizado');
}

async function crearEstudiante({ nombre, curso, orden = null, anno = null }, usuario = null) {
    const nombreClean = String(nombre || '').trim();
    if (nombreClean.length < 2) {
        throw new Error('El nombre del estudiante es obligatorio.');
    }
    const cursoNorm = normalizarCurso(curso);
    if (!esCursoValido(cursoNorm)) {
        throw new Error(`Curso no válido (${curso}). Debe corresponder a uno de los 26 cursos oficiales.`);
    }
    const cursoLegible = formatearCursoLegible(cursoNorm);
    const nombreNorm = normalizarTexto(nombreClean);
    const annoFinal = parseInt(anno || await obtenerAnnoActivoSistema(), 10);

    let ordenFinal = orden !== null && orden !== undefined ? parseInt(orden, 10) : null;
    if (!ordenFinal || isNaN(ordenFinal)) {
        const maxRow = await queryGet(
            `SELECT MAX(orden) as max_o FROM asistencia_estudiantes WHERE curso_normalizado = ? AND anno = ?`,
            [cursoNorm, annoFinal]
        );
        ordenFinal = (maxRow && maxRow.max_o ? maxRow.max_o : 0) + 1;
    }

    const res = await queryRun(
        `INSERT INTO asistencia_estudiantes (nombre, nombre_normalizado, curso, curso_normalizado, orden, retirado, anno)
         VALUES (?, ?, ?, ?, ?, 0, ?)`,
        [nombreClean, nombreNorm, cursoLegible, cursoNorm, ordenFinal, annoFinal]
    );

    const creado = await queryGet(`SELECT * FROM asistencia_estudiantes WHERE id = ?`, [res.lastID]);
    auditoria.registrarAuditoria({
        usuario,
        modulo: 'Asistencia',
        accion: 'Crear Estudiante',
        entidad: 'asistencia_estudiantes',
        entidad_id: String(res.lastID),
        descripcion: `Estudiante agregado en matrícula: "${nombreClean}" (${cursoLegible}).`,
        detalles: creado
    });
    return creado;
}

async function actualizarEstudiante(id, datos, usuario = null) {
    const actual = await queryGet(`SELECT * FROM asistencia_estudiantes WHERE id = ?`, [id]);
    if (!actual) throw new Error('Estudiante no encontrado.');

    const nombreClean = datos.nombre !== undefined ? String(datos.nombre).trim() : actual.nombre;
    if (nombreClean.length < 2) throw new Error('El nombre del estudiante no puede quedar vacío.');

    const cursoNorm = datos.curso !== undefined ? normalizarCurso(datos.curso) : actual.curso_normalizado;
    if (!esCursoValido(cursoNorm)) throw new Error(`Curso inválido: ${datos.curso}`);
    const cursoLegible = formatearCursoLegible(cursoNorm);

    const ordenFinal = datos.orden !== undefined ? parseInt(datos.orden, 10) || actual.orden : actual.orden;
    const retiradoFinal = datos.retirado !== undefined ? (datos.retirado ? 1 : 0) : actual.retirado;

    let fechaRetiroFinal = actual.fecha_retiro;
    if (datos.retirado !== undefined) {
        if (retiradoFinal === 1 && !actual.retirado) {
            fechaRetiroFinal = datos.fecha_retiro || obtenerFechaHoraChile().fecha;
        } else if (retiradoFinal === 0) {
            fechaRetiroFinal = null;
        }
    } else if (datos.fecha_retiro !== undefined) {
        fechaRetiroFinal = datos.fecha_retiro || null;
    }

    await queryRun(
        `UPDATE asistencia_estudiantes
         SET nombre = ?, nombre_normalizado = ?, curso = ?, curso_normalizado = ?,
             orden = ?, retirado = ?, fecha_retiro = ?, actualizado_en = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [nombreClean, normalizarTexto(nombreClean), cursoLegible, cursoNorm, ordenFinal, retiradoFinal, fechaRetiroFinal, id]
    );

    // Si cambió de curso y hay registros del día de hoy, mantener consistencia de asistencia_diaria
    const hoy = obtenerFechaHoraChile().fecha;
    if (cursoNorm !== actual.curso_normalizado || retiradoFinal !== actual.retirado) {
        try {
            const dActual = await queryGet(`SELECT tomada FROM asistencia_diaria WHERE fecha = ? AND curso_normalizado = ?`, [hoy, actual.curso_normalizado]);
            if (dActual && dActual.tomada) await recalcularResumenCursoFecha(actual.curso_normalizado, hoy, { tomada: 1, usuario, origen: 'matricula' });
            if (cursoNorm !== actual.curso_normalizado) {
                const dNuevo = await queryGet(`SELECT tomada FROM asistencia_diaria WHERE fecha = ? AND curso_normalizado = ?`, [hoy, cursoNorm]);
                if (dNuevo && dNuevo.tomada) await recalcularResumenCursoFecha(cursoNorm, hoy, { tomada: 1, usuario, origen: 'matricula' });
            }
        } catch (e) {}
    }

    const actualizado = await queryGet(`SELECT * FROM asistencia_estudiantes WHERE id = ?`, [id]);
    auditoria.registrarAuditoria({
        usuario,
        modulo: 'Asistencia',
        accion: retiradoFinal !== actual.retirado ? (retiradoFinal ? 'Retirar Estudiante' : 'Reincorporar Estudiante') : 'Actualizar Estudiante',
        entidad: 'asistencia_estudiantes',
        entidad_id: String(id),
        descripcion: `Estudiante actualizado: "${nombreClean}" (${cursoLegible})${retiradoFinal ? ' [RETIRADO]' : ''}.`,
        detalles: { antes: actual, despues: actualizado }
    });
    return actualizado;
}

// -------------------------------------------------------------
// 5. Toma de Asistencia Nativa y Resumen Materializado
// -------------------------------------------------------------
async function obtenerEstudiantesActivosCursoFecha(cursoNorm, fecha, anno) {
    return await queryAll(
        `SELECT * FROM asistencia_estudiantes
         WHERE curso_normalizado = ? AND anno = ?
           AND (retirado = 0 OR (retirado = 1 AND fecha_retiro IS NOT NULL AND fecha_retiro > ?))
         ORDER BY orden ASC, id ASC`,
        [cursoNorm, anno, fecha]
    );
}

async function recalcularResumenCursoFecha(cursoNorm, fecha, { tomada = 1, usuario = null, origen = 'nativo' } = {}) {
    const parsed = parsearFechaLocal(fecha);
    const anno = parsed ? parsed.anio : await obtenerAnnoActivoSistema();
    const cursoLegible = formatearCursoLegible(cursoNorm);

    const activos = await obtenerEstudiantesActivosCursoFecha(cursoNorm, fecha, anno);
    const matriculaTotal = activos.length;
    const activosIds = new Set(activos.map(a => a.id));

    const regsAusentes = await queryAll(
        `SELECT r.estudiante_id, e.nombre 
         FROM asistencia_registros r
         INNER JOIN asistencia_estudiantes e ON e.id = r.estudiante_id
         WHERE r.fecha = ? AND r.curso_normalizado = ? AND r.ausente = 1
         ORDER BY e.orden ASC, e.nombre ASC`,
        [fecha, cursoNorm]
    );

    const alumnosAusentes = regsAusentes
        .filter(r => activosIds.has(r.estudiante_id))
        .map(r => r.nombre);

    const ausentesCount = alumnosAusentes.length;
    const presentesCount = Math.max(0, matriculaTotal - ausentesCount);
    const porcentaje = matriculaTotal > 0 ? Math.round((presentesCount / matriculaTotal) * 1000) / 10 : 0;

    const uEmail = usuario && usuario.email ? usuario.email.toLowerCase() : null;
    const uNombre = usuario && usuario.nombre ? usuario.nombre : (uEmail ? uEmail.split('@')[0] : null);

    await queryRun(`
        INSERT INTO asistencia_diaria 
        (fecha, curso, curso_normalizado, matricula_total, presentes, ausentes, porcentaje, alumnos_ausentes, observaciones, origen, tomada, registrado_por, registrado_nombre, actualizado_en)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, '', ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(fecha, curso_normalizado) DO UPDATE SET
            curso = excluded.curso,
            matricula_total = excluded.matricula_total,
            presentes = excluded.presentes,
            ausentes = excluded.ausentes,
            porcentaje = excluded.porcentaje,
            alumnos_ausentes = excluded.alumnos_ausentes,
            origen = excluded.origen,
            tomada = excluded.tomada,
            registrado_por = COALESCE(excluded.registrado_por, asistencia_diaria.registrado_por),
            registrado_nombre = COALESCE(excluded.registrado_nombre, asistencia_diaria.registrado_nombre),
            actualizado_en = CURRENT_TIMESTAMP
    `, [
        fecha,
        cursoLegible,
        cursoNorm,
        matriculaTotal,
        presentesCount,
        ausentesCount,
        porcentaje,
        JSON.stringify(alumnosAusentes),
        origen,
        tomada ? 1 : 0,
        uEmail,
        uNombre
    ]);

    return {
        fecha,
        curso: cursoLegible,
        curso_normalizado: cursoNorm,
        matricula_total: matriculaTotal,
        presentes: presentesCount,
        ausentes: ausentesCount,
        porcentaje,
        alumnos_ausentes: alumnosAusentes,
        tomada: Boolean(tomada),
        registrado_por: uEmail,
        registrado_nombre: uNombre
    };
}

async function obtenerEstadoCursosDia(fechaStr = null, annoCustom = null) {
    const fechaFinal = fechaStr || obtenerFechaHoraChile().fecha;
    const parsed = parsearFechaLocal(fechaFinal);
    const anno = parseInt(annoCustom || (parsed ? parsed.anio : await obtenerAnnoActivoSistema()), 10);

    const diaInfo = await verificarDiaAsistencia(fechaFinal);

    const conteos = await queryAll(
        `SELECT curso_normalizado, COUNT(*) as matricula_activa
         FROM asistencia_estudiantes
         WHERE anno = ? AND (retirado = 0 OR (retirado = 1 AND fecha_retiro IS NOT NULL AND fecha_retiro > ?))
         GROUP BY curso_normalizado`,
        [anno, fechaFinal]
    );
    const mapaMatricula = new Map(conteos.map(c => [c.curso_normalizado, c.matricula_activa]));

    const diarios = await queryAll(`SELECT * FROM asistencia_diaria WHERE fecha = ?`, [fechaFinal]);
    const mapaDiario = new Map(diarios.map(d => [d.curso_normalizado, d]));

    const cursos = CURSOS_OFICIALES.map(c => {
        const matActiva = mapaMatricula.get(c.normalizado) || 0;
        const d = mapaDiario.get(c.normalizado);
        const tomada = Boolean(d && d.tomada !== 0);
        return {
            curso: c.legible,
            curso_normalizado: c.normalizado,
            nivel: c.nivel,
            matricula_total: d ? d.matricula_total : matActiva,
            presentes: d ? d.presentes : 0,
            ausentes: d ? d.ausentes : 0,
            porcentaje: d ? d.porcentaje : 0,
            tomada,
            registrado_nombre: d ? d.registrado_nombre : null,
            actualizado_en: d ? d.actualizado_en : null
        };
    });

    return {
        fecha: fechaFinal,
        dia_info: diaInfo,
        total_cursos: cursos.length,
        cursos_tomados: cursos.filter(c => c.tomada).length,
        cursos
    };
}

async function obtenerFormularioCurso(curso, fechaStr = null, annoCustom = null) {
    const cursoNorm = normalizarCurso(curso);
    if (!esCursoValido(cursoNorm)) {
        throw new Error(`Curso no reconocido: ${curso}`);
    }

    const fechaFinal = fechaStr || obtenerFechaHoraChile().fecha;
    const hoyChile = obtenerFechaHoraChile().fecha;
    const esFuturo = fechaFinal > hoyChile;
    const parsed = parsearFechaLocal(fechaFinal);
    const anno = parseInt(annoCustom || (parsed ? parsed.anio : await obtenerAnnoActivoSistema()), 10);
    const diaInfo = await verificarDiaAsistencia(fechaFinal);

    const activos = await obtenerEstudiantesActivosCursoFecha(cursoNorm, fechaFinal, anno);
    const regs = await queryAll(
        `SELECT estudiante_id, ausente, observacion FROM asistencia_registros WHERE fecha = ? AND curso_normalizado = ?`,
        [fechaFinal, cursoNorm]
    );
    const mapaReg = new Map(regs.map(r => [r.estudiante_id, r]));

    const resumenDiario = await queryGet(
        `SELECT * FROM asistencia_diaria WHERE fecha = ? AND curso_normalizado = ?`,
        [fechaFinal, cursoNorm]
    );

    const alumnos = activos.map(a => {
        const reg = mapaReg.get(a.id);
        return {
            id: a.id,
            orden: a.orden,
            nombre: a.nombre,
            ausente: Boolean(reg && reg.ausente === 1),
            observacion: reg ? (reg.observacion || '') : ''
        };
    });

    const ausentesCount = alumnos.filter(a => a.ausente).length;
    const presentesCount = Math.max(0, alumnos.length - ausentesCount);
    const habilFinal = diaInfo.habil && !esFuturo;
    const motivoBloqueoFinal = esFuturo
        ? 'No se puede registrar asistencia en fechas futuras.'
        : (diaInfo.habil ? '' : diaInfo.motivo);

    return {
        curso: formatearCursoLegible(cursoNorm),
        curso_normalizado: cursoNorm,
        fecha: fechaFinal,
        dia_info: diaInfo,
        esFuturo,
        esFeriado: diaInfo.esFeriado,
        esFinDeSemana: diaInfo.esFinDeSemana && !diaInfo.esExtra,
        habil: habilFinal,
        motivoBloqueo: motivoBloqueoFinal,
        tomada: Boolean(resumenDiario && resumenDiario.tomada !== 0),
        matricula_total: alumnos.length,
        presentes: presentesCount,
        ausentes: ausentesCount,
        porcentaje: alumnos.length > 0 ? Math.round((presentesCount / alumnos.length) * 1000) / 10 : 0,
        registrado_nombre: resumenDiario ? resumenDiario.registrado_nombre : null,
        actualizado_en: resumenDiario ? resumenDiario.actualizado_en : null,
        alumnos
    };
}

async function guardarAsistenciaCurso({ curso, fecha = null, ausentesIds = [], observacionesMap = {}, usuario = null }) {
    const cursoNorm = normalizarCurso(curso);
    if (!esCursoValido(cursoNorm)) {
        throw new Error(`Curso no reconocido: ${curso}`);
    }
    const fechaFinal = fecha || obtenerFechaHoraChile().fecha;
    const hoyChile = obtenerFechaHoraChile().fecha;
    if (fechaFinal > hoyChile) {
        throw new Error(`No se puede registrar asistencia en una fecha futura (${fechaFinal}).`);
    }
    const diaInfo = await verificarDiaAsistencia(fechaFinal);
    if (!diaInfo.habil) {
        throw new Error(`No se puede registrar asistencia el ${fechaFinal}: ${diaInfo.motivo}.`);
    }

    const parsed = parsearFechaLocal(fechaFinal);
    const anno = parsed ? parsed.anio : await obtenerAnnoActivoSistema();
    const activos = await obtenerEstudiantesActivosCursoFecha(cursoNorm, fechaFinal, anno);
    const activosSet = new Set(activos.map(a => a.id));
    const ausentesSet = new Set((ausentesIds || []).map(id => parseInt(id, 10)).filter(id => activosSet.has(id)));

    const uEmail = usuario && usuario.email ? usuario.email.toLowerCase() : null;
    const uNombre = usuario && usuario.nombre ? usuario.nombre : (uEmail ? uEmail.split('@')[0] : null);

    const resumen = await withWriteLock(async () => {
        await queryRun('BEGIN TRANSACTION');
        try {
            // Limpiar marcas previas del curso en esa fecha (y de sus alumnos activos si hubo cambio de curso)
            await queryRun(
                `DELETE FROM asistencia_registros WHERE fecha = ? AND curso_normalizado = ?`,
                [fechaFinal, cursoNorm]
            );

            for (const est of activos) {
                const esAusente = ausentesSet.has(est.id) ? 1 : 0;
                const obs = observacionesMap && observacionesMap[est.id] ? String(observacionesMap[est.id]).trim() : '';
                if (esAusente === 1 || obs.length > 0) {
                    await queryRun(
                        `INSERT INTO asistencia_registros (fecha, estudiante_id, curso_normalizado, ausente, observacion, registrado_por, registrado_nombre, actualizado_en)
                         VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                         ON CONFLICT(fecha, estudiante_id) DO UPDATE SET
                            curso_normalizado=excluded.curso_normalizado,
                            ausente=excluded.ausente,
                            observacion=excluded.observacion,
                            registrado_por=excluded.registrado_por,
                            registrado_nombre=excluded.registrado_nombre,
                            actualizado_en=CURRENT_TIMESTAMP`,
                        [fechaFinal, est.id, cursoNorm, esAusente, obs, uEmail, uNombre]
                    );
                }
            }

            const resCurso = await recalcularResumenCursoFecha(cursoNorm, fechaFinal, {
                tomada: 1,
                usuario,
                origen: 'nativo'
            });

            await queryRun('COMMIT');
            return resCurso;
        } catch (err) {
            await queryRun('ROLLBACK').catch(() => {});
            throw err;
        }
    });

    auditoria.registrarAuditoria({
        usuario,
        modulo: 'Asistencia',
        accion: 'Guardar Asistencia Diaria',
        entidad: 'asistencia_diaria',
        entidad_id: `${fechaFinal}_${cursoNorm}`,
        descripcion: `Asistencia registrada para ${resumen.curso} (${fechaFinal}): ${resumen.presentes}/${resumen.matricula_total} presentes (${resumen.ausentes} ausentes, ${resumen.porcentaje}%).`,
        detalles: resumen
    });

    return resumen;
}

async function toggleCeldaAsistencia({ estudianteId, fecha, ausente, observacion = '', usuario = null }) {
    const est = await queryGet(`SELECT * FROM asistencia_estudiantes WHERE id = ?`, [estudianteId]);
    if (!est) throw new Error('Estudiante no encontrado.');
    const fechaFinal = String(fecha || '').trim();
    const hoyChile = obtenerFechaHoraChile().fecha;
    if (fechaFinal > hoyChile) {
        throw new Error(`No se puede registrar asistencia en una fecha futura (${fechaFinal}).`);
    }
    const diaInfo = await verificarDiaAsistencia(fechaFinal);
    if (!diaInfo.habil) {
        throw new Error(`Día bloqueado (${diaInfo.motivo}). No se puede editar asistencia.`);
    }

    const uEmail = usuario && usuario.email ? usuario.email.toLowerCase() : null;
    const uNombre = usuario && usuario.nombre ? usuario.nombre : (uEmail ? uEmail.split('@')[0] : null);
    const esAus = ausente ? 1 : 0;
    const obsClean = String(observacion || '').trim();

    const resumen = await withWriteLock(async () => {
        await queryRun('BEGIN TRANSACTION');
        try {
            if (esAus === 1 || obsClean) {
                await queryRun(
                    `INSERT INTO asistencia_registros (fecha, estudiante_id, curso_normalizado, ausente, observacion, registrado_por, registrado_nombre, actualizado_en)
                     VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                     ON CONFLICT(fecha, estudiante_id) DO UPDATE SET
                        curso_normalizado=excluded.curso_normalizado,
                        ausente=excluded.ausente,
                        observacion=excluded.observacion,
                        registrado_por=excluded.registrado_por,
                        registrado_nombre=excluded.registrado_nombre,
                        actualizado_en=CURRENT_TIMESTAMP`,
                    [fechaFinal, est.id, est.curso_normalizado, esAus, obsClean, uEmail, uNombre]
                );
            } else {
                await queryRun(
                    `DELETE FROM asistencia_registros WHERE fecha = ? AND estudiante_id = ?`,
                    [fechaFinal, est.id]
                );
            }
            const r = await recalcularResumenCursoFecha(est.curso_normalizado, fechaFinal, {
                tomada: 1,
                usuario,
                origen: 'planilla_mensual'
            });
            await queryRun('COMMIT');
            return r;
        } catch (err) {
            await queryRun('ROLLBACK').catch(() => {});
            throw err;
        }
    });

    auditoria.registrarAuditoria({
        usuario,
        modulo: 'Asistencia',
        accion: 'Editar Celda Planilla Mensual',
        entidad: 'asistencia_registros',
        entidad_id: `${fechaFinal}_${est.id}`,
        descripcion: `Celda editada en ${resumen.curso} (${fechaFinal}) para ${est.nombre}: ${esAus ? 'Ausente' : 'Presente'}.`,
        detalles: { estudiante: est.nombre, fecha: fechaFinal, ausente: Boolean(esAus), curso: resumen.curso }
    });

    return resumen;
}

async function eliminarAsistenciaCursoFecha({ curso, fecha, usuario = null }) {
    const cursoNorm = normalizarCurso(curso);
    if (!esCursoValido(cursoNorm)) {
        throw new Error(`Curso no reconocido: ${curso}`);
    }
    const fechaFinal = String(fecha || '').trim();
    if (!parsearFechaLocal(fechaFinal)) {
        throw new Error(`Formato de fecha inválido (${fecha}). Usa AAAA-MM-DD.`);
    }
    const cursoLegible = formatearCursoLegible(cursoNorm);

    const conteos = await withWriteLock(async () => {
        await queryRun('BEGIN TRANSACTION');
        try {
            const delReg = await queryRun(
                `DELETE FROM asistencia_registros WHERE fecha = ? AND curso_normalizado = ?`,
                [fechaFinal, cursoNorm]
            );
            const delDiario = await queryRun(
                `DELETE FROM asistencia_diaria WHERE fecha = ? AND curso_normalizado = ?`,
                [fechaFinal, cursoNorm]
            );
            await queryRun('COMMIT');
            return {
                registros_eliminados: delReg.changes || 0,
                diarios_eliminados: delDiario.changes || 0
            };
        } catch (err) {
            await queryRun('ROLLBACK').catch(() => {});
            throw err;
        }
    });

    const eliminado = conteos.registros_eliminados > 0 || conteos.diarios_eliminados > 0;

    auditoria.registrarAuditoria({
        usuario,
        modulo: 'Asistencia',
        accion: 'Anular Asistencia Diaria',
        entidad: 'asistencia_diaria',
        entidad_id: `${fechaFinal}_${cursoNorm}`,
        descripcion: `Registro de asistencia anulado para ${cursoLegible} (${fechaFinal}): ${conteos.diarios_eliminados} resumen(es) y ${conteos.registros_eliminados} marca(s) eliminadas.`,
        detalles: { curso: cursoLegible, curso_normalizado: cursoNorm, fecha: fechaFinal, ...conteos, eliminado }
    });

    return {
        curso: cursoLegible,
        curso_normalizado: cursoNorm,
        fecha: fechaFinal,
        ...conteos,
        eliminado
    };
}

// -------------------------------------------------------------
// 6. Consultas Consolidadas Diarias y Planilla Mensual (Libro)
// -------------------------------------------------------------
async function obtenerAsistenciaFecha(fecha = null) {
    const targetFecha = fecha || obtenerFechaHoraChile().fecha;
    const parsed = parsearFechaLocal(targetFecha);
    const anno = parsed ? parsed.anio : await obtenerAnnoActivoSistema();
    const diaInfo = await verificarDiaAsistencia(targetFecha);

    const rows = await queryAll(`
        SELECT * FROM asistencia_diaria 
        WHERE fecha = ?
    `, [targetFecha]);

    const items = ordenarPorCurso(rows.map(r => {
        let ausentes = [];
        try { ausentes = JSON.parse(r.alumnos_ausentes || '[]'); } catch (e) {}
        return {
            ...r,
            curso: formatearCursoLegible(r.curso_normalizado || r.curso),
            alumnos_ausentes: ausentes,
            tomada: r.tomada !== 0
        };
    }), 'curso_normalizado');

    let totalMatricula = 0;
    let totalPresentes = 0;
    let totalAusentes = 0;

    items.forEach(i => {
        totalMatricula += i.matricula_total || 0;
        totalPresentes += i.presentes || 0;
        totalAusentes += i.ausentes || 0;
    });

    const porcentajeGlobal = totalMatricula > 0 ? Math.round((totalPresentes / totalMatricula) * 1000) / 10 : 0;

    // Identificar cursos oficiales con matrícula activa pendientes de registro hoy
    const mapaRegistrados = new Set(items.filter(i => i.tomada).map(i => i.curso_normalizado));
    const conteosMatricula = await queryAll(
        `SELECT curso_normalizado, COUNT(*) as activos FROM asistencia_estudiantes
         WHERE anno = ? AND (retirado = 0 OR (retirado = 1 AND fecha_retiro IS NOT NULL AND fecha_retiro > ?))
         GROUP BY curso_normalizado`,
        [anno, targetFecha]
    );
    const mapaMat = new Map(conteosMatricula.map(c => [c.curso_normalizado, c.activos]));
    const totalEstudiantesMatricula = conteosMatricula.reduce((acc, c) => acc + (c.activos || 0), 0);

    const cursosPendientes = CURSOS_OFICIALES
        .filter(c => !mapaRegistrados.has(c.normalizado))
        .map(c => ({
            curso: c.legible,
            curso_normalizado: c.normalizado,
            matricula_activa: mapaMat.get(c.normalizado) || 0
        }));

    return {
        fecha: targetFecha,
        dia_info: diaInfo,
        total_cursos: items.length,
        total_cursos_oficiales: CURSOS_OFICIALES.length,
        cursos_registrados: mapaRegistrados.size,
        cursos_pendientes: cursosPendientes,
        total_estudiantes_matricula: totalEstudiantesMatricula,
        total_matricula: totalMatricula,
        total_presentes: totalPresentes,
        total_ausentes: totalAusentes,
        porcentaje_global: porcentajeGlobal,
        cursos: items
    };
}

async function obtenerPlanillaMensual(curso, anio, mes, annoCustom = null) {
    const cursoNorm = normalizarCurso(curso);
    if (!esCursoValido(cursoNorm)) {
        throw new Error(`Curso inválido: ${curso}`);
    }

    const y = parseInt(anio, 10);
    const m = parseInt(mes, 10);
    const annoEscolar = parseInt(annoCustom || y, 10);
    const dias = await obtenerDiasMesAsistencia(y, m);

    const estudiantes = await queryAll(
        `SELECT * FROM asistencia_estudiantes
         WHERE curso_normalizado = ? AND anno = ?
         ORDER BY orden ASC, id ASC`,
        [cursoNorm, annoEscolar]
    );

    const diasEnMes = new Date(y, m, 0).getDate();
    const inicioStr = `${y}-${String(m).padStart(2, '0')}-01`;
    const finStr = `${y}-${String(m).padStart(2, '0')}-${String(diasEnMes).padStart(2, '0')}`;

    const registros = await queryAll(
        `SELECT fecha, estudiante_id, ausente, observacion
         FROM asistencia_registros
         WHERE curso_normalizado = ? AND fecha >= ? AND fecha <= ?`,
        [cursoNorm, inicioStr, finStr]
    );

    const diarios = await queryAll(
        `SELECT fecha, tomada, registrado_nombre
         FROM asistencia_diaria
         WHERE curso_normalizado = ? AND fecha >= ? AND fecha <= ?`,
        [cursoNorm, inicioStr, finStr]
    );
    const mapaDiario = new Map(diarios.map(d => [d.fecha, d]));

    // Matriz { [estudiante_id]: { [fecha]: true } }
    const mapaAusencias = {};
    const mapaObs = {};
    registros.forEach(r => {
        if (r.ausente === 1) {
            if (!mapaAusencias[r.estudiante_id]) mapaAusencias[r.estudiante_id] = {};
            mapaAusencias[r.estudiante_id][r.fecha] = true;
        }
        if (r.observacion) {
            if (!mapaObs[r.estudiante_id]) mapaObs[r.estudiante_id] = {};
            mapaObs[r.estudiante_id][r.fecha] = r.observacion;
        }
    });

    const diasTomados = dias.filter(d => !d.esFeriado && mapaDiario.has(d.fecha) && mapaDiario.get(d.fecha).tomada !== 0);

    const estudiantesConMetricas = estudiantes.map((est, idx) => {
        const marcas = mapaAusencias[est.id] || {};
        const obs = mapaObs[est.id] || {};
        let diasHabilesAlumno = 0;
        let totalAusencias = 0;

        diasTomados.forEach(d => {
            const activoEnFecha = !est.retirado || (est.fecha_retiro && est.fecha_retiro > d.fecha);
            if (activoEnFecha) {
                diasHabilesAlumno++;
                if (marcas[d.fecha]) totalAusencias++;
            }
        });

        const pct = diasHabilesAlumno > 0
            ? Math.round(((diasHabilesAlumno - totalAusencias) / diasHabilesAlumno) * 1000) / 10
            : (est.retirado ? 0 : 100);

        return {
            id: est.id,
            numero: est.orden || (idx + 1),
            nombre: est.nombre,
            retirado: Boolean(est.retirado),
            fecha_retiro: est.fecha_retiro || null,
            ausencias: marcas,
            observaciones: obs,
            total_ausencias: totalAusencias,
            dias_evaluados: diasHabilesAlumno,
            porcentaje: pct
        };
    });

    // Totales por cada columna de día
    const totalesPorDia = {};
    dias.forEach(d => {
        const diarioDia = mapaDiario.get(d.fecha);
        const tomada = Boolean(!d.esFeriado && diarioDia && diarioDia.tomada !== 0);
        if (d.esFeriado) {
            totalesPorDia[d.fecha] = { matricula: 0, ausentes: 0, presentes: 0, completa: false, tomada: false, feriado: true };
            return;
        }
        let matriculaDia = 0;
        let ausentesDia = 0;
        estudiantes.forEach(est => {
            const activoEnFecha = !est.retirado || (est.fecha_retiro && est.fecha_retiro > d.fecha);
            if (activoEnFecha) {
                matriculaDia++;
                if (mapaAusencias[est.id] && mapaAusencias[est.id][d.fecha]) {
                    ausentesDia++;
                }
            }
        });
        const presentesDia = Math.max(0, matriculaDia - ausentesDia);
        totalesPorDia[d.fecha] = {
            matricula: matriculaDia,
            ausentes: ausentesDia,
            presentes: presentesDia,
            completa: tomada && matriculaDia > 0 && ausentesDia === 0,
            tomada,
            feriado: false
        };
    });

    return {
        curso: formatearCursoLegible(cursoNorm),
        curso_normalizado: cursoNorm,
        anio: y,
        mes: m,
        mes_nombre: MESES_ES[m - 1] || '',
        hoy_chile: obtenerFechaHoraChile().fecha,
        dias,
        estudiantes: estudiantesConMetricas,
        totales_por_dia: totalesPorDia
    };
}

// -------------------------------------------------------------
// 7. Migración / Importación 1-Clic desde Libro Google Sheets (.xlsx / .csv)
// -------------------------------------------------------------
function parseValorFechaCelda(val) {
    if (!val && val !== 0) return null;
    if (val instanceof Date && !isNaN(val.getTime())) {
        // Ajustar offset para fechas Excel que vienen como UTC midnight
        const dt = new Date(val.getTime() + val.getTimezoneOffset() * 60000);
        return formatearFechaISO(dt);
    }
    if (typeof val === 'number' && val > 25000 && val < 80000) {
        const utc = new Date(Math.round((val - 25569) * 86400 * 1000));
        return formatearFechaISO(new Date(utc.getTime() + utc.getTimezoneOffset() * 60000));
    }
    const s = String(val).trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) {
        const [a, b, c] = s.split('/').map(Number);
        const dia = a > 12 ? a : (b > 12 ? b : a);
        const mes = a > 12 ? b : (b > 12 ? a : b);
        const iso = `${c}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
        return parsearFechaLocal(iso) ? iso : null;
    }
    return null;
}

function esCeldaVerdadera(val) {
    if (val === true || val === 1) return true;
    const s = String(val || '').trim().toUpperCase();
    return s === 'TRUE' || s === 'VERDADERO' || s.startsWith('VERDADERO') || s === 'SI' || s === 'SÍ' || s === 'X';
}

function esCeldaRetirado(val) {
    if (val === true || val === 1) return true;
    const s = String(val || '').trim().toUpperCase();
    return s === 'TRUE' || s === 'VERDADERO' || s === 'SI' || s === 'SÍ';
}

async function importarDesdeLibroSheets(buffer, filename, { importarAsistenciaMes = true, anioMes = null, anno = null } = {}, usuario = null) {
    if (!buffer) throw new Error('No se recibió archivo para importar.');

    const { fecha: hoyChile, anno: annoHoy } = obtenerFechaHoraChile();
    const annoFinal = parseInt(anno || annoHoy || await obtenerAnnoActivoSistema(), 10);
    const [anioMesStr, mesMesStr] = (anioMes || hoyChile.slice(0, 7)).split('-');
    const anioObjetivo = parseInt(anioMesStr, 10) || annoFinal;
    const mesObjetivo = parseInt(mesMesStr, 10) || parseInt(hoyChile.slice(5, 7), 10);

    const workbook = xlsx.read(buffer, { type: 'buffer', cellDates: true });
    const stats = {
        archivo: filename,
        estudiantes_creados: 0,
        estudiantes_actualizados: 0,
        estudiantes_retirados: 0,
        feriados_importados: 0,
        extras_importados: 0,
        correos_importados: 0,
        registros_asistencia_importados: 0,
        dias_recalculados: 0,
        advertencias: []
    };

    const emailsEncontrados = [];
    const feriadosEncontrados = [];
    const extrasEncontrados = [];
    const estudiantesEncontrados = [];

    // Identificar si existe pestaña Configuracion
    const sheetConfigName = workbook.SheetNames.find(n => normalizarTexto(n) === 'CONFIGURACION');
    const sheetPrincipalName = sheetConfigName || workbook.SheetNames[0];
    const matrizConfig = xlsx.utils.sheet_to_json(workbook.Sheets[sheetPrincipalName], { header: 1, defval: '' });

    // 1. Parsear sección Configuracion (Correos, Alumnos, Feriados, Extras)
    let formatoSimple3Col = false;
    let colIdxEmail = 0, colIdxNombre = 2, colIdxCurso = 3, colIdxRetirado = 4, colIdxFeriado = 6, colIdxExtra = 7;
    let filaInicioConfig = 1;

    if (matrizConfig.length > 0) {
        const hdr = matrizConfig[0].map(c => normalizarTexto(c));
        const hasNombre = hdr.findIndex(c => c.includes('NOMBRE') || c.includes('ESTUDIANTE') || c.includes('ALUMNO'));
        const hasCurso = hdr.findIndex(c => c.includes('CURSO'));
        if (hasNombre !== -1 && hasCurso !== -1) {
            colIdxNombre = hasNombre;
            colIdxCurso = hasCurso;
            const hasEmail = hdr.findIndex(c => c.includes('CORREO') || c.includes('EMAIL'));
            const hasRet = hdr.findIndex(c => c.includes('RETIRADO'));
            const hasFer = hdr.findIndex(c => c.includes('FERIADO'));
            const hasExt = hdr.findIndex(c => c.includes('EXTRA') || c.includes('SABADO'));
            colIdxEmail = hasEmail !== -1 ? hasEmail : -1;
            colIdxRetirado = hasRet !== -1 ? hasRet : -1;
            colIdxFeriado = hasFer !== -1 ? hasFer : -1;
            colIdxExtra = hasExt !== -1 ? hasExt : -1;
            formatoSimple3Col = (colIdxEmail === -1);
            filaInicioConfig = 1;
        } else if (!sheetConfigName) {
            filaInicioConfig = 0;
        }
    }

    // Orden por curso para numeración N°1, 2, 3...
    const ordenContadorPorCurso = new Map();
    const llavesVistas = new Set();

    for (let r = filaInicioConfig; r < matrizConfig.length; r++) {
        const row = matrizConfig[r] || [];

        // Si en CSV combinado llegamos a la sección de bloques mensuales (ej. col 0 = "Kinder A"), paramos lectura de Configuracion
        if (!sheetConfigName && row[0] && esCursoValido(row[0])) {
            break;
        }

        if (colIdxEmail !== -1 && row[colIdxEmail]) {
            const em = String(row[colIdxEmail]).trim().toLowerCase();
            if (em.includes('@')) emailsEncontrados.push(em);
        }

        if (colIdxFeriado !== -1 && row[colIdxFeriado]) {
            const fIso = parseValorFechaCelda(row[colIdxFeriado]);
            if (fIso) feriadosEncontrados.push(fIso);
        }

        if (colIdxExtra !== -1 && row[colIdxExtra]) {
            const fIso = parseValorFechaCelda(row[colIdxExtra]);
            if (fIso) extrasEncontrados.push(fIso);
        }

        const rawNombre = String(row[colIdxNombre] || '').trim().replace(/\(retirado\)/i, '').trim();
        const rawCurso = String(row[colIdxCurso] || '').trim();
        if (rawNombre && rawNombre.length >= 2 && rawCurso) {
            const cursoNorm = normalizarCurso(rawCurso);
            if (!esCursoValido(cursoNorm)) {
                stats.advertencias.push(`Fila ${r + 1}: Curso sin paralelo o no estándar "${rawCurso}" omitido (${rawNombre}).`);
                continue;
            }
            const nombreNorm = normalizarTexto(rawNombre);
            const key = `${cursoNorm}::${nombreNorm}`;
            if (llavesVistas.has(key)) continue;
            llavesVistas.add(key);

            const ord = (ordenContadorPorCurso.get(cursoNorm) || 0) + 1;
            ordenContadorPorCurso.set(cursoNorm, ord);

            const esRet = colIdxRetirado !== -1 ? esCeldaRetirado(row[colIdxRetirado]) : false;
            estudiantesEncontrados.push({
                nombre: rawNombre,
                nombre_normalizado: nombreNorm,
                curso: formatearCursoLegible(cursoNorm),
                curso_normalizado: cursoNorm,
                orden: ord,
                retirado: esRet ? 1 : 0
            });
        }
    }

    // Guardar correos destinatarios si se detectaron
    if (emailsEncontrados.length > 0) {
        const cfgActual = await obtenerConfiguracion();
        const combinados = Array.from(new Set([...cfgActual.correos_destinatarios_reporte, ...emailsEncontrados]));
        await queryRun(
            `INSERT INTO asistencia_config (clave, valor) VALUES ('correos_destinatarios_reporte', ?)
             ON CONFLICT(clave) DO UPDATE SET valor=excluded.valor`,
            [JSON.stringify(combinados)]
        );
        stats.correos_importados = emailsEncontrados.length;
    }

    // Guardar feriados y extras
    for (const f of feriadosEncontrados) {
        const r = await queryRun(
            `INSERT OR IGNORE INTO asistencia_dias_especiales (fecha, tipo, descripcion, origen) VALUES (?, 'FERIADO', 'Importado desde Google Sheets', 'migracion_sheets')`,
            [f]
        );
        if (r.changes > 0) stats.feriados_importados++;
    }
    for (const f of extrasEncontrados) {
        const r = await queryRun(
            `INSERT OR IGNORE INTO asistencia_dias_especiales (fecha, tipo, descripcion, origen) VALUES (?, 'CLASE_EXTRA', 'Clase extra importada', 'migracion_sheets')`,
            [f]
        );
        if (r.changes > 0) stats.extras_importados++;
    }

    // Persistir estudiantes en BD
    const mapaEstudianteId = new Map();
    await withWriteLock(async () => {
        await queryRun('BEGIN TRANSACTION');
        try {
            for (const est of estudiantesEncontrados) {
                const existente = await queryGet(
                    `SELECT id, retirado FROM asistencia_estudiantes WHERE nombre_normalizado = ? AND curso_normalizado = ? AND anno = ?`,
                    [est.nombre_normalizado, est.curso_normalizado, annoFinal]
                );

                if (existente) {
                    await queryRun(
                        `UPDATE asistencia_estudiantes SET nombre = ?, curso = ?, orden = ?, retirado = ?, actualizado_en = CURRENT_TIMESTAMP WHERE id = ?`,
                        [est.nombre, est.curso, est.orden, est.retirado, existente.id]
                    );
                    mapaEstudianteId.set(`${est.curso_normalizado}::${est.nombre_normalizado}`, existente.id);
                    stats.estudiantes_actualizados++;
                } else {
                    const ins = await queryRun(
                        `INSERT INTO asistencia_estudiantes (nombre, nombre_normalizado, curso, curso_normalizado, orden, retirado, anno)
                         VALUES (?, ?, ?, ?, ?, ?, ?)`,
                        [est.nombre, est.nombre_normalizado, est.curso, est.curso_normalizado, est.orden, est.retirado, annoFinal]
                    );
                    mapaEstudianteId.set(`${est.curso_normalizado}::${est.nombre_normalizado}`, ins.lastID);
                    stats.estudiantes_creados++;
                }
                if (est.retirado) stats.estudiantes_retirados++;
            }
            await queryRun('COMMIT');
        } catch (err) {
            await queryRun('ROLLBACK').catch(() => {});
            throw err;
        }
    });

    // 2. Importar marcas de asistencia del mes desde pestañas de cursos (o bloques CSV)
    if (importarAsistenciaMes) {
        // Recargar mapa completo de estudiantes activos/retirados por si ya existían de antes
        const todosEst = await queryAll(`SELECT id, nombre_normalizado, curso_normalizado FROM asistencia_estudiantes WHERE anno = ?`, [annoFinal]);
        todosEst.forEach(e => mapaEstudianteId.set(`${e.curso_normalizado}::${e.nombre_normalizado}`, e.id));

        const bloquesAProcesar = [];

        // Caso multi-pestaña (Excel descargado de Google Sheets)
        workbook.SheetNames.forEach(sName => {
            if (esCursoValido(sName)) {
                const mat = xlsx.utils.sheet_to_json(workbook.Sheets[sName], { header: 1, defval: '' });
                bloquesAProcesar.push({ cursoNorm: normalizarCurso(sName), rows: mat, startIdx: 0 });
            }
        });

        // Fallback: si no había pestañas de cursos, buscar bloques dentro de la hoja 1
        if (bloquesAProcesar.length === 0) {
            const indices = [];
            for (let r = 0; r < matrizConfig.length; r++) {
                const c0 = matrizConfig[r] ? matrizConfig[r][0] : null;
                if (c0 && esCursoValido(c0)) {
                    indices.push({ fila: r, cursoNorm: normalizarCurso(c0) });
                }
            }
            for (let b = 0; b < indices.length; b++) {
                const ini = indices[b].fila;
                const fin = (b + 1 < indices.length) ? indices[b + 1].fila : matrizConfig.length;
                bloquesAProcesar.push({
                    cursoNorm: indices[b].cursoNorm,
                    rows: matrizConfig.slice(ini, fin),
                    startIdx: 0
                });
            }
        }

        const diasPorRecalcular = new Set(); // "cursoNorm::YYYY-MM-DD"
        const uEmail = usuario && usuario.email ? usuario.email.toLowerCase() : 'migracion@colegiocerrogrande.cl';
        const uNombre = usuario && usuario.nombre ? usuario.nombre : 'Migración Google Sheets';

        await withWriteLock(async () => {
            await queryRun('BEGIN TRANSACTION');
            try {
                for (const blk of bloquesAProcesar) {
                    const rows = blk.rows;
                    if (!rows || rows.length < 3) continue;

                    // Ubicar fila que contiene "N°" y "Nombre del Estudiante"
                    let headerRowIdx = -1;
                    for (let r = 0; r < Math.min(5, rows.length); r++) {
                        const c1 = normalizarTexto(rows[r] ? rows[r][1] : '');
                        const c0 = normalizarTexto(rows[r] ? rows[r][0] : '');
                        if (c0 === 'N°' || c0 === 'N' || c1.includes('NOMBRE DEL ESTUDIANTE') || c1.includes('ESTUDIANTE')) {
                            headerRowIdx = r;
                            break;
                        }
                    }
                    if (headerRowIdx === -1) continue;

                    const headerDias = rows[headerRowIdx] || [];
                    const colsDias = [];
                    for (let c = 2; c < headerDias.length; c++) {
                        const numDia = parseInt(String(headerDias[c] || '').trim(), 10);
                        if (!isNaN(numDia) && numDia >= 1 && numDia <= 31) {
                            const fIso = `${anioObjetivo}-${String(mesObjetivo).padStart(2, '0')}-${String(numDia).padStart(2, '0')}`;
                            if (parsearFechaLocal(fIso)) {
                                colsDias.push({ colIdx: c, fecha: fIso, tieneDato: false });
                            }
                        }
                    }
                    if (colsDias.length === 0) continue;

                    // Detectar totales inferiores para saber hasta qué día hubo toma real (Total Ausentes > 0 o fecha <= hoy)
                    const diasConAusenciasEnTotales = new Set();
                    for (let r = headerRowIdx + 1; r < rows.length; r++) {
                        const row = rows[r] || [];
                        const c1Norm = normalizarTexto(row[1] || '');
                        if (c1Norm.startsWith('TOTAL AUSENTES')) {
                            colsDias.forEach(cd => {
                                const val = parseInt(row[cd.colIdx], 10) || 0;
                                if (val > 0) diasConAusenciasEnTotales.add(cd.fecha);
                            });
                        }
                    }

                    // Recorrer alumnos del bloque
                    for (let r = headerRowIdx + 1; r < rows.length; r++) {
                        const row = rows[r] || [];
                        const c1Raw = String(row[1] || '').trim();
                        const c1Norm = normalizarTexto(c1Raw);
                        if (!c1Raw || c1Norm.startsWith('TOTAL') || c1Norm.startsWith('ASISTENCIA') || c1Norm.startsWith('HTTP')) {
                            continue;
                        }
                        if (c1Norm.includes('(RETIRADO)')) continue;

                        const nombreLimpio = c1Raw.replace(/\(retirado\)/i, '').trim();
                        const nombreNorm = normalizarTexto(nombreLimpio);
                        let estId = mapaEstudianteId.get(`${blk.cursoNorm}::${nombreNorm}`);

                        // Si el alumno existía en la pestaña pero faltaba en Configuracion, crearlo
                        if (!estId && nombreLimpio.length >= 2) {
                            const insEst = await queryRun(
                                `INSERT OR IGNORE INTO asistencia_estudiantes (nombre, nombre_normalizado, curso, curso_normalizado, orden, retirado, anno)
                                 VALUES (?, ?, ?, ?, ?, 0, ?)`,
                                [nombreLimpio, nombreNorm, formatearCursoLegible(blk.cursoNorm), blk.cursoNorm, r, annoFinal]
                            );
                            if (insEst.lastID) {
                                estId = insEst.lastID;
                                stats.estudiantes_creados++;
                            } else {
                                const rowE = await queryGet(
                                    `SELECT id FROM asistencia_estudiantes WHERE nombre_normalizado = ? AND curso_normalizado = ? AND anno = ?`,
                                    [nombreNorm, blk.cursoNorm, annoFinal]
                                );
                                estId = rowE ? rowE.id : null;
                            }
                            if (estId) mapaEstudianteId.set(`${blk.cursoNorm}::${nombreNorm}`, estId);
                        }
                        if (!estId) continue;

                        for (const cd of colsDias) {
                            if (esCeldaVerdadera(row[cd.colIdx])) {
                                cd.tieneDato = true;
                                await queryRun(
                                    `INSERT INTO asistencia_registros (fecha, estudiante_id, curso_normalizado, ausente, observacion, registrado_por, registrado_nombre, actualizado_en)
                                     VALUES (?, ?, ?, 1, '', ?, ?, CURRENT_TIMESTAMP)
                                     ON CONFLICT(fecha, estudiante_id) DO UPDATE SET ausente=1, actualizado_en=CURRENT_TIMESTAMP`,
                                    [cd.fecha, estId, blk.cursoNorm, uEmail, uNombre]
                                );
                                stats.registros_asistencia_importados++;
                            }
                        }
                    }

                    // Recalcular resumen diario para los días ya transcurridos (<= hoyChile) o con marcas explícitas
                    for (const cd of colsDias) {
                        if (cd.tieneDato || diasConAusenciasEnTotales.has(cd.fecha) || cd.fecha <= hoyChile) {
                            diasPorRecalcular.add(`${blk.cursoNorm}::${cd.fecha}`);
                        }
                    }
                }

                for (const item of diasPorRecalcular) {
                    const [cNorm, fIso] = item.split('::');
                    const dInfo = await verificarDiaAsistencia(fIso);
                    if (dInfo.habil) {
                        await recalcularResumenCursoFecha(cNorm, fIso, {
                            tomada: 1,
                            usuario,
                            origen: 'migracion_sheets'
                        });
                        stats.dias_recalculados++;
                    }
                }

                await queryRun('COMMIT');
            } catch (err) {
                await queryRun('ROLLBACK').catch(() => {});
                throw err;
            }
        });
    }

    auditoria.registrarAuditoria({
        usuario,
        modulo: 'Asistencia',
        accion: 'Migración Libro de Asistencia',
        descripcion: `Importación desde "${filename}": ${stats.estudiantes_creados} alumnos creados, ${stats.estudiantes_actualizados} actualizados, ${stats.feriados_importados} feriados, ${stats.registros_asistencia_importados} marcas de ausencia.`,
        detalles: stats
    });

    return stats;
}

// -------------------------------------------------------------
// 8. Reportes de Novedades ("💬 Reportar")
// -------------------------------------------------------------
async function crearReporteNovedad({ curso, fecha = null, mensaje, usuario = null }) {
    const cursoNorm = normalizarCurso(curso);
    const cursoLegible = esCursoValido(cursoNorm) ? formatearCursoLegible(cursoNorm) : String(curso || '').trim();
    const fechaFinal = fecha || obtenerFechaHoraChile().fecha;
    const msgClean = String(mensaje || '').trim();

    if (!cursoLegible) throw new Error('Debe especificar el curso.');
    if (!msgClean) throw new Error('Debe escribir el mensaje o novedad a reportar.');

    const cfg = await obtenerConfiguracion();
    const destinatarios = cfg.correos_destinatarios_reporte || [];
    const repEmail = (usuario && usuario.email) ? usuario.email.toLowerCase() : 'sistema@colegiocerrogrande.cl';
    const repNombre = (usuario && usuario.nombre) ? usuario.nombre : repEmail.split('@')[0];

    const ins = await queryRun(
        `INSERT INTO asistencia_novedades (fecha, curso, curso_normalizado, mensaje, reportado_por_email, reportado_por_nombre, destinatarios, estado)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'Pendiente')`,
        [fechaFinal, cursoLegible, cursoNorm, msgClean, repEmail, repNombre, JSON.stringify(destinatarios)]
    );

    let correosEncolados = 0;
    for (const dest of destinatarios) {
        try {
            await mailer.enviarConPlantilla({
                clave: 'asistencia_reporte_novedad',
                destinatario: dest,
                variables: {
                    curso: cursoLegible,
                    fecha: fechaFinal,
                    reportado_por: repNombre,
                    reportado_email: repEmail,
                    mensaje: msgClean
                },
                modulo: 'Asistencia'
            });
            correosEncolados++;
        } catch (e) {
            console.error('[ASISTENCIA] Error encolando novedad para', dest, e.message);
        }
    }

    auditoria.registrarAuditoria({
        usuario,
        modulo: 'Asistencia',
        accion: 'Reportar Novedad Curso',
        entidad: 'asistencia_novedades',
        entidad_id: String(ins.lastID),
        descripcion: `Novedad reportada para ${cursoLegible} (${fechaFinal}) -> ${correosEncolados} correos notificados.`,
        detalles: { id: ins.lastID, curso: cursoLegible, fecha: fechaFinal, destinatarios }
    });

    const row = await queryGet(`SELECT * FROM asistencia_novedades WHERE id = ?`, [ins.lastID]);
    return { ...row, correos_encolados: correosEncolados };
}

async function listarNovedades({ fecha = null, estado = null, curso = null, limit = 50 } = {}) {
    let sql = `SELECT * FROM asistencia_novedades WHERE 1=1`;
    const params = [];
    if (fecha) { sql += ` AND fecha = ?`; params.push(fecha); }
    if (estado && estado !== 'todos') { sql += ` AND estado = ?`; params.push(estado); }
    if (curso && curso !== 'todos') { sql += ` AND curso_normalizado = ?`; params.push(normalizarCurso(curso)); }
    sql += ` ORDER BY id DESC LIMIT ?`;
    params.push(parseInt(limit, 10) || 50);
    return await queryAll(sql, params);
}

async function marcarNovedadRevisada(id, usuario = null) {
    const revPor = usuario ? `${usuario.nombre || usuario.email} (${usuario.email})` : 'Inspectoría/Admin';
    const res = await queryRun(
        `UPDATE asistencia_novedades SET estado = 'Revisado', revisado_por = ?, revisado_en = CURRENT_TIMESTAMP WHERE id = ?`,
        [revPor, id]
    );
    if (res.changes === 0) throw new Error('Novedad no encontrada.');

    auditoria.registrarAuditoria({
        usuario,
        modulo: 'Asistencia',
        accion: 'Marcar Novedad Revisada',
        entidad: 'asistencia_novedades',
        entidad_id: String(id),
        descripcion: `Novedad ID ${id} marcada como revisada por ${revPor}.`
    });
    return await queryGet(`SELECT * FROM asistencia_novedades WHERE id = ?`, [id]);
}

// -------------------------------------------------------------
// 9. Exportación Mensual (.xlsx + .pdf) y Envío Mensual
// -------------------------------------------------------------
async function recopilarResumenMensualCompleto(anio, mes) {
    const y = parseInt(anio, 10);
    const m = parseInt(mes, 10);
    const planillas = [];

    for (const c of CURSOS_OFICIALES) {
        const plan = await obtenerPlanillaMensual(c.normalizado, y, m, y);
        planillas.push(plan);
    }

    const dias = planillas[0] ? planillas[0].dias : await obtenerDiasMesAsistencia(y, m);
    const diasHabiles = dias.filter(d => !d.esFeriado).length;

    let sumaPresentesEst = 0;
    let sumaAusentesEst = 0;
    let sumaEvaluadosEst = 0;

    const resumenCursos = planillas.map(p => {
        const matriculaActiva = p.estudiantes.filter(e => !e.retirado).length;
        let diasRegistrados = 0;
        let asistenciasAcum = 0;
        let ausenciasAcum = 0;
        let dias100 = 0;

        p.dias.forEach(d => {
            if (d.esFeriado) return;
            const tot = p.totales_por_dia[d.fecha];
            if (tot && tot.tomada) {
                diasRegistrados++;
                asistenciasAcum += tot.presentes;
                ausenciasAcum += tot.ausentes;
                if (tot.completa) dias100++;
            }
        });

        const base = asistenciasAcum + ausenciasAcum;
        const pct = base > 0 ? Math.round((asistenciasAcum / base) * 1000) / 10 : 0;

        sumaPresentesEst += asistenciasAcum;
        sumaAusentesEst += ausenciasAcum;
        sumaEvaluadosEst += base;

        return {
            curso: p.curso,
            curso_normalizado: p.curso_normalizado,
            matricula_activa: matriculaActiva,
            dias_registrados: diasRegistrados,
            asistencias_acum: asistenciasAcum,
            ausencias_acum: ausenciasAcum,
            porcentaje: pct,
            dias_100: dias100
        };
    });

    const pctMensualEstablecimiento = sumaEvaluadosEst > 0
        ? Math.round((sumaPresentesEst / sumaEvaluadosEst) * 1000) / 10
        : 0;

    return {
        anio: y,
        mes: m,
        mes_nombre: MESES_ES[m - 1] || '',
        dias,
        dias_habiles: diasHabiles,
        total_cursos: resumenCursos.filter(r => r.matricula_activa > 0 || r.dias_registrados > 0).length || resumenCursos.length,
        total_inasistencias: sumaAusentesEst,
        total_asistencias: sumaPresentesEst,
        porcentaje_mensual: pctMensualEstablecimiento,
        resumen_cursos: resumenCursos,
        planillas
    };
}

async function generarExcelMensual(datosMes) {
    const wb = xlsx.utils.book_new();

    // Hoja 1: Resumen Mensual
    const aoaResumen = [
        [`COLEGIO CERRO GRANDE - REPORTE MENSUAL DE ASISTENCIA`],
        [`Periodo: ${datosMes.mes_nombre} ${datosMes.anio}`, '', `Días hábiles: ${datosMes.dias_habiles}`, '', `Asistencia Promedio Establecimiento: ${datosMes.porcentaje_mensual}%`],
        [],
        ['Curso', 'Matrícula Activa', 'Días Registrados', 'Total Asistencias', 'Total Ausencias', '% Asistencia', 'Días Asistencia 100%']
    ];

    datosMes.resumen_cursos.forEach(rc => {
        aoaResumen.push([
            rc.curso,
            rc.matricula_activa,
            rc.dias_registrados,
            rc.asistencias_acum,
            rc.ausencias_acum,
            `${rc.porcentaje}%`,
            rc.dias_100
        ]);
    });

    aoaResumen.push([]);
    aoaResumen.push([
        'TOTAL ESTABLECIMIENTO',
        datosMes.resumen_cursos.reduce((s, r) => s + r.matricula_activa, 0),
        datosMes.dias_habiles,
        datosMes.total_asistencias,
        datosMes.total_inasistencias,
        `${datosMes.porcentaje_mensual}%`,
        ''
    ]);

    const wsResumen = xlsx.utils.aoa_to_sheet(aoaResumen);
    wsResumen['!cols'] = [{ wch: 22 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 14 }, { wch: 20 }];
    xlsx.utils.book_append_sheet(wb, wsResumen, 'Resumen Mensual');

    // Hojas por curso
    datosMes.planillas.forEach(p => {
        if (p.estudiantes.length === 0) return;

        const filaDiasCortos = [p.curso, '', ...p.dias.map(d => d.diaCorto), ''];
        const filaCabecera = ['N°', 'Nombre del Estudiante', ...p.dias.map(d => d.dia), '% Asist.'];
        const aoa = [filaDiasCortos, filaCabecera];

        p.estudiantes.forEach((est, idx) => {
            const nombreMostrar = est.retirado ? `${est.nombre} (retirado)` : est.nombre;
            const celdas = p.dias.map(d => {
                if (d.esFeriado) return 'FER';
                const totDia = p.totales_por_dia[d.fecha];
                if (est.retirado && (!est.fecha_retiro || est.fecha_retiro <= d.fecha)) return '-';
                if (est.ausencias && est.ausencias[d.fecha]) return 'A';
                return (totDia && totDia.tomada) ? 'P' : '';
            });
            aoa.push([est.numero || (idx + 1), nombreMostrar, ...celdas, `${est.porcentaje}%`]);
        });

        aoa.push(['', 'TOTAL MATRÍCULA (Activos):', ...p.dias.map(d => d.esFeriado ? 'FER' : (p.totales_por_dia[d.fecha] ? p.totales_por_dia[d.fecha].matricula : 0)), '']);
        aoa.push(['', 'Total Ausentes:', ...p.dias.map(d => d.esFeriado ? 'FER' : (p.totales_por_dia[d.fecha] ? p.totales_por_dia[d.fecha].ausentes : 0)), '']);
        aoa.push(['', 'Total Asistentes:', ...p.dias.map(d => d.esFeriado ? 'FER' : (p.totales_por_dia[d.fecha] ? p.totales_por_dia[d.fecha].presentes : 0)), '']);
        aoa.push(['', 'Asistencia Completa:', ...p.dias.map(d => d.esFeriado ? 'FER' : (p.totales_por_dia[d.fecha] && p.totales_por_dia[d.fecha].completa ? 'SI' : 'NO')), '']);

        const wsCurso = xlsx.utils.aoa_to_sheet(aoa);
        wsCurso['!cols'] = [
            { wch: 5 },
            { wch: 38 },
            ...p.dias.map(() => ({ wch: 4.5 })),
            { wch: 9 }
        ];
        const safeName = p.curso.replace(/[:\\/?*\[\]]/g, '').slice(0, 31);
        xlsx.utils.book_append_sheet(wb, wsCurso, safeName);
    });

    return xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

async function generarPdfMensual(datosMes) {
    return await new Promise((resolve, reject) => {
        const doc = new PDFDocument({ layout: 'landscape', size: 'LETTER', margin: 24, autoFirstPage: true });
        const chunks = [];
        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        const pageW = 792 - 48; // 744 pt útiles
        const pageH = 612 - 48; // 564 pt útiles
        const startX = 24;

        // --- PÁGINA 1: RESUMEN DEL ESTABLECIMIENTO ---
        doc.rect(startX, 24, pageW, 46).fill('#1e3a8a');
        doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(15)
            .text('COLEGIO CERRO GRANDE LA SERENA', startX + 14, 33);
        doc.font('Helvetica').fontSize(10)
            .text(`Reporte Mensual Consolidado de Asistencia · ${datosMes.mes_nombre} ${datosMes.anio}`, startX + 14, 52);

        // KPIs en banda
        const kpiY = 80;
        const kpis = [
            { label: 'Cursos Reportados', val: String(datosMes.total_cursos) },
            { label: 'Días Hábiles Mes', val: String(datosMes.dias_habiles) },
            { label: 'Asistencias Acumuladas', val: String(datosMes.total_asistencias) },
            { label: 'Ausencias Acumuladas', val: String(datosMes.total_inasistencias) },
            { label: '% Asistencia Mensual', val: `${datosMes.porcentaje_mensual}%` }
        ];
        const boxW = (pageW - 32) / 5;
        kpis.forEach((k, idx) => {
            const x = startX + idx * (boxW + 8);
            doc.rect(x, kpiY, boxW, 38).fillAndStroke('#f8fafc', '#cbd5e1');
            doc.fillColor('#64748b').font('Helvetica').fontSize(7.5).text(k.label.toUpperCase(), x + 8, kpiY + 6, { width: boxW - 16 });
            doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(13).text(k.val, x + 8, kpiY + 18, { width: boxW - 16 });
        });

        // Tabla resumen cursos
        let curY = 130;
        const colsRes = [
            { txt: 'Curso', w: 164, align: 'left' },
            { txt: 'Matrícula Activa', w: 95, align: 'center' },
            { txt: 'Días Registrados', w: 100, align: 'center' },
            { txt: 'Asistencias', w: 95, align: 'center' },
            { txt: 'Ausencias', w: 95, align: 'center' },
            { txt: '% Asistencia', w: 95, align: 'center' },
            { txt: 'Días 100%', w: 100, align: 'center' }
        ];

        doc.rect(startX, curY, pageW, 18).fill('#0f172a');
        let cx = startX;
        doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(8.5);
        colsRes.forEach(c => {
            doc.text(c.txt, cx + 4, curY + 5, { width: c.w - 8, align: c.align });
            cx += c.w;
        });
        curY += 18;

        datosMes.resumen_cursos.forEach((rc, i) => {
            if (curY + 15 > 580) {
                doc.addPage({ layout: 'landscape', size: 'LETTER', margin: 24 });
                curY = 24;
            }
            doc.rect(startX, curY, pageW, 14.5).fillAndStroke(i % 2 === 0 ? '#ffffff' : '#f8fafc', '#e2e8f0');
            cx = startX;
            const vals = [
                rc.curso,
                String(rc.matricula_activa),
                String(rc.dias_registrados),
                String(rc.asistencias_acum),
                String(rc.ausencias_acum),
                `${rc.porcentaje}%`,
                String(rc.dias_100)
            ];
            doc.fillColor('#1e293b').font('Helvetica').fontSize(8);
            vals.forEach((v, idx) => {
                if (idx === 0 || idx === 5) doc.font('Helvetica-Bold'); else doc.font('Helvetica');
                doc.text(v, cx + 4, curY + 4, { width: colsRes[idx].w - 8, align: colsRes[idx].align });
                cx += colsRes[idx].w;
            });
            curY += 14.5;
        });

        // --- PÁGINAS POR CURSO ---
        datosMes.planillas.forEach(p => {
            if (p.estudiantes.length === 0) return;

            doc.addPage({ layout: 'landscape', size: 'LETTER', margin: 24 });

            const matriculaActiva = p.estudiantes.filter(e => !e.retirado).length;
            const rcCurso = datosMes.resumen_cursos.find(r => r.curso_normalizado === p.curso_normalizado);

            // Cabecera del curso
            doc.rect(startX, 24, pageW, 26).fill('#1e3a8a');
            doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(11)
                .text(`${p.curso} · ${datosMes.mes_nombre} ${datosMes.anio}`, startX + 10, 31);
            doc.font('Helvetica').fontSize(8.5)
                .text(`Matrícula Activa: ${matriculaActiva} | % Asistencia Curso: ${rcCurso ? rcCurso.porcentaje : 0}%`, startX + 350, 32, { width: pageW - 360, align: 'right' });

            const dias = p.dias;
            const numDias = dias.length;
            const wNum = 20;
            const wNom = 165;
            const wPct = 32;
            const wDay = Math.min(22, (pageW - wNum - wNom - wPct) / Math.max(numDias, 1));
            const totalFilas = p.estudiantes.length + 5;
            const hDisp = pageH - 34;
            const rowH = Math.max(9.5, Math.min(13.5, Math.floor(hDisp / Math.max(totalFilas, 10))));
            const fontSizeEst = rowH >= 12 ? 7 : 6.2;

            const dibujarCabeceraTabla = (yTop) => {
                // Fila 1: días de semana
                doc.rect(startX, yTop, pageW, 11).fill('#e2e8f0');
                doc.fillColor('#475569').font('Helvetica-Bold').fontSize(6);
                let x = startX + wNum + wNom;
                dias.forEach(d => {
                    doc.text(d.diaCorto.slice(0, 2), x, yTop + 3, { width: wDay, align: 'center' });
                    x += wDay;
                });

                // Fila 2: números de día
                const y2 = yTop + 11;
                doc.rect(startX, y2, pageW, 12).fill('#0f172a');
                doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(6.8);
                doc.text('N°', startX + 2, y2 + 3, { width: wNum - 4, align: 'center' });
                doc.text('Estudiante', startX + wNum + 4, y2 + 3, { width: wNom - 8, align: 'left' });
                x = startX + wNum + wNom;
                dias.forEach(d => {
                    doc.text(String(d.dia), x, y2 + 3, { width: wDay, align: 'center' });
                    x += wDay;
                });
                doc.text('%', x, y2 + 3, { width: wPct, align: 'center' });
                return y2 + 12;
            };

            let y = dibujarCabeceraTabla(54);

            p.estudiantes.forEach((est, idx) => {
                if (y + rowH > 550) {
                    doc.addPage({ layout: 'landscape', size: 'LETTER', margin: 24 });
                    y = dibujarCabeceraTabla(24);
                }

                const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
                doc.rect(startX, y, pageW, rowH).fillAndStroke(bg, '#e2e8f0');

                doc.fillColor(est.retirado ? '#94a3b8' : '#1e293b').font('Helvetica').fontSize(fontSizeEst);
                doc.text(String(est.numero || (idx + 1)), startX + 1, y + 2, { width: wNum - 2, align: 'center' });
                const nomTxt = est.retirado ? `${est.nombre} (ret)` : est.nombre;
                doc.text(nomTxt, startX + wNum + 3, y + 2, { width: wNom - 6, ellipsis: true, lineBreak: false });

                let x = startX + wNum + wNom;
                dias.forEach(d => {
                    if (d.esFeriado) {
                        doc.rect(x, y, wDay, rowH).fillAndStroke('#e5e7eb', '#d1d5db');
                    } else if (est.ausencias && est.ausencias[d.fecha]) {
                        doc.rect(x, y, wDay, rowH).fillAndStroke('#fce8e6', '#f5c2c0');
                        doc.fillColor('#c5221f').font('Helvetica-Bold').fontSize(6.5)
                            .text('A', x, y + 2, { width: wDay, align: 'center' });
                    } else if (p.totales_por_dia[d.fecha] && p.totales_por_dia[d.fecha].tomada && (!est.retirado || (est.fecha_retiro && est.fecha_retiro > d.fecha))) {
                        doc.fillColor('#94a3b8').font('Helvetica').fontSize(6)
                            .text('·', x, y + 2, { width: wDay, align: 'center' });
                    }
                    x += wDay;
                });

                doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(fontSizeEst)
                    .text(`${est.porcentaje}%`, x, y + 2, { width: wPct, align: 'center' });

                y += rowH;
            });

            // Filas de totales del curso
            const resumenFilas = [
                { titulo: 'Matrícula Activa', key: 'matricula', bg: '#f1f5f9', color: '#0f172a' },
                { titulo: 'Total Ausentes', key: 'ausentes', bg: '#fef2f2', color: '#b91c1c' },
                { titulo: 'Total Asistentes', key: 'presentes', bg: '#f0fdf4', color: '#15803d' }
            ];
            resumenFilas.forEach(rf => {
                if (y + rowH > 580) {
                    doc.addPage({ layout: 'landscape', size: 'LETTER', margin: 24 });
                    y = 24;
                }
                doc.rect(startX, y, pageW, rowH).fillAndStroke(rf.bg, '#cbd5e1');
                doc.fillColor(rf.color).font('Helvetica-Bold').fontSize(6.8)
                    .text(rf.titulo, startX + wNum + 3, y + 2, { width: wNom - 6, align: 'right' });
                let x = startX + wNum + wNom;
                dias.forEach(d => {
                    const tot = p.totales_por_dia[d.fecha];
                    const txt = d.esFeriado ? 'F' : (tot ? String(tot[rf.key]) : '0');
                    doc.text(txt, x, y + 2, { width: wDay, align: 'center' });
                    x += wDay;
                });
                y += rowH;
            });
        });

        doc.end();
    });
}

async function generarReporteMensualArchivos(anio, mes) {
    fs.mkdirSync(storageReportesDir, { recursive: true });
    const datosMes = await recopilarResumenMensualCompleto(anio, mes);
    const sufijo = `${datosMes.anio}-${String(datosMes.mes).padStart(2, '0')}`;

    const xlsxFilename = `Asistencia_CCG_${sufijo}.xlsx`;
    const pdfFilename = `Asistencia_CCG_${sufijo}.pdf`;
    const xlsxPath = path.join(storageReportesDir, xlsxFilename);
    const pdfPath = path.join(storageReportesDir, pdfFilename);

    const xlsxBuf = await generarExcelMensual(datosMes);
    fs.writeFileSync(xlsxPath, xlsxBuf);

    const pdfBuf = await generarPdfMensual(datosMes);
    fs.writeFileSync(pdfPath, pdfBuf);

    return {
        xlsxPath,
        pdfPath,
        xlsxFilename,
        pdfFilename,
        xlsxBuffer: xlsxBuf,
        pdfBuffer: pdfBuf,
        resumen: datosMes
    };
}

async function enviarReporteMensual({ anio = null, mes = null, forzar = false, usuarioTrigger = null } = {}) {
    const { anno: annoHoy, fecha } = obtenerFechaHoraChile();
    const mesActualNum = parseInt(fecha.slice(5, 7), 10);

    let y = anio ? parseInt(anio, 10) : annoHoy;
    let m = mes ? parseInt(mes, 10) : (mesActualNum - 1);
    if (!mes && m <= 0) {
        m = 12;
        y = y - 1;
    }

    const claveMes = `${y}-${String(m).padStart(2, '0')}`;
    const cfg = await obtenerConfiguracion();
    if (!forzar && cfg.ultimo_mes_reporte_enviado === claveMes) {
        return {
            ok: true,
            omitido: true,
            mensaje: `El reporte mensual de ${claveMes} ya fue enviado previamente.`
        };
    }

    const destinatarios = cfg.correos_destinatarios_reporte || [];
    if (destinatarios.length === 0) {
        throw new Error('No hay correos destinatarios configurados para el reporte mensual.');
    }

    const archivos = await generarReporteMensualArchivos(y, m);
    const r = archivos.resumen;

    let enviados = 0;
    const adjuntos = [
        { filename: archivos.xlsxFilename, path: archivos.xlsxPath },
        { filename: archivos.pdfFilename, path: archivos.pdfPath }
    ];

    for (const dest of destinatarios) {
        await mailer.enviarConPlantilla({
            clave: 'asistencia_reporte_mensual',
            destinatario: dest,
            adjuntos,
            variables: {
                mes_nombre: r.mes_nombre,
                anio: r.anio,
                total_cursos: r.total_cursos,
                dias_habiles: r.dias_habiles,
                total_inasistencias: r.total_inasistencias,
                porcentaje_mensual: r.porcentaje_mensual
            },
            modulo: 'Asistencia'
        });
        enviados++;
    }

    if (!forzar) {
        await queryRun(
            `INSERT INTO asistencia_config (clave, valor) VALUES ('ultimo_mes_reporte_enviado', ?)
             ON CONFLICT(clave) DO UPDATE SET valor=excluded.valor`,
            [claveMes]
        );
    }

    auditoria.registrarAuditoria({
        usuario: usuarioTrigger,
        modulo: 'Asistencia',
        accion: 'Enviar Reporte Mensual',
        descripcion: `Reporte mensual ${r.mes_nombre} ${r.anio} generado (.xlsx y .pdf) y enviado a ${enviados} destinatarios.`,
        detalles: { periodo: claveMes, enviados, destinatarios, xlsx: archivos.xlsxFilename, pdf: archivos.pdfFilename }
    });

    return {
        ok: true,
        omitido: false,
        periodo: claveMes,
        enviados,
        destinatarios,
        archivos: [archivos.xlsxFilename, archivos.pdfFilename]
    };
}

// -------------------------------------------------------------
// 10. Docentes del Primer Bloque y Envío Diario (12:00 PM)
// -------------------------------------------------------------
async function obtenerCursosPrimerBloque(diaSemanaCustom = null, anno = 2026) {
    const { diaSemana: diaHoy } = obtenerFechaHoraChile();
    const diaConsulta = (diaSemanaCustom || diaHoy).toUpperCase().trim();

    const horarios = await queryAll(`
        SELECT curso, asignatura, profesor 
        FROM horarios 
        WHERE UPPER(dia) = ? AND bloque = 1 AND (anno = ? OR (anno IS NULL AND ? = 2026))
        ORDER BY curso ASC
    `, [diaConsulta, anno, anno]);

    const usuarios = await queryAll(`SELECT id, email, nombre, rol FROM usuarios`);
    const userMap = new Map();
    usuarios.forEach(u => {
        userMap.set(normalizarTexto(u.nombre), u);
        if (u.email) userMap.set(normalizarTexto(u.email.split('@')[0]), u);
    });

    const docentesMap = new Map();

    horarios.forEach(h => {
        const pNorm = normalizarTexto(h.profesor);
        let user = userMap.get(pNorm);

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
            curso: formatearCursoLegible(h.curso),
            curso_normalizado: normalizarCurso(h.curso),
            asignatura: h.asignatura
        });
    });

    return Array.from(docentesMap.values());
}

async function enviarResumenesBloque1({ fecha = null, forzar = false, usuarioTrigger = null } = {}) {
    const { fecha: hoyChile, diaSemana } = obtenerFechaHoraChile();
    const fechaReporte = fecha || hoyChile;
    const diaInfo = await verificarDiaAsistencia(fechaReporte);
    const diaQueryHorarios = normalizarTexto(diaInfo.diaSemana || diaSemana);

    const docentesBloque1 = await obtenerCursosPrimerBloque(diaQueryHorarios);
    if (!docentesBloque1 || docentesBloque1.length === 0) {
        return {
            fecha: fechaReporte,
            enviados: 0,
            omitidos: 0,
            errores: 0,
            mensaje: `No se encontraron docentes con clases programadas en el Bloque 1 para el día ${diaQueryHorarios}.`
        };
    }

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

        let totalPresentesDoc = 0;
        let totalAusentesDoc = 0;
        let totalMatriculaDoc = 0;
        const cursosNombres = [];
        let tarjetasCursosHtml = '';

        doc.cursos.forEach(c => {
            cursosNombres.push(c.curso);
            const asist = mapaAsistencia.get(c.curso_normalizado);

            if (!asist || asist.tomada === false) {
                tarjetasCursosHtml += `
                  <div style="border: 1px solid #fde68a; border-radius: 8px; padding: 14px; margin-bottom: 12px; background-color: #fffbeb;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                      <strong style="font-size: 15px; color: #1e3a8a;">${c.curso}</strong>
                      <span style="font-size: 12px; color: #92400e; background: #fef3c7; padding: 2px 8px; border-radius: 4px;">${c.asignatura}</span>
                    </div>
                    <div style="font-size: 13px; color: #b45309;">⏳ Asistencia aún pendiente de registro por Inspectoría para esta fecha.</div>
                  </div>
                `;
                return;
            }

            totalPresentesDoc += asist.presentes || 0;
            totalAusentesDoc += asist.ausentes || 0;
            totalMatriculaDoc += asist.matricula_total || 0;

            const badgeColor = asist.porcentaje >= 90 ? '#16a34a' : (asist.porcentaje >= 80 ? '#ca8a04' : '#dc2626');
            const listaAusentesStr = (asist.alumnos_ausentes && asist.alumnos_ausentes.length > 0)
                ? `<div style="margin-top: 8px; font-size: 12px; color: #64748b;">
                     <strong>Ausentes registrados:</strong> ${asist.alumnos_ausentes.join(', ')}
                   </div>`
                : '<div style="margin-top: 6px; font-size: 12px; color: #16a34a;">✓ 100% Asistencia / Sin ausencias reportadas</div>';

            tarjetasCursosHtml += `
              <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-bottom: 12px; background-color: #ffffff;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; margin-bottom: 8px;">
                  <strong style="font-size: 15px; color: #1e3a8a;">${c.curso}</strong>
                  <span style="font-size: 12px; color: #64748b; background: #f1f5f9; padding: 2px 8px; border-radius: 4px;">${c.asignatura}</span>
                </div>
                <div style="display: flex; gap: 15px; font-size: 13px; margin: 6px 0;">
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
                    dia_semana: diaQueryHorarios,
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
        detalles: { fecha: fechaReporte, diaSemana: diaQueryHorarios, enviados, omitidos, errores }
    });

    return {
        fecha: fechaReporte,
        dia_semana: diaQueryHorarios,
        total_docentes_bloque1: docentesBloque1.length,
        enviados,
        omitidos,
        errores,
        resultados
    };
}

// -------------------------------------------------------------
// 11. Cron Automático (Diario 12:00 PM Bloque 1 + Mensual Día 1 Hábil 07:30 AM)
// -------------------------------------------------------------
let cronInterval = null;
let ultimoDiaEnvio = null;

async function esPrimerDiaHabilDelMes(fechaStr) {
    const parsed = parsearFechaLocal(fechaStr);
    if (!parsed) return false;
    const diasMes = await obtenerDiasMesAsistencia(parsed.anio, parsed.mes);
    const primerHabil = diasMes.find(d => !d.esFeriado);
    return Boolean(primerHabil && primerHabil.fecha === fechaStr);
}

function iniciarCronAsistencia() {
    if (cronInterval) return;

    console.log('[ASISTENCIA] Tareas programadas (12:00 PM Bloque 1 y 07:30 AM Mensual) iniciadas.');

    cronInterval = setInterval(async () => {
        try {
            const config = await obtenerConfiguracion();
            const { fecha, hora, minuto } = obtenerFechaHoraChile();
            const diaInfo = await verificarDiaAsistencia(fecha);
            if (!diaInfo.habil) return; // Respeta feriados y fines de semana (excepto sábados extra)

            // 1. Envío Diario Bloque 1 (12:00 PM por defecto)
            if (config.envio_automatico_activo) {
                const [horaMeta, minMeta] = (config.hora_envio || '12:00').split(':').map(n => parseInt(n, 10));
                if (hora === horaMeta && minuto >= minMeta && minuto <= (minMeta + 5) && ultimoDiaEnvio !== fecha) {
                    ultimoDiaEnvio = fecha;
                    console.log(`[ASISTENCIA] Disparando envío automático Bloque 1 de las ${config.hora_envio} (${fecha})...`);
                    const resEnvio = await enviarResumenesBloque1({
                        fecha,
                        forzar: false,
                        usuarioTrigger: { email: 'sistema@colegiocerrogrande.cl', nombre: 'Sistema Automático (Cron 12:00 PM)', rol: 'Sistema' }
                    });
                    console.log(`[ASISTENCIA] Envío Bloque 1 completado: ${resEnvio.enviados} enviados.`);
                }
            }

            // 2. Envío Mensual Primer Día Hábil (07:30 AM por defecto)
            if (config.envio_mensual_activo) {
                const [hMens, mMens] = (config.hora_envio_mensual || '07:30').split(':').map(n => parseInt(n, 10));
                if (hora === hMens && minuto >= mMens && minuto <= (mMens + 5)) {
                    const esPrimero = await esPrimerDiaHabilDelMes(fecha);
                    if (esPrimero) {
                        const parsed = parsearFechaLocal(fecha);
                        let yPrev = parsed.anio;
                        let mPrev = parsed.mes - 1;
                        if (mPrev <= 0) { mPrev = 12; yPrev--; }
                        const clavePrev = `${yPrev}-${String(mPrev).padStart(2, '0')}`;

                        if (config.ultimo_mes_reporte_enviado !== clavePrev) {
                            console.log(`[ASISTENCIA] Disparando reporte mensual automático del periodo ${clavePrev}...`);
                            await enviarReporteMensual({
                                anio: yPrev,
                                mes: mPrev,
                                forzar: false,
                                usuarioTrigger: { email: 'sistema@colegiocerrogrande.cl', nombre: 'Sistema Automático (Cron Mensual)', rol: 'Sistema' }
                            });
                        }
                    }
                }
            }
        } catch (e) {
            console.error('[ASISTENCIA] Error en ciclo cron:', e.message);
        }
    }, 60 * 1000);
}

module.exports = {
    getDb,
    CURSOS_OFICIALES,
    normalizarTexto,
    normalizarCurso,
    esCursoValido,
    formatearCursoLegible,
    ordenarPorCurso,
    obtenerFechaHoraChile,
    parsearFechaLocal,
    inicializarTablasAsistencia,
    obtenerConfiguracion,
    guardarConfiguracion,
    evaluarPermisosAsistencia,
    verificarDiaAsistencia,
    obtenerDiasMesAsistencia,
    listarDiasEspeciales,
    agregarDiaEspecial,
    eliminarDiaEspecial,
    importarFeriadosDesdeEventos,
    listarEstudiantes,
    crearEstudiante,
    actualizarEstudiante,
    obtenerEstadoCursosDia,
    obtenerFormularioCurso,
    guardarAsistenciaCurso,
    toggleCeldaAsistencia,
    eliminarAsistenciaCursoFecha,
    recalcularResumenCursoFecha,
    obtenerAsistenciaFecha,
    obtenerPlanillaMensual,
    importarDesdeLibroSheets,
    crearReporteNovedad,
    listarNovedades,
    marcarNovedadRevisada,
    generarReporteMensualArchivos,
    enviarReporteMensual,
    obtenerCursosPrimerBloque,
    enviarResumenesBloque1,
    iniciarCronAsistencia
};
