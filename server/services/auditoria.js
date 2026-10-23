const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const xlsx = require('xlsx');

const dbPath = path.join(__dirname, '..', 'db', 'colegio.db');
let db = null;

function getDb() {
    if (!db) {
        db = new sqlite3.Database(dbPath);
    }
    return db;
}

// -------------------------------------------------------------
// Inicialización y Auto-Healing de la Tabla de Auditoría
// -------------------------------------------------------------
function inicializarTablaAuditoria(callback) {
    const database = getDb();
    database.serialize(() => {
        database.run(`CREATE TABLE IF NOT EXISTS logs_auditoria (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fecha_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
            usuario_id INTEGER,
            usuario_email TEXT NOT NULL,
            usuario_nombre TEXT,
            usuario_rol TEXT,
            modulo TEXT NOT NULL,
            accion TEXT NOT NULL,
            nivel TEXT DEFAULT 'info',
            entidad TEXT,
            entidad_id TEXT,
            descripcion TEXT NOT NULL,
            detalles TEXT,
            ip TEXT,
            user_agent TEXT
        )`);

        database.run(`CREATE INDEX IF NOT EXISTS idx_audit_fecha ON logs_auditoria(fecha_hora)`);
        database.run(`CREATE INDEX IF NOT EXISTS idx_audit_modulo ON logs_auditoria(modulo)`);
        database.run(`CREATE INDEX IF NOT EXISTS idx_audit_usuario ON logs_auditoria(usuario_email)`);
        database.run(`CREATE INDEX IF NOT EXISTS idx_audit_accion ON logs_auditoria(accion)`);
        database.run(`CREATE INDEX IF NOT EXISTS idx_audit_nivel ON logs_auditoria(nivel)`);

        if (typeof callback === 'function') callback();
    });
}

// -------------------------------------------------------------
// Registro Centralizado y Semántico de Acciones (No bloqueante)
// -------------------------------------------------------------
function registrarAuditoria({
    req = null,
    usuario = null,
    modulo = 'General',
    accion = 'Acción',
    nivel = 'info', // 'info', 'success', 'warning', 'danger'
    entidad = null,
    entidad_id = null,
    descripcion,
    detalles = null
}) {
    // Si no viene descripción, armamos una por defecto
    const descFinal = descripcion || `${accion} en ${modulo}${entidad ? ` (${entidad})` : ''}`;

    let uEmail = 'sistema@colegiocerrogrande.cl';
    let uNombre = 'Sistema Automático';
    let uRol = 'Sistema';
    let uId = null;
    let ip = '127.0.0.1';
    let userAgent = 'Node.js / Local';

    if (req) {
        if (req.user) {
            uEmail = req.user.email || uEmail;
            uNombre = req.user.nombre || uNombre;
            uRol = req.user.rol || (req.session && req.session.rolActivo) || uRol;
            uId = req.user.id || null;
        } else if (req.session && req.session.passport && req.session.passport.user) {
            const sessUser = req.session.passport.user;
            if (typeof sessUser === 'object') {
                uEmail = sessUser.email || uEmail;
                uNombre = sessUser.nombre || uNombre;
                uRol = sessUser.rol || uRol;
                uId = sessUser.id || null;
            }
        }

        // Extracción confiable de IP
        const xForwarded = req.headers['x-forwarded-for'];
        if (xForwarded) {
            ip = xForwarded.split(',')[0].trim();
        } else {
            ip = req.ip || (req.connection && req.connection.remoteAddress) || '127.0.0.1';
        }
        if (ip.includes('::ffff:')) ip = ip.replace('::ffff:', '');

        userAgent = req.headers['user-agent'] || 'Desconocido';
    }

    if (usuario) {
        uEmail = usuario.email || uEmail;
        uNombre = usuario.nombre || uNombre;
        uRol = usuario.rol || uRol;
        uId = usuario.id || uId;
    }

    let detallesJson = null;
    if (detalles) {
        if (typeof detalles === 'string') {
            detallesJson = detalles;
        } else {
            try {
                detallesJson = JSON.stringify(detalles);
            } catch (e) {
                detallesJson = JSON.stringify({ error_serializacion: String(detalles) });
            }
        }
    }

    // Ejecución asíncrona segura (fire-and-forget)
    setImmediate(() => {
        try {
            const database = getDb();
            const sql = `INSERT INTO logs_auditoria 
                (usuario_id, usuario_email, usuario_nombre, usuario_rol, modulo, accion, nivel, entidad, entidad_id, descripcion, detalles, ip, user_agent, fecha_hora)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`;

            database.run(sql, [
                uId,
                uEmail,
                uNombre,
                uRol,
                modulo,
                accion,
                nivel,
                entidad,
                entidad_id ? String(entidad_id) : null,
                descFinal,
                detallesJson,
                ip,
                userAgent
            ], (err) => {
                if (err) {
                    console.error('[AUDITORIA] Error registrando log:', err.message);
                }
            });
        } catch (e) {
            console.error('[AUDITORIA] Excepción en servicio:', e.message);
        }
    });
}

// -------------------------------------------------------------
// Consulta Paginada con Filtros Avanzados
// -------------------------------------------------------------
function consultarLogs(query = {}) {
    const {
        desde = null,
        hasta = null,
        modulo = 'todos',
        accion = 'todos',
        nivel = 'todos',
        usuario = '',
        busqueda = '',
        buscar = '',
        q: queryQ = '',
        page,
        pagina,
        limit,
        limite
    } = query;

    return new Promise((resolve, reject) => {
        const database = getDb();
        const p = Math.max(1, parseInt(page || pagina) || 1);
        const l = Math.min(100, Math.max(10, parseInt(limit || limite) || 25));
        const offset = (p - 1) * l;
        const textoBusqueda = (busqueda || buscar || queryQ || '').trim();

        const whereClauses = [];
        const params = [];

        // Filtro por fecha desde (inclusive a las 00:00:00 hora local)
        if (desde) {
            whereClauses.push("date(fecha_hora, 'localtime') >= date(?)");
            params.push(desde);
        }

        // Filtro por fecha hasta (inclusive a las 23:59:59 hora local)
        if (hasta) {
            whereClauses.push("date(fecha_hora, 'localtime') <= date(?)");
            params.push(hasta);
        }

        if (modulo && modulo !== 'todos') {
            whereClauses.push("modulo = ?");
            params.push(modulo);
        }

        if (accion && accion !== 'todos') {
            whereClauses.push("accion = ?");
            params.push(accion);
        }

        if (nivel && nivel !== 'todos') {
            whereClauses.push("nivel = ?");
            params.push(nivel);
        }

        if (usuario && usuario.trim()) {
            whereClauses.push("(LOWER(usuario_email) LIKE ? OR LOWER(usuario_nombre) LIKE ?)");
            params.push(`%${usuario.trim().toLowerCase()}%`, `%${usuario.trim().toLowerCase()}%`);
        }

        if (textoBusqueda) {
            const qParam = `%${textoBusqueda.toLowerCase()}%`;
            whereClauses.push(`(
                LOWER(descripcion) LIKE ? 
                OR LOWER(entidad) LIKE ? 
                OR LOWER(entidad_id) LIKE ? 
                OR LOWER(usuario_nombre) LIKE ? 
                OR LOWER(usuario_email) LIKE ? 
                OR LOWER(detalles) LIKE ?
            )`);
            params.push(qParam, qParam, qParam, qParam, qParam, qParam);
        }

        const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

        const countSql = `SELECT COUNT(*) as total FROM logs_auditoria ${whereSql}`;

        database.get(countSql, params, (errCount, countRow) => {
            if (errCount) return reject(errCount);

            const total = countRow ? countRow.total : 0;
            const totalPages = Math.ceil(total / l) || 1;

            const dataSql = `SELECT id, fecha_hora, usuario_id, usuario_email, usuario_nombre, usuario_rol, 
                             modulo, accion, nivel, entidad, entidad_id, descripcion, detalles, ip, user_agent
                             FROM logs_auditoria ${whereSql} 
                             ORDER BY id DESC LIMIT ? OFFSET ?`;

            database.all(dataSql, [...params, l, offset], (errData, rows) => {
                if (errData) return reject(errData);

                resolve({
                    total,
                    page: p,
                    pagina: p,
                    limit: l,
                    limite: l,
                    totalPages,
                    totalPaginas: totalPages,
                    items: rows || [],
                    logs: rows || []
                });
            });
        });
    });
}

// -------------------------------------------------------------
// Métricas y Resúmenes Ejecutivos (KPIs)
// -------------------------------------------------------------
function obtenerKpisAuditoria() {
    return new Promise((resolve, reject) => {
        const database = getDb();
        const sql = `SELECT 
            COUNT(*) as total_general,
            SUM(CASE WHEN date(fecha_hora, 'localtime') = date('now', 'localtime') THEN 1 ELSE 0 END) as total_hoy,
            SUM(CASE WHEN nivel = 'danger' OR accion IN ('Eliminar', 'Rechazar') THEN 1 ELSE 0 END) as acciones_criticas
            FROM logs_auditoria`;

        const sqlModulo = `SELECT modulo, COUNT(*) as cantidad 
                           FROM logs_auditoria 
                           GROUP BY modulo 
                           ORDER BY cantidad DESC LIMIT 1`;

        database.get(sql, [], (err, row) => {
            if (err) return reject(err);

            database.get(sqlModulo, [], (errMod, modRow) => {
                if (errMod) return reject(errMod);

                const total = (row && row.total_general) || 0;
                const hoy = (row && row.total_hoy) || 0;
                const criticos = (row && row.acciones_criticas) || 0;
                const modNombre = (modRow && modRow.modulo) || null;
                const modCant = (modRow && modRow.cantidad) || 0;

                resolve({
                    total_general: total,
                    total_hoy: hoy,
                    acciones_criticas: criticos,
                    modulo_mas_activo: modNombre ? `${modNombre} (${modCant})` : 'Sin actividad',
                    total,
                    hoy,
                    criticos,
                    moduloLider: modNombre ? { modulo: modNombre, total: modCant } : null
                });
            });
        });
    });
}

// -------------------------------------------------------------
// Exportación a Excel (.xlsx) y CSV
// -------------------------------------------------------------
function exportarLogs(query = {}) {
    const {
        desde = null,
        hasta = null,
        modulo = 'todos',
        accion = 'todos',
        nivel = 'todos',
        usuario = '',
        busqueda = '',
        buscar = '',
        q: queryQ = '',
        formato = 'xlsx'
    } = query;

    return new Promise((resolve, reject) => {
        const database = getDb();
        const textoBusqueda = (busqueda || buscar || queryQ || '').trim();
        const whereClauses = [];
        const params = [];

        if (desde) {
            whereClauses.push("date(fecha_hora, 'localtime') >= date(?)");
            params.push(desde);
        }
        if (hasta) {
            whereClauses.push("date(fecha_hora, 'localtime') <= date(?)");
            params.push(hasta);
        }
        if (modulo && modulo !== 'todos') {
            whereClauses.push("modulo = ?");
            params.push(modulo);
        }
        if (accion && accion !== 'todos') {
            whereClauses.push("accion = ?");
            params.push(accion);
        }
        if (nivel && nivel !== 'todos') {
            whereClauses.push("nivel = ?");
            params.push(nivel);
        }
        if (usuario && usuario.trim()) {
            whereClauses.push("(LOWER(usuario_email) LIKE ? OR LOWER(usuario_nombre) LIKE ?)");
            params.push(`%${usuario.trim().toLowerCase()}%`, `%${usuario.trim().toLowerCase()}%`);
        }
        if (textoBusqueda) {
            const qParam = `%${textoBusqueda.toLowerCase()}%`;
            whereClauses.push(`(
                LOWER(descripcion) LIKE ? 
                OR LOWER(entidad) LIKE ? 
                OR LOWER(entidad_id) LIKE ? 
                OR LOWER(usuario_nombre) LIKE ? 
                OR LOWER(usuario_email) LIKE ? 
                OR LOWER(detalles) LIKE ?
            )`);
            params.push(qParam, qParam, qParam, qParam, qParam, qParam);
        }

        const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
        const dataSql = `SELECT id, datetime(fecha_hora, 'localtime') as fecha_local, usuario_nombre, usuario_email, usuario_rol,
                         modulo, accion, nivel, entidad, entidad_id, descripcion, detalles, ip
                         FROM logs_auditoria ${whereSql} 
                         ORDER BY id DESC LIMIT 50000`;

        database.all(dataSql, params, (err, rows) => {
            if (err) return reject(err);

            const dataArray = (rows || []).map(r => ({
                "ID": r.id,
                "Fecha y Hora (Local)": r.fecha_local || '',
                "Usuario": r.usuario_nombre || '',
                "Correo Electrónico": r.usuario_email || '',
                "Rol": r.usuario_rol || '',
                "Módulo": r.modulo || '',
                "Acción": r.accion || '',
                "Nivel": (r.nivel || '').toUpperCase(),
                "Entidad Afectada": r.entidad ? `${r.entidad}${r.entidad_id ? ` #${r.entidad_id}` : ''}` : '',
                "Descripción de la Acción": r.descripcion || '',
                "Dirección IP": r.ip || '',
                "Detalles Técnicos (JSON)": r.detalles || ''
            }));

            if (formato === 'csv') {
                const ws = xlsx.utils.json_to_sheet(dataArray);
                const csvData = xlsx.utils.sheet_to_csv(ws);
                return resolve({
                    buffer: Buffer.from('\uFEFF' + csvData, 'utf-8'), // BOM para compatibilidad con Excel
                    mimeType: 'text/csv; charset=utf-8',
                    filename: `auditoria_colegio_${new Date().toISOString().slice(0, 10)}.csv`
                });
            }

            // Formato XLSX (Excel Nativo con estilo de columnas)
            const wb = xlsx.utils.book_new();
            const ws = xlsx.utils.json_to_sheet(dataArray);

            // Anchos de columna automáticos
            ws['!cols'] = [
                { wch: 8 },  // ID
                { wch: 20 }, // Fecha
                { wch: 25 }, // Usuario
                { wch: 30 }, // Correo
                { wch: 15 }, // Rol
                { wch: 16 }, // Módulo
                { wch: 16 }, // Acción
                { wch: 10 }, // Nivel
                { wch: 22 }, // Entidad
                { wch: 60 }, // Descripción
                { wch: 16 }, // IP
                { wch: 40 }  // Detalles JSON
            ];

            xlsx.utils.book_append_sheet(wb, ws, "Auditoría de Actividades");
            const xlsxBuffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

            resolve({
                buffer: xlsxBuffer,
                mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                filename: `auditoria_colegio_${new Date().toISOString().slice(0, 10)}.xlsx`
            });
        });
    });
}

// -------------------------------------------------------------
// Purgado / Limpieza de Registros Antiguos
// -------------------------------------------------------------
function limpiarLogsAntiguos(dias = 180) {
    return new Promise((resolve, reject) => {
        const database = getDb();
        const sql = `DELETE FROM logs_auditoria WHERE datetime(fecha_hora) < datetime('now', '-' || ? || ' days')`;
        database.run(sql, [parseInt(dias) || 180], function(err) {
            if (err) return reject(err);
            resolve(this.changes);
        });
    });
}

module.exports = {
    getDb,
    inicializarTablaAuditoria,
    registrarAuditoria,
    consultarLogs,
    obtenerKpisAuditoria,
    exportarLogs,
    limpiarLogsAntiguos
};
