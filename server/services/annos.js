/**
 * Servicio de Gestión de Años Escolares y Transición de Ciclo
 * Maneja el ciclo de vida (En preparación, Activo, Cerrado),
 * la clonación de horarios y la promoción de planificaciones interanuales.
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const auditoria = require('./auditoria');

const dbPath = path.join(__dirname, '..', 'db', 'colegio.db');
const db = new sqlite3.Database(dbPath);

function queryAll(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
        });
    });
}

function queryGet(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

function queryRun(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
}

/**
 * Normaliza objeto usuario de forma segura
 */
function normalizarUsuario(usuario) {
    const u = usuario || {};
    const userEmail = u.email || 'sistema@colegiocerrogrande.cl';
    const userName = u.nombre || userEmail.split('@')[0] || 'Sistema';
    const userRol = u.rol || 'Coordinador';
    return { email: userEmail, nombre: userName, rol: userRol };
}

// -------------------------------------------------------------
// 1. Listar Años Escolares con Métricas
// -------------------------------------------------------------
async function listarAnnos() {
    const annosRows = await queryAll(`SELECT * FROM annos_escolares ORDER BY anno DESC`);
    const cfgActivo = await queryGet(`SELECT valor FROM config_global WHERE clave = 'anno_activo_predeterminado'`);
    const annoPredeterminado = cfgActivo ? parseInt(cfgActivo.valor) : 2026;

    const resultado = [];
    for (const a of annosRows) {
        const annoNum = a.anno;

        // Métricas de planificaciones
        const planStats = await queryGet(`
            SELECT 
                COUNT(*) as total_planes,
                SUM(CASE WHEN estado = 'Visada' THEN 1 ELSE 0 END) as visadas
            FROM planificaciones 
            WHERE anio = ?
        `, [annoNum]);

        // Total de cursos en horarios
        const cursoStats = await queryGet(`
            SELECT COUNT(DISTINCT curso) as total_cursos, COUNT(DISTINCT profesor) as total_profesores
            FROM horarios 
            WHERE anno = ? AND curso IS NOT NULL AND TRIM(curso) != ''
        `, [annoNum]);

        // Evaluaciones en rango de fechas
        const evalStats = await queryGet(`
            SELECT COUNT(*) as total_evals
            FROM evaluaciones
            WHERE fecha >= ? AND fecha <= ?
        `, [a.fecha_inicio || `${annoNum}-01-01`, a.fecha_fin || `${annoNum}-12-31`]);

        resultado.push({
            ...a,
            es_predeterminado: (annoNum === annoPredeterminado),
            metricas: {
                total_cursos: cursoStats ? cursoStats.total_cursos : 0,
                total_profesores: cursoStats ? cursoStats.total_profesores : 0,
                total_planificaciones: planStats ? planStats.total_planes : 0,
                planificaciones_visadas: planStats ? (planStats.visadas || 0) : 0,
                total_evaluaciones: evalStats ? evalStats.total_evals : 0
            }
        });
    }

    return resultado;
}

// -------------------------------------------------------------
// 2. Obtener Año Activo Predeterminado
// -------------------------------------------------------------
async function obtenerAnnoActivo() {
    const cfg = await queryGet(`SELECT valor FROM config_global WHERE clave = 'anno_activo_predeterminado'`);
    const annoNum = cfg ? parseInt(cfg.valor) : 2026;

    let annoData = await queryGet(`SELECT * FROM annos_escolares WHERE anno = ?`, [annoNum]);
    if (!annoData) {
        annoData = {
            anno: annoNum,
            nombre: `Año Escolar ${annoNum}`,
            estado: 'Activo',
            fecha_inicio: `${annoNum}-03-02`,
            fecha_fin: `${annoNum}-12-18`
        };
    }
    return annoData;
}

// -------------------------------------------------------------
// 3. Crear Nuevo Año Escolar (ej. 2027)
// -------------------------------------------------------------
async function crearAnno(datos, usuario) {
    const user = normalizarUsuario(usuario);
    const annoNum = parseInt(datos.anno);
    if (!annoNum || isNaN(annoNum) || annoNum < 2020 || annoNum > 2050) {
        throw new Error("Debe especificar un año escolar válido (ej. 2027).");
    }

    const existe = await queryGet(`SELECT anno FROM annos_escolares WHERE anno = ?`, [annoNum]);
    if (existe) {
        throw new Error(`El Año Escolar ${annoNum} ya existe en el sistema.`);
    }

    const nombre = datos.nombre || `Año Escolar ${annoNum}`;
    const estado = datos.estado || 'En preparacion'; // 'En preparacion', 'Activo', 'Cerrado'
    const fInicio = datos.fecha_inicio || `${annoNum}-03-02`;
    const fFin = datos.fecha_fin || `${annoNum}-12-18`;
    const fTerminoS1 = datos.fecha_termino_primer_semestre || `${annoNum}-07-03`;
    const fInicioS2 = datos.fecha_inicio_segundo_semestre || `${annoNum}-07-27`;
    const diasHabiles = parseInt(datos.dias_habiles_estimados) || 180;
    const desc = datos.descripcion || `Ciclo lectivo ${annoNum} del Colegio Cerro Grande`;

    await queryRun(`
        INSERT INTO annos_escolares
        (anno, nombre, estado, fecha_inicio, fecha_fin, fecha_termino_primer_semestre, fecha_inicio_segundo_semestre, dias_habiles_estimados, descripcion)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [annoNum, nombre, estado, fInicio, fFin, fTerminoS1, fInicioS2, diasHabiles, desc]);

    // Propagar catálogo curricular base del MINEDUC si el nuevo año no tiene planes creados aún
    const planesExistentes = await queryGet(`SELECT COUNT(*) as c FROM curriculo_planes WHERE anio = ?`, [annoNum]);
    if (!planesExistentes || planesExistentes.c === 0) {
        const planesOrigen = await queryAll(`SELECT * FROM curriculo_planes WHERE anio = 2026`);
        for (const p of planesOrigen) {
            const insP = await queryRun(`
                INSERT OR IGNORE INTO curriculo_planes
                (anio, tipo, nivel, asignatura, descripcion, habilidades_sugeridas, activo)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [annoNum, p.tipo, p.nivel, p.asignatura, p.descripcion, p.habilidades_sugeridas || '[]', 1]);
            const nuevoPlanId = insP.lastID;

            if (nuevoPlanId) {
                const objsOrigen = await queryAll(`SELECT * FROM curriculo_objetivos WHERE plan_id = ?`, [p.id]);
                for (const o of objsOrigen) {
                    await queryRun(`
                        INSERT INTO curriculo_objetivos
                        (plan_id, tipo_objetivo, eje_unidad, unidad_sugerida, codigo, descripcion, indicadores_sugeridos, categoria, orden, activo)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `, [nuevoPlanId, o.tipo_objetivo, o.eje_unidad, o.unidad_sugerida, o.codigo, o.descripcion, o.indicadores_sugeridos, o.categoria, o.orden, 1]);
                }
            }
        }
    }

    auditoria.registrarAuditoria({
        modulo: 'AÑOS ESCOLARES',
        accion: 'Crear Año Escolar',
        descripcion: `Creó el ${nombre} en estado '${estado}'`,
        detalles: { anno: annoNum, nombre, estado, fInicio, fFin },
        usuario_email: user.email,
        usuario_nombre: user.nombre,
        rol: user.rol,
        nivel: 'success'
    });

    return { anno: annoNum, mensaje: `${nombre} creado exitosamente.` };
}

// -------------------------------------------------------------
// 4. Actualizar Fechas y Estado de un Año Escolar
// -------------------------------------------------------------
async function actualizarAnno(anno, datos, usuario) {
    const user = normalizarUsuario(usuario);
    const annoNum = parseInt(anno);

    const actual = await queryGet(`SELECT * FROM annos_escolares WHERE anno = ?`, [annoNum]);
    if (!actual) throw new Error(`Año Escolar ${annoNum} no encontrado.`);

    const nombre = datos.nombre || actual.nombre;
    const estado = datos.estado || actual.estado;
    const fInicio = datos.fecha_inicio || actual.fecha_inicio;
    const fFin = datos.fecha_fin || actual.fecha_fin;
    const fTerminoS1 = datos.fecha_termino_primer_semestre || actual.fecha_termino_primer_semestre;
    const fInicioS2 = datos.fecha_inicio_segundo_semestre || actual.fecha_inicio_segundo_semestre;
    const diasHabiles = datos.dias_habiles_estimados !== undefined ? parseInt(datos.dias_habiles_estimados) : actual.dias_habiles_estimados;
    const desc = datos.descripcion !== undefined ? datos.descripcion : actual.descripcion;

    await queryRun(`
        UPDATE annos_escolares SET
            nombre = ?,
            estado = ?,
            fecha_inicio = ?,
            fecha_fin = ?,
            fecha_termino_primer_semestre = ?,
            fecha_inicio_segundo_semestre = ?,
            dias_habiles_estimados = ?,
            descripcion = ?,
            actualizado_en = CURRENT_TIMESTAMP
        WHERE anno = ?
    `, [nombre, estado, fInicio, fFin, fTerminoS1, fInicioS2, diasHabiles, desc, annoNum]);

    auditoria.registrarAuditoria({
        modulo: 'AÑOS ESCOLARES',
        accion: 'Actualizar Año Escolar',
        descripcion: `Actualizó datos y configuración del ${nombre}`,
        detalles: { anno: annoNum, estado, fInicio, fFin },
        usuario_email: user.email,
        usuario_nombre: user.nombre,
        rol: user.rol,
        nivel: 'info'
    });

    return { mensaje: `${nombre} actualizado correctamente.` };
}

// -------------------------------------------------------------
// 5. Establecer Año Activo Predeterminado del Colegio
// -------------------------------------------------------------
async function establecerAnnoActivo(anno, usuario) {
    const user = normalizarUsuario(usuario);
    const annoNum = parseInt(anno);

    const existe = await queryGet(`SELECT * FROM annos_escolares WHERE anno = ?`, [annoNum]);
    if (!existe) throw new Error(`El Año Escolar ${annoNum} no existe.`);

    await queryRun(`
        INSERT INTO config_global (clave, valor) VALUES ('anno_activo_predeterminado', ?)
        ON CONFLICT(clave) DO UPDATE SET valor = excluded.valor
    `, [String(annoNum)]);

    // Marcar como Activo en la tabla si estaba En preparacion
    if (existe.estado !== 'Activo') {
        await queryRun(`UPDATE annos_escolares SET estado = 'Activo', actualizado_en = CURRENT_TIMESTAMP WHERE anno = ?`, [annoNum]);
    }

    auditoria.registrarAuditoria({
        modulo: 'AÑOS ESCOLARES',
        accion: 'Cambiar Año Predeterminado',
        descripcion: `Estableció el Año Escolar ${annoNum} como predeterminado para el establecimiento`,
        detalles: { anno: annoNum },
        usuario_email: user.email,
        usuario_nombre: user.nombre,
        rol: user.rol,
        nivel: 'warning'
    });

    return { anno: annoNum, mensaje: `Año Escolar ${annoNum} activado como predeterminado.` };
}

// -------------------------------------------------------------
// 6. Clonar Malla Horaria Interanual (ej. 2026 -> 2027)
// -------------------------------------------------------------
async function clonarHorariosInteranual(annoOrigen, annoDestino, usuario) {
    const user = normalizarUsuario(usuario);
    const orig = parseInt(annoOrigen);
    const dest = parseInt(annoDestino);

    if (orig === dest) throw new Error("El año de origen y destino no pueden ser el mismo.");

    const existeDest = await queryGet(`SELECT COUNT(*) as c FROM horarios WHERE anno = ?`, [dest]);
    if (existeDest && existeDest.c > 0) {
        throw new Error(`El año ${dest} ya tiene ${existeDest.c} bloques de horarios asignados. Debe limpiarlos antes de clonar.`);
    }

    const rowsOrigen = await queryAll(`SELECT * FROM horarios WHERE anno = ?`, [orig]);
    if (rowsOrigen.length === 0) {
        throw new Error(`No se encontraron horarios registrados en el año origen ${orig}.`);
    }

    let insertados = 0;
    for (const h of rowsOrigen) {
        await queryRun(`
            INSERT INTO horarios (curso, dia, bloque, asignatura, profesor, anno)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [h.curso, h.dia, h.bloque, h.asignatura, h.profesor, dest]);
        insertados++;
    }

    auditoria.registrarAuditoria({
        modulo: 'AÑOS ESCOLARES',
        accion: 'Clonar Horarios Interanuales',
        descripcion: `Clonó la malla horaria completa de ${orig} a ${dest} (${insertados} bloques)`,
        detalles: { anno_origen: orig, anno_destino: dest, total_bloques: insertados },
        usuario_email: user.email,
        usuario_nombre: user.nombre,
        rol: user.rol,
        nivel: 'success'
    });

    return { total_clonados: insertados, mensaje: `Se clonaron ${insertados} bloques de horarios exitosamente a ${dest}.` };
}

// -------------------------------------------------------------
// 7. Promover Planificaciones Aprobadas al Nuevo Año (2026 -> 2027)
// -------------------------------------------------------------
async function promoverPlanificacionesInteranual(annoOrigen, annoDestino, { planIds = null, soloVisadas = true } = {}, usuario) {
    const user = normalizarUsuario(usuario);
    let orig = parseInt(annoOrigen);
    const dest = parseInt(annoDestino);

    if (!orig && Array.isArray(planIds) && planIds.length > 0) {
        const row = await queryGet(`SELECT anio FROM planificaciones WHERE id = ?`, [planIds[0]]);
        if (row) orig = row.anio;
    }

    if (!orig || !dest) throw new Error("Debe especificar año de origen y año de destino.");
    if (orig === dest) throw new Error("El año de origen y destino no pueden ser el mismo.");

    let sql = `SELECT * FROM planificaciones WHERE anio = ?`;
    const params = [orig];
    if (soloVisadas) {
        sql += ` AND estado = 'Visada'`;
    }
    if (Array.isArray(planIds) && planIds.length > 0) {
        sql += ` AND id IN (${planIds.map(() => '?').join(',')})`;
        params.push(...planIds);
    }

    const planesOrigen = await queryAll(sql, params);
    if (planesOrigen.length === 0) {
        return { promovidas: 0, ignoradas: 0, mensaje: "No se encontraron planificaciones que cumplan los criterios para promover." };
    }

    let promovidas = 0;
    let ignoradas = 0;

    for (const p of planesOrigen) {
        // Verificar si ya existe en destino
        const yaExiste = await queryGet(`SELECT id FROM planificaciones WHERE anio = ? AND curso = ? AND asignatura = ?`, [dest, p.curso, p.asignatura]);
        if (yaExiste) {
            ignoradas++;
            continue;
        }

        // Determinar docente responsable según el nuevo horario de destino (si existe)
        const docNuevoHorario = await queryGet(`
            SELECT profesor FROM horarios 
            WHERE anno = ? AND curso = ? AND asignatura = ? AND profesor IS NOT NULL AND TRIM(profesor) != '' 
            LIMIT 1
        `, [dest, p.curso, p.asignatura]);

        const docenteResponsable = (docNuevoHorario && docNuevoHorario.profesor) 
            ? docNuevoHorario.profesor 
            : p.docente_responsable;

        const nuevoTitulo = `Planificación Anual ${p.asignatura} - ${p.curso} (${dest})`;

        const resIns = await queryRun(`
            INSERT INTO planificaciones
            (anio, curso, asignatura, plan_curricular_id, titulo, docente_responsable, docentes_colaboradores, estado, metas_anuales, horas_anuales, creado_por, cursos_vinculados)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'En edición', ?, ?, ?, ?)
        `, [
            dest,
            p.curso,
            p.asignatura,
            p.plan_curricular_id,
            nuevoTitulo,
            docenteResponsable,
            p.docentes_colaboradores || '[]',
            p.metas_anuales,
            p.horas_anuales,
            user.email,
            '[]'
        ]);

        const nuevoPlanId = resIns.lastID;

        // Copiar unidades
        const unidades = await queryAll(`SELECT * FROM planificaciones_unidades WHERE planificacion_id = ? ORDER BY numero_unidad ASC, orden ASC`, [p.id]);
        for (const u of unidades) {
            await queryRun(`
                INSERT INTO planificaciones_unidades
                (planificacion_id, numero_unidad, nombre_unidad, semestre, fecha_inicio, fecha_fin, horas_estimadas, oas_seleccionados, oats_seleccionados, habilidades, actitudes, indicadores_evaluacion, instrumentos_evaluacion, desglose_semanal, tags, orden)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                nuevoPlanId,
                u.numero_unidad,
                u.nombre_unidad,
                u.semestre,
                null, // Las fechas se ajustan al nuevo calendario
                null,
                u.horas_estimadas,
                u.oas_seleccionados,
                u.oats_seleccionados,
                u.habilidades,
                u.actitudes,
                u.indicadores_evaluacion,
                u.instrumentos_evaluacion,
                u.desglose_semanal || '[]',
                u.tags || '[]',
                u.orden
            ]);
        }

        // Crear Checkpoint inicial V1.0
        const planificacionService = require('./planificacion');
        await planificacionService.crearCheckpointVersion(
            nuevoPlanId,
            `V1.0: Promovida desde Año Escolar ${orig} por ${user.nombre}`,
            user,
            'checkpoint'
        );

        promovidas++;
    }

    auditoria.registrarAuditoria({
        modulo: 'AÑOS ESCOLARES',
        accion: 'Promover Planificaciones',
        descripcion: `Promovió ${promovidas} planificaciones desde ${orig} a ${dest} (ignoradas por existir: ${ignoradas})`,
        detalles: { anno_origen: orig, anno_destino: dest, promovidas, ignoradas },
        usuario_email: user.email,
        usuario_nombre: user.nombre,
        rol: user.rol,
        nivel: 'success'
    });

    return {
        promovidas,
        ignoradas,
        mensaje: `Se promovieron ${promovidas} planificaciones exitosamente a ${dest}.${ignoradas > 0 ? ` (${ignoradas} ya existían).` : ''}`
    };
}

// -------------------------------------------------------------
// 8. Cerrar Año Escolar (Modo Histórico / Solo Lectura)
// -------------------------------------------------------------
async function cerrarAnno(anno, usuario) {
    const user = normalizarUsuario(usuario);
    const annoNum = parseInt(anno);

    const actual = await queryGet(`SELECT * FROM annos_escolares WHERE anno = ?`, [annoNum]);
    if (!actual) throw new Error(`Año Escolar ${annoNum} no encontrado.`);

    await queryRun(`UPDATE annos_escolares SET estado = 'Cerrado', actualizado_en = CURRENT_TIMESTAMP WHERE anno = ?`, [annoNum]);

    auditoria.registrarAuditoria({
        modulo: 'AÑOS ESCOLARES',
        accion: 'Cerrar Año Escolar',
        descripcion: `Cerró el ${actual.nombre} pasando a modo histórico solo-lectura`,
        detalles: { anno: annoNum },
        usuario_email: user.email,
        usuario_nombre: user.nombre,
        rol: user.rol,
        nivel: 'warning'
    });

    return { mensaje: `${actual.nombre} cerrado correctamente. Ha pasado a modo histórico (solo lectura).` };
}

module.exports = {
    listarAnnos,
    obtenerAnnoActivo,
    crearAnno,
    actualizarAnno,
    establecerAnnoActivo,
    clonarHorariosInteranual,
    promoverPlanificacionesInteranual,
    cerrarAnno
};
