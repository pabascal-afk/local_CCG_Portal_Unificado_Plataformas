const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const xlsx = require('xlsx');

const dbPath = path.join(__dirname, '..', 'db', 'colegio.db');
let db = null;
const userCache = new Map();

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
            user_agent TEXT,
            desencadenado_por TEXT
        )`);

        // Auto-healing para instalaciones o tablas existentes
        database.run(`ALTER TABLE logs_auditoria ADD COLUMN desencadenado_por TEXT`, () => {});

        database.run(`CREATE INDEX IF NOT EXISTS idx_audit_fecha ON logs_auditoria(fecha_hora)`);
        database.run(`CREATE INDEX IF NOT EXISTS idx_audit_modulo ON logs_auditoria(modulo)`);
        database.run(`CREATE INDEX IF NOT EXISTS idx_audit_usuario ON logs_auditoria(usuario_email)`);
        database.run(`CREATE INDEX IF NOT EXISTS idx_audit_accion ON logs_auditoria(accion)`);
        database.run(`CREATE INDEX IF NOT EXISTS idx_audit_nivel ON logs_auditoria(nivel)`);
        database.run(`CREATE INDEX IF NOT EXISTS idx_audit_desencadenado ON logs_auditoria(desencadenado_por)`);

        if (typeof callback === 'function') callback();
    });
}

// -------------------------------------------------------------
// Resolución Inteligente de Usuario desde DB (con caché)
// -------------------------------------------------------------
function resolverUsuarioDB(id, email, callback) {
    const cleanEmail = (typeof email === 'string') ? email.trim().toLowerCase() : '';
    const cleanId = id ? parseInt(id, 10) : null;

    if (!cleanId && (!cleanEmail || cleanEmail === 'sistema@colegiocerrogrande.cl')) {
        return callback(null, null);
    }

    const cacheKey = cleanId ? `id:${cleanId}` : `email:${cleanEmail}`;
    if (userCache.has(cacheKey)) {
        return callback(null, userCache.get(cacheKey));
    }

    const database = getDb();
    let sql = '';
    let params = [];

    if (cleanId && cleanEmail) {
        sql = 'SELECT id, email, nombre, rol FROM usuarios WHERE id = ? OR LOWER(email) = ? LIMIT 1';
        params = [cleanId, cleanEmail];
    } else if (cleanId) {
        sql = 'SELECT id, email, nombre, rol FROM usuarios WHERE id = ? LIMIT 1';
        params = [cleanId];
    } else {
        sql = 'SELECT id, email, nombre, rol FROM usuarios WHERE LOWER(email) = ? LIMIT 1';
        params = [cleanEmail];
    }

    database.get(sql, params, (err, row) => {
        if (err || !row) {
            return callback(null, null);
        }
        userCache.set(`id:${row.id}`, row);
        if (row.email) userCache.set(`email:${row.email.toLowerCase()}`, row);
        callback(null, row);
    });
}

function formatearNombreDesdeEmail(email) {
    if (!email || typeof email !== 'string') return '';
    const prefix = email.split('@')[0].replace(/[._-]/g, ' ');
    return prefix
        .split(' ')
        .filter(Boolean)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
}

// -------------------------------------------------------------
// Registro Centralizado y Semántico de Acciones (No bloqueante)
// -------------------------------------------------------------
function registrarAuditoria(params = {}) {
    const {
        req = null,
        usuario = null,
        user = null,
        usuario_email = null,
        user_email = null,
        email = null,
        usuario_nombre = null,
        user_nombre = null,
        nombre = null,
        usuario_rol = null,
        user_rol = null,
        rol = null,
        usuario_id = null,
        user_id = null,
        id = null,
        desencadenado_por = null,
        iniciado_por = null,
        trigger_por = null,
        autor = null,
        es_sistema = false,
        modulo = 'General',
        accion = 'Acción',
        nivel = 'info', // 'info', 'success', 'warning', 'danger'
        entidad = null,
        entidad_id = null,
        descripcion,
        detalles = null
    } = params;

    let uEmail = usuario_email || user_email || email || null;
    let uNombre = usuario_nombre || user_nombre || nombre || null;
    let uRol = usuario_rol || user_rol || rol || null;
    let uId = usuario_id || user_id || id || null;
    let triggerPor = desencadenado_por || iniciado_por || trigger_por || autor || null;

    let ip = '127.0.0.1';
    let userAgent = 'Node.js / Local';

    // 1. Extraer de objeto usuario o user
    const userObj = (usuario && typeof usuario === 'object') ? usuario : ((user && typeof user === 'object') ? user : null);
    if (userObj) {
        uEmail = userObj.email || uEmail;
        uNombre = userObj.nombre || uNombre;
        uRol = userObj.rol || uRol;
        uId = userObj.id || uId;
    }

    // 2. Extraer de contexto HTTP (req)
    if (req) {
        if (req.user) {
            uEmail = req.user.email || uEmail;
            uNombre = req.user.nombre || uNombre;
            uRol = req.user.rol || (req.session && req.session.rolActivo) || uRol;
            uId = req.user.id || uId;
        } else if (req.session) {
            if (req.session.passport && req.session.passport.user) {
                const sessUser = req.session.passport.user;
                if (typeof sessUser === 'object') {
                    uEmail = sessUser.email || uEmail;
                    uNombre = sessUser.nombre || uNombre;
                    uRol = sessUser.rol || uRol;
                    uId = sessUser.id || uId;
                } else if (typeof sessUser === 'number' || typeof sessUser === 'string') {
                    uId = sessUser;
                }
            }
            if (req.session.user && typeof req.session.user === 'object') {
                uEmail = req.session.user.email || uEmail;
                uNombre = req.session.user.nombre || uNombre;
                uRol = req.session.user.rol || uRol;
                uId = req.session.user.id || uId;
            }
            if (req.session.usuario && typeof req.session.usuario === 'object') {
                uEmail = req.session.usuario.email || uEmail;
                uNombre = req.session.usuario.nombre || uNombre;
                uRol = req.session.usuario.rol || uRol;
                uId = req.session.usuario.id || uId;
            }
            if (!uRol && req.session.rolActivo) {
                uRol = req.session.rolActivo;
            }
        }

        // Headers o Body si existen
        if (!uEmail && req.headers) {
            uEmail = req.headers['x-user-email'] || req.headers['x-usuario-email'] || null;
        }
        if (!uNombre && req.headers) {
            uNombre = req.headers['x-user-nombre'] || req.headers['x-usuario-nombre'] || null;
        }
        if (!uEmail && req.body && typeof req.body === 'object') {
            const bUser = req.body.usuario || req.body.user;
            if (bUser && typeof bUser === 'object') {
                uEmail = bUser.email || uEmail;
                uNombre = bUser.nombre || uNombre;
                uRol = bUser.rol || uRol;
                uId = bUser.id || uId;
            } else if (req.body.profesor_email) {
                uEmail = req.body.profesor_email || uEmail;
            }
        }

        // Extracción confiable de IP
        const xForwarded = req.headers ? req.headers['x-forwarded-for'] : null;
        if (xForwarded) {
            ip = xForwarded.split(',')[0].trim();
        } else {
            ip = req.ip || (req.connection && req.connection.remoteAddress) || '127.0.0.1';
        }
        if (ip.includes('::ffff:')) ip = ip.replace('::ffff:', '');

        userAgent = (req.headers && req.headers['user-agent']) || 'Desconocido';
    }

    // 3. Ejecución asíncrona segura (fire-and-forget) con resolución de DB
    setImmediate(() => {
        try {
            resolverUsuarioDB(uId, uEmail, (errResolv, dbUser) => {
                if (dbUser) {
                    uId = dbUser.id || uId;
                    uEmail = dbUser.email || uEmail;
                    uNombre = (!uNombre || uNombre === 'Sistema Automático' || uNombre === 'Sistema') ? dbUser.nombre : uNombre;
                    uRol = (!uRol || uRol === 'Sistema') ? dbUser.rol : uRol;
                }

                // Si viene correo institucional o de docente y el nombre sigue vacío o genérico
                if (uEmail && (!uNombre || uNombre === 'Sistema Automático' || uNombre === 'Sistema') && uEmail !== 'sistema@colegiocerrogrande.cl') {
                    uNombre = formatearNombreDesdeEmail(uEmail);
                }

                if (triggerPor && typeof triggerPor === 'object') {
                    triggerPor = triggerPor.nombre ? `${triggerPor.nombre} (${triggerPor.email || ''})`.trim() : (triggerPor.email || 'Usuario');
                }

                // Determinar quién desencadenó la acción
                if (!triggerPor) {
                    if (uEmail && uEmail !== 'sistema@colegiocerrogrande.cl') {
                        triggerPor = `${uNombre || uEmail}${uEmail && uNombre ? ` (${uEmail})` : ''}`;
                    } else {
                        triggerPor = 'Sistema (Automático)';
                    }
                }

                // Valores finales de autor
                let actorId = uId;
                let actorEmail = uEmail || 'sistema@colegiocerrogrande.cl';
                let actorNombre = uNombre || (actorEmail !== 'sistema@colegiocerrogrande.cl' ? formatearNombreDesdeEmail(actorEmail) : 'Sistema Automático');
                let actorRol = uRol || (actorEmail !== 'sistema@colegiocerrogrande.cl' ? 'Usuario' : 'Sistema');

                // Si la acción es estrictamente ejecutada por el motor de la plataforma, pero desencadenada por un usuario:
                if (es_sistema) {
                    actorEmail = 'sistema@colegiocerrogrande.cl';
                    actorNombre = 'Sistema Automático';
                    actorRol = 'Sistema';
                }

                // Construcción de detalles enriquecidos
                let parsedDetalles = null;
                if (detalles) {
                    if (typeof detalles === 'object') {
                        parsedDetalles = { ...detalles };
                    } else if (typeof detalles === 'string') {
                        try {
                            parsedDetalles = JSON.parse(detalles);
                        } catch (e) {
                            parsedDetalles = { info: detalles };
                        }
                    }
                }
                if (!parsedDetalles) parsedDetalles = {};

                // Registrar metadatos de quién desencadenó la acción
                if (triggerPor && triggerPor !== 'Sistema (Automático)') {
                    parsedDetalles.desencadenado_por = {
                        identificador: triggerPor,
                        usuario_id: uId,
                        email: uEmail,
                        nombre: uNombre,
                        rol: uRol
                    };
                }

                const detallesJson = JSON.stringify(parsedDetalles);
                const descFinal = descripcion || `${accion} en ${modulo}${entidad ? ` (${entidad})` : ''}`;

                const database = getDb();
                const sql = `INSERT INTO logs_auditoria 
                    (usuario_id, usuario_email, usuario_nombre, usuario_rol, modulo, accion, nivel, entidad, entidad_id, descripcion, detalles, ip, user_agent, desencadenado_por, fecha_hora)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`;

                database.run(sql, [
                    actorId,
                    actorEmail,
                    actorNombre,
                    actorRol,
                    modulo,
                    accion,
                    nivel,
                    entidad,
                    entidad_id ? String(entidad_id) : null,
                    descFinal,
                    detallesJson,
                    ip,
                    userAgent,
                    triggerPor
                ], (errInsert) => {
                    if (errInsert) {
                        console.error('[AUDITORIA] Error registrando log:', errInsert.message);
                    }
                });
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
            whereClauses.push("(LOWER(usuario_email) LIKE ? OR LOWER(usuario_nombre) LIKE ? OR LOWER(desencadenado_por) LIKE ?)");
            params.push(`%${usuario.trim().toLowerCase()}%`, `%${usuario.trim().toLowerCase()}%`, `%${usuario.trim().toLowerCase()}%`);
        }

        if (textoBusqueda) {
            const qParam = `%${textoBusqueda.toLowerCase()}%`;
            whereClauses.push(`(
                LOWER(descripcion) LIKE ? 
                OR LOWER(entidad) LIKE ? 
                OR LOWER(entidad_id) LIKE ? 
                OR LOWER(usuario_nombre) LIKE ? 
                OR LOWER(usuario_email) LIKE ? 
                OR LOWER(desencadenado_por) LIKE ?
                OR LOWER(detalles) LIKE ?
            )`);
            params.push(qParam, qParam, qParam, qParam, qParam, qParam, qParam);
        }

        const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

        const countSql = `SELECT COUNT(*) as total FROM logs_auditoria ${whereSql}`;

        database.get(countSql, params, (errCount, countRow) => {
            if (errCount) return reject(errCount);

            const total = countRow ? countRow.total : 0;
            const totalPages = Math.ceil(total / l) || 1;

            const dataSql = `SELECT id, fecha_hora, usuario_id, usuario_email, usuario_nombre, usuario_rol, 
                             desencadenado_por, modulo, accion, nivel, entidad, entidad_id, descripcion, detalles, ip, user_agent
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
            whereClauses.push("(LOWER(usuario_email) LIKE ? OR LOWER(usuario_nombre) LIKE ? OR LOWER(desencadenado_por) LIKE ?)");
            params.push(`%${usuario.trim().toLowerCase()}%`, `%${usuario.trim().toLowerCase()}%`, `%${usuario.trim().toLowerCase()}%`);
        }
        if (textoBusqueda) {
            const qParam = `%${textoBusqueda.toLowerCase()}%`;
            whereClauses.push(`(
                LOWER(descripcion) LIKE ? 
                OR LOWER(entidad) LIKE ? 
                OR LOWER(entidad_id) LIKE ? 
                OR LOWER(usuario_nombre) LIKE ? 
                OR LOWER(usuario_email) LIKE ? 
                OR LOWER(desencadenado_por) LIKE ?
                OR LOWER(detalles) LIKE ?
            )`);
            params.push(qParam, qParam, qParam, qParam, qParam, qParam, qParam);
        }

        const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
        const dataSql = `SELECT id, datetime(fecha_hora, 'localtime') as fecha_local, usuario_nombre, usuario_email, usuario_rol,
                         desencadenado_por, modulo, accion, nivel, entidad, entidad_id, descripcion, detalles, ip
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
                "Desencadenado Por": r.desencadenado_por || r.usuario_nombre || '',
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
                { wch: 30 }, // Desencadenado Por
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
