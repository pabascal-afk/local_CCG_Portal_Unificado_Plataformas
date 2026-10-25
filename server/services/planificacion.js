/**
 * Servicio Central de Planificación Curricular y Medición de Cobertura Académica
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const xlsx = require('xlsx');
const mailer = require('./mailer');
const auditoria = require('./auditoria');
const curriculoSeed = require('./curriculo_seed');

const dbPath = path.join(__dirname, '..', 'db', 'colegio.db');
let dbInstance = null;

function getDb() {
    if (!dbInstance) {
        dbInstance = new sqlite3.Database(dbPath);
    }
    return dbInstance;
}

// Helpers de promesas para SQLite
function queryGet(sql, params = []) {
    return new Promise((resolve, reject) => {
        getDb().get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

function queryAll(sql, params = []) {
    return new Promise((resolve, reject) => {
        getDb().all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
        });
    });
}

function queryRun(sql, params = []) {
    return new Promise((resolve, reject) => {
        getDb().run(sql, params, function (err) {
            if (err) reject(err);
            else resolve({ lastID: this.lastID, changes: this.changes });
        });
    });
}

/**
 * Normaliza nombres de asignaturas (sin tildes, mayúsculas, espacios compactos)
 */
function normalizar(txt) {
    if (!txt) return '';
    return txt.toString().trim().toUpperCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, ' ');
}

/**
 * Mapea el nombre del curso a un nivel educativo estándar MINEDUC
 * Ej: "3° BASICO A" -> "3° Básico", "II° MEDIO B" -> "II° Medio"
 */
function inferirNivelDesdeCurso(curso) {
    if (!curso) return '';
    const c = curso.toUpperCase();
    if (c.includes('1° BASICO') || c.includes('PRIMERO BASICO') || c.includes('1 BASICO')) return '1° Básico';
    if (c.includes('2° BASICO') || c.includes('SEGUNDO BASICO') || c.includes('2 BASICO')) return '2° Básico';
    if (c.includes('3° BASICO') || c.includes('TERCERO BASICO') || c.includes('3 BASICO')) return '3° Básico';
    if (c.includes('4° BASICO') || c.includes('CUARTO BASICO') || c.includes('4 BASICO')) return '4° Básico';
    if (c.includes('5° BASICO') || c.includes('QUINTO BASICO') || c.includes('5 BASICO')) return '5° Básico';
    if (c.includes('6° BASICO') || c.includes('SEXTO BASICO') || c.includes('6 BASICO')) return '6° Básico';
    if (c.includes('7° BASICO') || c.includes('SEPTIMO BASICO') || c.includes('7 BASICO')) return '7° Básico';
    if (c.includes('8° BASICO') || c.includes('OCTAVO BASICO') || c.includes('8 BASICO')) return '8° Básico';
    if (c.includes('I° MEDIO') || c.includes('PRIMERO MEDIO') || c.includes('1 MEDIO') || c.includes('1° MEDIO')) return 'I° Medio';
    if (c.includes('II° MEDIO') || c.includes('SEGUNDO MEDIO') || c.includes('2 MEDIO') || c.includes('2° MEDIO')) return 'II° Medio';
    if (c.includes('III° MEDIO') || c.includes('TERCERO MEDIO') || c.includes('3 MEDIO') || c.includes('3° MEDIO')) return 'III° Medio';
    if (c.includes('IV° MEDIO') || c.includes('CUARTO MEDIO') || c.includes('4 MEDIO') || c.includes('4° MEDIO')) return 'IV° Medio';
    if (c.includes('KINDER')) return 'Kinder';
    if (c.includes('PRE-KINDER') || c.includes('PREKINDER')) return 'Pre-Kinder';
    return curso;
}

/**
 * Normaliza nombres de asignaturas según taxonomía y nivel MINEDUC
 */
function normalizarAsignaturaMineduc(asig, nivel = '') {
    if (!asig) return '';
    const clean = normalizar(asig);
    if (clean === 'LENGUAJE' || clean === 'LENGUAJE Y COMUNICACION') {
        if (nivel.includes('Medio') || nivel.includes('7°') || nivel.includes('8°')) {
            return 'LENGUA Y LITERATURA';
        }
        return 'LENGUAJE Y COMUNICACION';
    }
    if (clean === 'LENGUA Y LITERATURA') return 'LENGUA Y LITERATURA';
    if (clean === 'MATEMATICAS' || clean === 'MATEMATICA') return 'MATEMATICA';
    if (clean === 'HISTORIA Y GEOGRAFIA' || clean === 'HISTORIA' || clean === 'HISTORIA, GEOGRAFIA Y CIENCIAS SOCIALES') {
        if (nivel.includes('III°') || nivel.includes('IV°')) {
            return 'EDUCACION CIUDADANA';
        }
        return 'HISTORIA, GEOGRAFIA Y CIENCIAS SOCIALES';
    }
    if (clean === 'EDUCACION FISICA' || clean === 'EDUCACION FISICA Y SALUD') return 'EDUCACION FISICA Y SALUD';
    if (clean === 'CIENCIAS' || clean === 'CIENCIAS NATURALES') return 'CIENCIAS NATURALES';
    return clean;
}

// -------------------------------------------------------------
// 1. Obtener Cursos y Carga Horaria del Docente
// -------------------------------------------------------------
async function obtenerCursosDocente(usuarioEmail, usuarioNombre, anio = 2026) {
    const anioNum = parseInt(anio) || 2026;
    
    // 1. Cursos donde el profesor figura en la malla de horarios
    const qDocente = `
        SELECT DISTINCT curso, asignatura, profesor 
        FROM horarios 
        WHERE (
            LOWER(profesor) LIKE '%' || LOWER(?) || '%' 
            OR LOWER(?) LIKE '%' || LOWER(profesor) || '%'
        ) AND curso IS NOT NULL AND TRIM(curso) != ''
        ORDER BY curso ASC, asignatura ASC
    `;
    const misCursosHorario = await queryAll(qDocente, [usuarioNombre || usuarioEmail, usuarioNombre || usuarioEmail]);

    // 2. Todos los cursos y asignaturas disponibles en el colegio
    const todosCursosRows = await queryAll(`
        SELECT DISTINCT curso FROM (
            SELECT curso FROM horarios WHERE curso IS NOT NULL AND TRIM(curso) != ''
            UNION
            SELECT curso FROM evaluaciones WHERE curso IS NOT NULL AND TRIM(curso) != ''
        ) ORDER BY 
          CASE 
            WHEN curso LIKE '%KINDER%' THEN 1
            WHEN curso LIKE '%1°%' THEN 2
            WHEN curso LIKE '%2°%' THEN 3
            WHEN curso LIKE '%3°%' THEN 4
            WHEN curso LIKE '%4°%' THEN 5
            WHEN curso LIKE '%5°%' THEN 6
            WHEN curso LIKE '%6°%' THEN 7
            WHEN curso LIKE '%7°%' THEN 8
            WHEN curso LIKE '%8°%' THEN 9
            WHEN curso LIKE '%I°%' THEN 10
            WHEN curso LIKE '%II°%' THEN 11
            WHEN curso LIKE '%III°%' THEN 12
            WHEN curso LIKE '%IV°%' THEN 13
            ELSE 20
          END, curso ASC
    `);
    const todosLosCursos = todosCursosRows.map(r => r.curso);

    const todasAsignaturasRows = await queryAll(`
        SELECT DISTINCT asignatura FROM horarios 
        WHERE asignatura IS NOT NULL AND TRIM(asignatura) != ''
        ORDER BY asignatura ASC
    `);
    const todasLasAsignaturas = todasAsignaturasRows.map(r => r.asignatura);

    // 3. Planificaciones existentes para el año
    const planificacionesExistentes = await queryAll(`
        SELECT p.id, p.anio, p.curso, p.asignatura, p.titulo, p.docente_responsable, 
               p.docentes_colaboradores, p.cursos_vinculados, p.estado, p.visado_por, p.visado_fecha, p.actualizado_en,
               (SELECT COUNT(*) FROM planificaciones_unidades u WHERE u.planificacion_id = p.id) as total_unidades
        FROM planificaciones p
        WHERE p.anio = ?
    `, [anioNum]);

    const planMap = {};
    planificacionesExistentes.forEach(p => {
        let vincs = [];
        try { vincs = JSON.parse(p.cursos_vinculados || '[]'); } catch (e) { vincs = []; }
        p.cursos_vinculados_arr = vincs;

        // Registro del curso principal
        const kPrincipal = `${p.curso}___${normalizar(p.asignatura)}`;
        planMap[kPrincipal] = { ...p, es_vinculado: false, curso_principal: p.curso };

        // Registro de cada curso vinculado
        vincs.forEach(cVin => {
            const kVinc = `${cVin}___${normalizar(p.asignatura)}`;
            planMap[kVinc] = { ...p, es_vinculado: true, curso_principal: p.curso };
        });
    });

    // Enriquecer la carga horaria del docente con el estado de su planificación
    const misAsignaciones = misCursosHorario.map(c => {
        const k = `${c.curso}___${normalizar(c.asignatura)}`;
        const plan = planMap[k] || null;
        return {
            curso: c.curso,
            asignatura: c.asignatura,
            nivel: inferirNivelDesdeCurso(c.curso),
            planificacion_id: plan ? plan.id : null,
            titulo: plan ? plan.titulo : null,
            estado: plan ? plan.estado : 'Sin iniciar',
            total_unidades: plan ? plan.total_unidades : 0,
            actualizado_en: plan ? plan.actualizado_en : null,
            es_vinculado: plan ? !!plan.es_vinculado : false,
            curso_principal: plan ? plan.curso_principal : null,
            cursos_vinculados: plan ? plan.cursos_vinculados_arr : []
        };
    });

    return {
        anio: anioNum,
        misAsignaciones,
        todosLosCursos,
        todasLasAsignaturas
    };
}

// -------------------------------------------------------------
// 2. Listar Planificaciones con Filtros
// -------------------------------------------------------------
async function listarPlanificaciones({ anio = 2026, curso = '', asignatura = '', docente = '', estado = '' } = {}) {
    const anioNum = parseInt(anio) || 2026;
    const where = ['p.anio = ?'];
    const params = [anioNum];

    if (curso && curso !== 'todos') {
        where.push('(p.curso = ? OR p.cursos_vinculados LIKE ?)');
        params.push(curso, `%"${curso}"%`);
    }
    if (asignatura && asignatura !== 'todas') {
        where.push('p.asignatura LIKE ?');
        params.push(`%${asignatura}%`);
    }
    if (estado && estado !== 'todos') {
        where.push('p.estado = ?');
        params.push(estado);
    }
    if (docente && docente.trim()) {
        const d = `%${docente.trim().toLowerCase()}%`;
        where.push('(LOWER(p.docente_responsable) LIKE ? OR LOWER(p.docentes_colaboradores) LIKE ?)');
        params.push(d, d);
    }

    const sql = `
        SELECT p.id, p.anio, p.curso, p.asignatura, p.titulo, p.docente_responsable,
               p.docentes_colaboradores, p.cursos_vinculados, p.estado, p.visado_por, p.visado_fecha, p.visado_comentario,
               p.horas_anuales, p.actualizado_en, p.creado_en,
               (SELECT COUNT(*) FROM planificaciones_unidades u WHERE u.planificacion_id = p.id) as total_unidades,
               (SELECT COUNT(*) FROM planificaciones_versiones v WHERE v.planificacion_id = p.id) as total_versiones,
               (SELECT COUNT(*) FROM planificaciones_observaciones o WHERE o.planificacion_id = p.id AND o.resuelto = 0) as observaciones_pendientes
        FROM planificaciones p
        WHERE ${where.join(' AND ')}
        ORDER BY p.curso ASC, p.asignatura ASC
    `;

    const planes = await queryAll(sql, params);

    // Enriquecer cada plan con la métrica de cobertura básica y parsing de vinculados
    for (const p of planes) {
        try { p.cursos_vinculados = JSON.parse(p.cursos_vinculados || '[]'); } catch (e) { p.cursos_vinculados = []; }
        try {
            const cob = await calcularCoberturaCurricular({ anio: p.anio, curso: p.curso, asignatura: p.asignatura, planId: p.id });
            p.cobertura_oas_pct = cob.cobertura_oas_pct;
            p.oas_cubiertos = cob.oas_cubiertos;
            p.oas_totales_programa = cob.oas_totales_programa;
            p.semaforo = cob.semaforo;
        } catch (e) {
            p.cobertura_oas_pct = 0;
            p.semaforo = 'Rojo';
        }
    }

    return planes;
}

// -------------------------------------------------------------
// 3. Detalle Completo de una Planificación
// -------------------------------------------------------------
async function obtenerPlanificacionDetalle(id) {
    const plan = await queryGet(`
        SELECT p.*, cp.descripcion as descripcion_curriculo
        FROM planificaciones p
        LEFT JOIN curriculo_planes cp ON cp.id = p.plan_curricular_id
        WHERE p.id = ?
    `, [id]);

    if (!plan) {
        throw new Error("Planificación no encontrada.");
    }

    try {
        plan.docentes_colaboradores = JSON.parse(plan.docentes_colaboradores || '[]');
    } catch (e) {
        plan.docentes_colaboradores = [];
    }
    try {
        plan.cursos_vinculados = JSON.parse(plan.cursos_vinculados || '[]');
    } catch (e) {
        plan.cursos_vinculados = [];
    }

    // Unidades ordenadas
    const unidades = await queryAll(`
        SELECT * FROM planificaciones_unidades 
        WHERE planificacion_id = ? 
        ORDER BY numero_unidad ASC, orden ASC
    `, [id]);

    unidades.forEach(u => {
        try { u.oas_seleccionados = JSON.parse(u.oas_seleccionados || '[]'); } catch (e) { u.oas_seleccionados = []; }
        try { u.oats_seleccionados = JSON.parse(u.oats_seleccionados || '[]'); } catch (e) { u.oats_seleccionados = []; }
        try { u.tags = JSON.parse(u.tags || '[]'); } catch (e) { u.tags = []; }
        try { u.desglose_semanal = JSON.parse(u.desglose_semanal || '[]'); } catch (e) { u.desglose_semanal = []; }
    });
    plan.unidades = unidades;

    // Catálogo de OAs disponibles para este curso y asignatura
    const nivel = inferirNivelDesdeCurso(plan.curso);
    const asigEstandar = normalizarAsignaturaMineduc(plan.asignatura, nivel);

    // Buscar plan curricular correspondiente
    let planCurr = null;
    if (plan.plan_curricular_id) {
        planCurr = await queryGet(`SELECT * FROM curriculo_planes WHERE id = ?`, [plan.plan_curricular_id]);
    }
    if (!planCurr) {
        planCurr = await queryGet(`
            SELECT * FROM curriculo_planes 
            WHERE anio = ? AND nivel = ? AND (
                asignatura = ? 
                OR asignatura = ?
                OR LOWER(asignatura) LIKE '%' || LOWER(?) || '%' 
                OR LOWER(?) LIKE '%' || LOWER(asignatura) || '%'
            ) LIMIT 1
        `, [plan.anio, nivel, asigEstandar, plan.asignatura, plan.asignatura, plan.asignatura]);
    }

    let oasDisponibles = [];
    if (planCurr) {
        try {
            planCurr.habilidades_sugeridas = JSON.parse(planCurr.habilidades_sugeridas || '[]');
        } catch (e) {
            planCurr.habilidades_sugeridas = [];
        }
        if (planCurr.habilidades_sugeridas.length === 0) {
            planCurr.habilidades_sugeridas = curriculoSeed.HABILIDADES_POR_ASIGNATURA[planCurr.asignatura] || [];
        }
        plan.plan_curricular = planCurr;

        oasDisponibles = await queryAll(`
            SELECT id, plan_id, tipo_objetivo, eje_unidad, unidad_sugerida, codigo, descripcion, categoria, indicadores_sugeridos, orden
            FROM curriculo_objetivos 
            WHERE plan_id = ? AND activo = 1
            ORDER BY orden ASC, codigo ASC
        `, [planCurr.id]);
    } else {
        // Búsqueda flexible de OAs por nivel
        oasDisponibles = await queryAll(`
            SELECT o.id, o.plan_id, o.tipo_objetivo, o.eje_unidad, o.unidad_sugerida, o.codigo, o.descripcion, o.categoria, o.indicadores_sugeridos, o.orden, cp.asignatura as asignatura_programa
            FROM curriculo_objetivos o
            JOIN curriculo_planes cp ON cp.id = o.plan_id
            WHERE cp.anio = ? AND cp.nivel = ? AND o.activo = 1
            ORDER BY o.eje_unidad ASC, o.codigo ASC
        `, [plan.anio, nivel]);
    }

    // Parsear indicadores_sugeridos para cada OA
    oasDisponibles.forEach(o => {
        try {
            o.indicadores_sugeridos = JSON.parse(o.indicadores_sugeridos || '[]');
        } catch (e) {
            o.indicadores_sugeridos = [];
        }
    });

    plan.oas_disponibles = oasDisponibles;
    plan.actitudes_sugeridas = curriculoSeed.ACTITUDES_GENERALES_MINEDUC;

    // Observaciones activas
    const observaciones = await queryAll(`
        SELECT * FROM planificaciones_observaciones 
        WHERE planificacion_id = ? 
        ORDER BY creado_en DESC
    `, [id]);
    plan.observaciones = observaciones;

    // Historial de versiones (Checkpoints tipo git)
    const versiones = await queryAll(`
        SELECT id, version_numero, mensaje, autor_email, autor_nombre, tipo_snapshot, creado_en
        FROM planificaciones_versiones 
        WHERE planificacion_id = ? 
        ORDER BY id DESC
    `, [id]);
    plan.versiones = versiones;

    // Cobertura calculada
    plan.cobertura = await calcularCoberturaCurricular({
        anio: plan.anio,
        curso: plan.curso,
        asignatura: plan.asignatura,
        planId: plan.id
    });

    return plan;
}

// -------------------------------------------------------------
// 4. Crear Planificación
// -------------------------------------------------------------
async function crearPlanificacion(payload, usuario) {
    const anio = parseInt(payload.anio) || 2026;
    const curso = (payload.curso || '').trim().toUpperCase();
    const asignatura = (payload.asignatura || '').trim().toUpperCase();

    if (!curso || !asignatura) {
        throw new Error("El curso y la asignatura son obligatorios.");
    }

    // Verificar si ya existe para este curso y asignatura
    const existe = await queryGet(`
        SELECT id, titulo FROM planificaciones 
        WHERE anio = ? AND curso = ? AND asignatura = ?
    `, [anio, curso, asignatura]);

    if (existe) {
        throw new Error(`Ya existe una planificación para ${curso} - ${asignatura} en el año ${anio}.`);
    }

    // Vincular automáticamente con el plan oficial MINEDUC si existe
    const nivel = inferirNivelDesdeCurso(curso);
    const asigEstandar = normalizarAsignaturaMineduc(asignatura, nivel);
    let planCurricularId = payload.plan_curricular_id || null;
    if (!planCurricularId) {
        const pc = await queryGet(`
            SELECT id FROM curriculo_planes 
            WHERE anio = ? AND nivel = ? AND (
                asignatura = ? 
                OR asignatura = ?
                OR LOWER(asignatura) LIKE '%' || LOWER(?) || '%' 
                OR LOWER(?) LIKE '%' || LOWER(asignatura) || '%'
            ) LIMIT 1
        `, [anio, nivel, asigEstandar, asignatura, asignatura, asignatura]);
        if (pc) planCurricularId = pc.id;
    }

    const titulo = payload.titulo || `Planificación Anual ${asignatura} - ${curso} (${anio})`;
    const docenteResponsable = payload.docente_responsable || usuario.nombre || usuario.email;
    const colaboradores = JSON.stringify(payload.docentes_colaboradores || []);
    const metas = payload.metas_anuales || '';
    const horasAnuales = parseInt(payload.horas_anuales) || 152;

    const resIns = await queryRun(`
        INSERT INTO planificaciones 
        (anio, curso, asignatura, plan_curricular_id, titulo, docente_responsable, docentes_colaboradores, estado, metas_anuales, horas_anuales, creado_por)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'En edición', ?, ?, ?)
    `, [anio, curso, asignatura, planCurricularId, titulo, docenteResponsable, colaboradores, metas, horasAnuales, usuario.email]);

    const planId = resIns.lastID;

    // Crear al menos Unidad 1 por defecto
    await queryRun(`
        INSERT INTO planificaciones_unidades 
        (planificacion_id, numero_unidad, nombre_unidad, semestre, fecha_inicio, fecha_fin, horas_estimadas, orden)
        VALUES (?, 1, 'Unidad 1: Introducción y Fundamentos', 1, '${anio}-03-02', '${anio}-04-30', 38, 1)
    `, [planId]);

    // Snapshot inicial ("Tipo Git")
    await crearCheckpointVersion(planId, 'V1.0: Creación inicial de la planificación', usuario, 'checkpoint');

    // Auditoría
    auditoria.registrarAuditoria({
        modulo: 'PLANIFICACIONES',
        accion: 'Crear',
        descripcion: `Creó la planificación ${titulo} para ${curso} - ${asignatura}`,
        detalles: { plan_id: planId, anio, curso, asignatura, docente: docenteResponsable },
        usuario_email: usuario.email,
        usuario_nombre: usuario.nombre,
        rol: usuario.rol,
        nivel: 'success'
    });

    return { id: planId, mensaje: "Planificación creada con éxito." };
}

// -------------------------------------------------------------
// 5. Guardar Cambios en Planificación (Borrador / Auto-guardado)
// -------------------------------------------------------------
async function guardarPlanificacion(id, payload, usuario) {
    const plan = await queryGet(`SELECT * FROM planificaciones WHERE id = ?`, [id]);
    if (!plan) throw new Error("Planificación no encontrada.");

    // Actualizar cabecera del plan anual
    await queryRun(`
        UPDATE planificaciones SET 
            titulo = COALESCE(?, titulo),
            docente_responsable = COALESCE(?, docente_responsable),
            docentes_colaboradores = COALESCE(?, docentes_colaboradores),
            cursos_vinculados = COALESCE(?, cursos_vinculados),
            metas_anuales = COALESCE(?, metas_anuales),
            horas_anuales = COALESCE(?, horas_anuales),
            actualizado_en = CURRENT_TIMESTAMP
        WHERE id = ?
    `, [
        payload.titulo,
        payload.docente_responsable,
        payload.docentes_colaboradores ? JSON.stringify(payload.docentes_colaboradores) : null,
        payload.cursos_vinculados ? JSON.stringify(payload.cursos_vinculados) : null,
        payload.metas_anuales,
        payload.horas_anuales,
        id
    ]);

    // Sincronizar unidades si vienen en el payload
    if (Array.isArray(payload.unidades)) {
        // IDs recibidos
        const idsRecibidos = payload.unidades.filter(u => u.id).map(u => u.id);

        // Eliminar unidades que ya no estén
        if (idsRecibidos.length > 0) {
            await queryRun(`DELETE FROM planificaciones_unidades WHERE planificacion_id = ? AND id NOT IN (${idsRecibidos.join(',')})`, [id]);
        } else {
            await queryRun(`DELETE FROM planificaciones_unidades WHERE planificacion_id = ?`, [id]);
        }

        // Insertar o actualizar cada unidad
        for (let i = 0; i < payload.unidades.length; i++) {
            const u = payload.unidades[i];
            const numUnidad = parseInt(u.numero_unidad) || (i + 1);
            const nombre = (u.nombre_unidad || `Unidad ${numUnidad}`).trim();
            const semestre = parseInt(u.semestre) || 1;
            const fInicio = u.fecha_inicio || null;
            const fFin = u.fecha_fin || null;
            const horas = parseInt(u.horas_estimadas) || 0;
            const oas = JSON.stringify(u.oas_seleccionados || []);
            const oats = JSON.stringify(u.oats_seleccionados || []);
            const habs = u.habilidades || '';
            const acts = u.actitudes || '';
            const indics = u.indicadores_evaluacion || '';
            const insts = u.instrumentos_evaluacion || '';
            const desglose = JSON.stringify(u.desglose_semanal || []);
            const tags = JSON.stringify(u.tags || []);
            const orden = parseInt(u.orden) || (i + 1);

            if (u.id) {
                await queryRun(`
                    UPDATE planificaciones_unidades SET
                        numero_unidad = ?,
                        nombre_unidad = ?,
                        semestre = ?,
                        fecha_inicio = ?,
                        fecha_fin = ?,
                        horas_estimadas = ?,
                        oas_seleccionados = ?,
                        oats_seleccionados = ?,
                        habilidades = ?,
                        actitudes = ?,
                        indicadores_evaluacion = ?,
                        instrumentos_evaluacion = ?,
                        desglose_semanal = ?,
                        tags = ?,
                        orden = ?
                    WHERE id = ? AND planificacion_id = ?
                `, [numUnidad, nombre, semestre, fInicio, fFin, horas, oas, oats, habs, acts, indics, insts, desglose, tags, orden, u.id, id]);
            } else {
                await queryRun(`
                    INSERT INTO planificaciones_unidades
                    (planificacion_id, numero_unidad, nombre_unidad, semestre, fecha_inicio, fecha_fin, horas_estimadas, oas_seleccionados, oats_seleccionados, habilidades, actitudes, indicadores_evaluacion, instrumentos_evaluacion, desglose_semanal, tags, orden)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [id, numUnidad, nombre, semestre, fInicio, fFin, horas, oas, oats, habs, acts, indics, insts, desglose, tags, orden]);
            }
        }
    }

    return { mensaje: "Planificación guardada correctamente." };
}

// -------------------------------------------------------------
// 5b. Clonar Planificación (Copia Independiente a Paralelo)
// -------------------------------------------------------------
async function clonarPlanificacion(planId, cursoDestino, usuario) {
    if (!cursoDestino || !cursoDestino.trim()) {
        throw new Error("Debe especificar el curso de destino.");
    }
    const destinoNorm = cursoDestino.trim().toUpperCase();

    const plan = await queryGet(`SELECT * FROM planificaciones WHERE id = ?`, [planId]);
    if (!plan) throw new Error("Planificación de origen no encontrada.");

    if (plan.curso === destinoNorm) {
        throw new Error("El curso de destino no puede ser el mismo curso de origen.");
    }

    // Verificar si ya existe planificación para el curso de destino
    const existe = await queryGet(`SELECT id FROM planificaciones WHERE anio = ? AND curso = ? AND asignatura = ?`, [plan.anio, destinoNorm, plan.asignatura]);
    if (existe) {
        throw new Error(`Ya existe una planificación para ${destinoNorm} - ${plan.asignatura} en el año ${plan.anio}.`);
    }

    const nuevoTitulo = `Planificación Anual ${plan.asignatura} - ${destinoNorm} (${plan.anio})`;

    const resIns = await queryRun(`
        INSERT INTO planificaciones 
        (anio, curso, asignatura, plan_curricular_id, titulo, docente_responsable, docentes_colaboradores, estado, metas_anuales, horas_anuales, creado_por, cursos_vinculados)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'En edición', ?, ?, ?, '[]')
    `, [
        plan.anio,
        destinoNorm,
        plan.asignatura,
        plan.plan_curricular_id,
        nuevoTitulo,
        plan.docente_responsable,
        plan.docentes_colaboradores,
        plan.metas_anuales,
        plan.horas_anuales,
        usuario.email
    ]);

    const nuevoPlanId = resIns.lastID;

    // Copiar todas las unidades
    const unidades = await queryAll(`SELECT * FROM planificaciones_unidades WHERE planificacion_id = ? ORDER BY numero_unidad ASC, orden ASC`, [planId]);
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
            u.fecha_inicio,
            u.fecha_fin,
            u.horas_estimadas,
            u.oas_seleccionados,
            u.oats_seleccionados,
            u.habilidades,
            u.actitudes,
            u.indicadores_evaluacion,
            u.instrumentos_evaluacion,
            u.desglose_semanal,
            u.tags || '[]',
            u.orden
        ]);
    }

    // Checkpoint de creación
    await crearCheckpointVersion(
        nuevoPlanId,
        `V1.0: Clonada desde ${plan.curso} por ${usuario.nombre || usuario.email}`,
        usuario,
        'checkpoint'
    );

    auditoria.registrarAuditoria({
        modulo: 'PLANIFICACIONES',
        accion: 'Clonar',
        descripcion: `Clonó la planificación de ${plan.curso} a ${destinoNorm} en ${plan.asignatura}`,
        detalles: { plan_origen_id: planId, nuevo_plan_id: nuevoPlanId, curso_origen: plan.curso, curso_destino: destinoNorm, asignatura: plan.asignatura },
        usuario_email: usuario.email,
        usuario_nombre: usuario.nombre,
        rol: usuario.rol,
        nivel: 'success'
    });

    return { id: nuevoPlanId, mensaje: `Planificación clonada con éxito a ${destinoNorm}.` };
}

// -------------------------------------------------------------
// 5c. Vincular Curso (Planificación Compartida en Vivo)
// -------------------------------------------------------------
async function vincularCurso(planId, cursoVinculado, usuario) {
    if (!cursoVinculado || !cursoVinculado.trim()) {
        throw new Error("Debe especificar el curso a vincular.");
    }
    const vinculadNorm = cursoVinculado.trim().toUpperCase();

    const plan = await queryGet(`SELECT * FROM planificaciones WHERE id = ?`, [planId]);
    if (!plan) throw new Error("Planificación no encontrada.");

    if (plan.curso === vinculadNorm) {
        throw new Error("No puede vincular el curso consigo mismo.");
    }

    let arr = [];
    try { arr = JSON.parse(plan.cursos_vinculados || '[]'); } catch (e) { arr = []; }

    if (arr.includes(vinculadNorm)) {
        throw new Error(`El curso ${vinculadNorm} ya está vinculado a esta planificación.`);
    }

    // Verificar si ya tiene planificación propia
    const existePropia = await queryGet(`SELECT id FROM planificaciones WHERE anio = ? AND curso = ? AND asignatura = ?`, [plan.anio, vinculadNorm, plan.asignatura]);
    if (existePropia) {
        throw new Error(`El curso ${vinculadNorm} ya tiene una planificación propia independiente. Debe eliminarla o desvincularla primero.`);
    }

    arr.push(vinculadNorm);
    await queryRun(`UPDATE planificaciones SET cursos_vinculados = ?, actualizado_en = CURRENT_TIMESTAMP WHERE id = ?`, [JSON.stringify(arr), planId]);

    await crearCheckpointVersion(
        planId,
        `Vinculación de paralelo ${vinculadNorm}`,
        usuario,
        'checkpoint'
    );

    auditoria.registrarAuditoria({
        modulo: 'PLANIFICACIONES',
        accion: 'Vincular',
        descripcion: `Vinculó el curso paralelo ${vinculadNorm} a la planificación de ${plan.curso} (${plan.asignatura})`,
        detalles: { plan_id: planId, curso_principal: plan.curso, curso_vinculado: vinculadNorm },
        usuario_email: usuario.email,
        usuario_nombre: usuario.nombre,
        rol: usuario.rol,
        nivel: 'info'
    });

    return { cursos_vinculados: arr, mensaje: `Curso ${vinculadNorm} vinculado exitosamente a ${plan.curso}.` };
}

// -------------------------------------------------------------
// 5d. Desvincular Curso (Con opción de fork/copia independiente)
// -------------------------------------------------------------
async function desvincularCurso(planId, cursoDesvincular, { crearCopia = false } = {}, usuario) {
    if (!cursoDesvincular || !cursoDesvincular.trim()) {
        throw new Error("Debe especificar el curso a desvincular.");
    }
    const desvNorm = cursoDesvincular.trim().toUpperCase();

    const plan = await queryGet(`SELECT * FROM planificaciones WHERE id = ?`, [planId]);
    if (!plan) throw new Error("Planificación no encontrada.");

    let arr = [];
    try { arr = JSON.parse(plan.cursos_vinculados || '[]'); } catch (e) { arr = []; }

    if (!arr.includes(desvNorm)) {
        throw new Error(`El curso ${desvNorm} no está vinculado a esta planificación.`);
    }

    arr = arr.filter(c => c !== desvNorm);
    await queryRun(`UPDATE planificaciones SET cursos_vinculados = ?, actualizado_en = CURRENT_TIMESTAMP WHERE id = ?`, [JSON.stringify(arr), planId]);

    let nuevoPlanId = null;
    if (crearCopia) {
        // Clonar la planificación actual como plan independiente para el curso desvinculado
        const resClon = await clonarPlanificacion(planId, desvNorm, usuario);
        nuevoPlanId = resClon.id;
    }

    await crearCheckpointVersion(
        planId,
        `Desvinculación del curso paralelo ${desvNorm}${crearCopia ? ' (se generó copia independiente)' : ''}`,
        usuario,
        'checkpoint'
    );

    auditoria.registrarAuditoria({
        modulo: 'PLANIFICACIONES',
        accion: 'Desvincular',
        descripcion: `Desvinculó el curso paralelo ${desvNorm} de la planificación de ${plan.curso} (${plan.asignatura})`,
        detalles: { plan_id: planId, curso_desvinculado: desvNorm, copia_creada: crearCopia, nuevo_plan_id: nuevoPlanId },
        usuario_email: usuario.email,
        usuario_nombre: usuario.nombre,
        rol: usuario.rol,
        nivel: 'info'
    });

    return {
        cursos_vinculados: arr,
        nuevo_plan_id: nuevoPlanId,
        mensaje: `Curso ${desvNorm} desvinculado exitosamente.${crearCopia ? ' Se creó una copia independiente.' : ''}`
    };
}

// -------------------------------------------------------------
// 6. Control de Versiones Tipo Git (Checkpoints y Restauración)
// -------------------------------------------------------------
async function crearCheckpointVersion(planificacionId, mensaje, usuario, tipo = 'checkpoint') {
    const plan = await queryGet(`SELECT * FROM planificaciones WHERE id = ?`, [planificacionId]);
    if (!plan) throw new Error("Planificación no encontrada.");

    const unidades = await queryAll(`SELECT * FROM planificaciones_unidades WHERE planificacion_id = ? ORDER BY numero_unidad ASC`, [planificacionId]);

    // Snapshot completo en formato JSON
    const snapshot = {
        plan,
        unidades,
        timestamp: new Date().toISOString()
    };

    // Contar checkpoints previos para generar versión semántica (V1.0, V1.1, etc.)
    const countRow = await queryGet(`SELECT COUNT(*) as total FROM planificaciones_versiones WHERE planificacion_id = ?`, [planificacionId]);
    const numVersion = `V1.${countRow ? countRow.total : 0}`;

    const res = await queryRun(`
        INSERT INTO planificaciones_versiones 
        (planificacion_id, version_numero, mensaje, autor_email, autor_nombre, contenido_completo, tipo_snapshot)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
        planificacionId,
        numVersion,
        mensaje || `Guardado de versión ${numVersion}`,
        usuario.email,
        usuario.nombre || usuario.email,
        JSON.stringify(snapshot),
        tipo
    ]);

    auditoria.registrarAuditoria({
        modulo: 'PLANIFICACIONES',
        accion: 'Guardar Versión',
        descripcion: `Creó el checkpoint de versión ${numVersion}: "${mensaje}" en ${plan.curso} - ${plan.asignatura}`,
        detalles: { plan_id: planificacionId, version: numVersion, mensaje },
        usuario_email: usuario.email,
        usuario_nombre: usuario.nombre,
        rol: usuario.rol,
        nivel: 'info'
    });

    return { id: res.lastID, version_numero: numVersion, mensaje: "Versión guardada con éxito." };
}

async function restaurarVersion(planificacionId, versionId, usuario) {
    const version = await queryGet(`SELECT * FROM planificaciones_versiones WHERE id = ? AND planificacion_id = ?`, [versionId, planificacionId]);
    if (!version) throw new Error("Versión no encontrada para esta planificación.");

    let snapshot;
    try {
        snapshot = JSON.parse(version.contenido_completo);
    } catch (e) {
        throw new Error("El archivo de respaldo de esta versión está corrupto.");
    }

    const { plan, unidades } = snapshot;

    // 1. Restaurar cabecera de la planificación
    if (plan) {
        await queryRun(`
            UPDATE planificaciones SET
                titulo = ?,
                docente_responsable = ?,
                docentes_colaboradores = ?,
                metas_anuales = ?,
                horas_anuales = ?,
                actualizado_en = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [plan.titulo, plan.docente_responsable, plan.docentes_colaboradores, plan.metas_anuales, plan.horas_anuales, planificacionId]);
    }

    // 2. Restaurar unidades
    if (Array.isArray(unidades)) {
        await queryRun(`DELETE FROM planificaciones_unidades WHERE planificacion_id = ?`, [planificacionId]);
        for (const u of unidades) {
            await queryRun(`
                INSERT INTO planificaciones_unidades
                (planificacion_id, numero_unidad, nombre_unidad, semestre, fecha_inicio, fecha_fin, horas_estimadas, oas_seleccionados, oats_seleccionados, habilidades, actitudes, indicadores_evaluacion, instrumentos_evaluacion, desglose_semanal, orden)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                planificacionId,
                u.numero_unidad,
                u.nombre_unidad,
                u.semestre,
                u.fecha_inicio,
                u.fecha_fin,
                u.horas_estimadas,
                u.oas_seleccionados,
                u.oats_seleccionados,
                u.habilidades,
                u.actitudes,
                u.indicadores_evaluacion,
                u.instrumentos_evaluacion,
                u.desglose_semanal,
                u.orden
            ]);
        }
    }

    // Registrar un nuevo checkpoint de restauración
    await crearCheckpointVersion(
        planificacionId,
        `Restauración a partir de versión ${version.version_numero} (${version.mensaje})`,
        usuario,
        'checkpoint'
    );

    auditoria.registrarAuditoria({
        modulo: 'PLANIFICACIONES',
        accion: 'Restaurar Versión',
        descripcion: `Restauró la planificación al estado de la versión ${version.version_numero}`,
        detalles: { plan_id: planificacionId, version_restaurada: version.version_numero },
        usuario_email: usuario.email,
        usuario_nombre: usuario.nombre,
        rol: usuario.rol,
        nivel: 'warning'
    });

    return { mensaje: `Planificación restaurada exitosamente a la versión ${version.version_numero}.` };
}

// -------------------------------------------------------------
// 7. Flujo Ágil de Revisión y Visado (En edición <-> Visada)
// -------------------------------------------------------------
async function cambiarEstadoVisado(planificacionId, { estado, comentario }, usuario) {
    const plan = await queryGet(`SELECT * FROM planificaciones WHERE id = ?`, [planificacionId]);
    if (!plan) throw new Error("Planificación no encontrada.");

    const nuevoEstado = (estado === 'Visada') ? 'Visada' : 'En edición';
    const visadoPor = (nuevoEstado === 'Visada') ? usuario.email : null;
    const visadoFecha = (nuevoEstado === 'Visada') ? new Date().toISOString() : null;

    await queryRun(`
        UPDATE planificaciones SET
            estado = ?,
            visado_por = ?,
            visado_fecha = ?,
            visado_comentario = COALESCE(?, visado_comentario),
            actualizado_en = CURRENT_TIMESTAMP
        WHERE id = ?
    `, [nuevoEstado, visadoPor, visadoFecha, comentario, planificacionId]);

    // Crear checkpoint de visado
    const msj = nuevoEstado === 'Visada'
        ? `Visada por Coordinación (${usuario.nombre || usuario.email}): ${comentario || 'Aprobada sin observaciones.'}`
        : `Reabierta a edición por ${usuario.nombre || usuario.email}: ${comentario || 'Modificaciones solicitadas.'}`;

    await crearCheckpointVersion(planificacionId, msj, usuario, 'visado');

    // Registrar en auditoría
    auditoria.registrarAuditoria({
        modulo: 'PLANIFICACIONES',
        accion: nuevoEstado === 'Visada' ? 'Visar' : 'Reabrir',
        descripcion: `${nuevoEstado === 'Visada' ? 'Visó' : 'Reabrió'} la planificación de ${plan.curso} - ${plan.asignatura}`,
        detalles: { plan_id: planificacionId, estado: nuevoEstado, comentario },
        usuario_email: usuario.email,
        usuario_nombre: usuario.nombre,
        rol: usuario.rol,
        nivel: nuevoEstado === 'Visada' ? 'success' : 'warning'
    });

    // Enviar notificación por correo al docente responsable si está configurado
    if (plan.docente_responsable && plan.docente_responsable.includes('@')) {
        mailer.enviarConPlantilla({
            clave: 'aviso_general',
            variables: {
                profesor_nombre: plan.docente_responsable.split('@')[0],
                titulo_aviso: `Estado de Planificación: ${plan.curso} - ${plan.asignatura}`,
                mensaje_aviso: `La planificación ha cambiado de estado a <strong>${nuevoEstado}</strong> por ${usuario.nombre || usuario.email}.<br>Observaciones: ${comentario || 'Sin observaciones adicionales.'}`
            },
            destinatario: plan.docente_responsable,
            modulo: 'Planificaciones'
        }).catch(e => console.error("Error enviando correo de visado:", e.message));
    }

    return { estado: nuevoEstado, mensaje: `Planificación actualizada a '${nuevoEstado}'.` };
}

// -------------------------------------------------------------
// 8. Observaciones y Retroalimentación Pedagógica
// -------------------------------------------------------------
async function agregarObservacion(planificacionId, { seccion = 'general', comentario }, usuario) {
    if (!comentario || !comentario.trim()) {
        throw new Error("El comentario no puede estar vacío.");
    }

    const res = await queryRun(`
        INSERT INTO planificaciones_observaciones
        (planificacion_id, seccion, autor_email, autor_nombre, autor_rol, comentario)
        VALUES (?, ?, ?, ?, ?, ?)
    `, [
        planificacionId,
        seccion,
        usuario.email,
        usuario.nombre || usuario.email,
        usuario.rol || 'Profesor',
        comentario.trim()
    ]);

    return { id: res.lastID, mensaje: "Observación agregada exitosamente." };
}

// -------------------------------------------------------------
// 9. Medición de Cobertura Curricular en 3 Dimensiones
// -------------------------------------------------------------
async function calcularCoberturaCurricular({ anio = 2026, curso, asignatura, planId = null }) {
    const anioNum = parseInt(anio) || 2026;
    const nivel = inferirNivelDesdeCurso(curso);

    // 1. Obtener los OAs de la planificación activa
    let plan = null;
    if (planId) {
        plan = await queryGet(`SELECT id, plan_curricular_id FROM planificaciones WHERE id = ?`, [planId]);
    } else {
        plan = await queryGet(`SELECT id, plan_curricular_id FROM planificaciones WHERE anio = ? AND curso = ? AND asignatura = ?`, [anioNum, curso, asignatura]);
    }

    const oasCubiertosSet = new Set();
    const oasBasalesCubiertosSet = new Set();

    if (plan) {
        const unidades = await queryAll(`SELECT oas_seleccionados FROM planificaciones_unidades WHERE planificacion_id = ?`, [plan.id]);
        unidades.forEach(u => {
            let oasArr = [];
            try { oasArr = JSON.parse(u.oas_seleccionados || '[]'); } catch (e) { }
            oasArr.forEach(item => {
                const cod = (typeof item === 'object') ? item.codigo : item;
                if (cod) oasCubiertosSet.add(cod.trim().toUpperCase());
            });
        });
    }

    // 2. Obtener el universo total de OAs del programa oficial MINEDUC o propio
    let totalPrograma = 0;
    let basalesPrograma = 0;
    let complementariosPrograma = 0;
    const oasPrograma = [];

    // Buscar plan curricular
    let planCurr = null;
    const asigEstandar = normalizarAsignaturaMineduc(asignatura, nivel);
    if (plan && plan.plan_curricular_id) {
        planCurr = await queryGet(`SELECT id FROM curriculo_planes WHERE id = ?`, [plan.plan_curricular_id]);
    }
    if (!planCurr) {
        planCurr = await queryGet(`
            SELECT id FROM curriculo_planes 
            WHERE anio = ? AND nivel = ? AND (
                asignatura = ? 
                OR asignatura = ?
                OR LOWER(asignatura) LIKE '%' || LOWER(?) || '%' 
                OR LOWER(?) LIKE '%' || LOWER(asignatura) || '%'
            ) LIMIT 1
        `, [anioNum, nivel, asigEstandar, asignatura, asignatura, asignatura]);
    }

    if (planCurr) {
        const objs = await queryAll(`SELECT codigo, categoria, descripcion FROM curriculo_objetivos WHERE plan_id = ? AND activo = 1`, [planCurr.id]);
        totalPrograma = objs.length;
        objs.forEach(o => {
            const cod = o.codigo.trim().toUpperCase();
            oasPrograma.push(o);
            if (o.categoria === 'Basal') {
                basalesPrograma++;
                if (oasCubiertosSet.has(cod)) {
                    oasBasalesCubiertosSet.add(cod);
                }
            } else {
                complementariosPrograma++;
            }
        });
    }

    // Porcentajes de cobertura
    const totalCubiertos = oasCubiertosSet.size;
    const pctTotal = totalPrograma > 0 ? Math.round((totalCubiertos / totalPrograma) * 100) : 0;
    const pctBasales = basalesPrograma > 0 ? Math.round((oasBasalesCubiertosSet.size / basalesPrograma) * 100) : 0;

    // 3. Cruce con Evaluaciones Calendarizadas (Dimensión Evaluativa)
    const evals = await queryAll(`
        SELECT id, fecha, tipo, temario, detalles FROM evaluaciones 
        WHERE curso = ? AND asignatura = ? AND fecha LIKE ?
        ORDER BY fecha ASC
    `, [curso, asignatura, `${anioNum}%`]);

    // 4. Semáforo y Avance Temporal
    // Determinar mes actual del año escolar (Marzo a Diciembre = mes 3 a 12)
    const mesActual = new Date().getMonth() + 1;
    let pctEsperadoFecha = 0;
    if (mesActual <= 3) pctEsperadoFecha = 15;
    else if (mesActual === 4) pctEsperadoFecha = 25;
    else if (mesActual === 5) pctEsperadoFecha = 40;
    else if (mesActual === 6 || mesActual === 7) pctEsperadoFecha = 50;
    else if (mesActual === 8) pctEsperadoFecha = 65;
    else if (mesActual === 9) pctEsperadoFecha = 75;
    else if (mesActual === 10) pctEsperadoFecha = 85;
    else pctEsperadoFecha = 100;

    let semaforo = 'Verde';
    if (pctTotal < 50) semaforo = 'Rojo';
    else if (pctTotal < 75) semaforo = 'Amarillo';

    return {
        curso,
        asignatura,
        nivel,
        cobertura_oas_pct: pctTotal,
        cobertura_basales_pct: pctBasales,
        oas_cubiertos: totalCubiertos,
        oas_basales_cubiertos: oasBasalesCubiertosSet.size,
        oas_totales_programa: totalPrograma,
        oas_basales_programa: basalesPrograma,
        evaluaciones_calendarizadas: evals.length,
        pct_esperado_fecha: pctEsperadoFecha,
        semaforo,
        codigos_cubiertos: Array.from(oasCubiertosSet)
    };
}

// -------------------------------------------------------------
// 10. Dashboard de Cobertura Curricular del Colegio
// -------------------------------------------------------------
async function obtenerDashboardCoberturaColegio(anio = 2026) {
    const anioNum = parseInt(anio) || 2026;

    // Obtener todos los cursos y asignaturas que tienen o deberían tener planificación
    const pares = await queryAll(`
        SELECT DISTINCT curso, asignatura 
        FROM horarios 
        WHERE curso IS NOT NULL AND TRIM(curso) != '' AND asignatura IS NOT NULL AND TRIM(asignatura) != ''
        ORDER BY curso ASC, asignatura ASC
    `);

    // Planificaciones existentes
    const planes = await queryAll(`
        SELECT id, curso, asignatura, cursos_vinculados, estado, docente_responsable, visado_por, visado_fecha, actualizado_en 
        FROM planificaciones 
        WHERE anio = ?
    `, [anioNum]);

    const planMap = {};
    planes.forEach(p => {
        let vincs = [];
        try { vincs = JSON.parse(p.cursos_vinculados || '[]'); } catch (e) { vincs = []; }
        const kPrincipal = `${p.curso}___${normalizar(p.asignatura)}`;
        planMap[kPrincipal] = { ...p, es_vinculado: false, curso_principal: p.curso };

        vincs.forEach(cVin => {
            const kVinc = `${cVin}___${normalizar(p.asignatura)}`;
            planMap[kVinc] = { ...p, es_vinculado: true, curso_principal: p.curso };
        });
    });

    const resultados = [];
    let totalConPlan = 0;
    let totalVisadas = 0;
    let sumaPctCobertura = 0;

    for (const item of pares) {
        const k = `${item.curso}___${normalizar(item.asignatura)}`;
        const p = planMap[k] || null;

        let cob = {
            cobertura_oas_pct: 0,
            cobertura_basales_pct: 0,
            oas_cubiertos: 0,
            oas_totales_programa: 0,
            evaluaciones_calendarizadas: 0,
            semaforo: 'Rojo'
        };

        if (p) {
            totalConPlan++;
            if (p.estado === 'Visada') totalVisadas++;
            try {
                cob = await calcularCoberturaCurricular({
                    anio: anioNum,
                    curso: item.curso,
                    asignatura: item.asignatura,
                    planId: p.id
                });
                sumaPctCobertura += cob.cobertura_oas_pct;
            } catch (e) { }
        }

        resultados.push({
            curso: item.curso,
            asignatura: item.asignatura,
            nivel: inferirNivelDesdeCurso(item.curso),
            planificacion_id: p ? p.id : null,
            docente_responsable: p ? p.docente_responsable : 'Sin asignar',
            estado: p ? p.estado : 'Sin planificación',
            es_vinculado: p ? !!p.es_vinculado : false,
            curso_principal: p ? p.curso_principal : null,
            visado_por: p ? p.visado_por : null,
            visado_fecha: p ? p.visado_fecha : null,
            cobertura_oas_pct: cob.cobertura_oas_pct,
            cobertura_basales_pct: cob.cobertura_basales_pct,
            oas_cubiertos: cob.oas_cubiertos,
            oas_totales_programa: cob.oas_totales_programa,
            evaluaciones_calendarizadas: cob.evaluaciones_calendarizadas,
            semaforo: cob.semaforo
        });
    }

    const totalCursosAsignaturas = pares.length;
    const promedioCobertura = totalConPlan > 0 ? Math.round(sumaPctCobertura / totalConPlan) : 0;

    return {
        anio: anioNum,
        kpis: {
            total_cursos_asignaturas: totalCursosAsignaturas,
            con_planificacion: totalConPlan,
            visadas: totalVisadas,
            pendientes_visado: totalConPlan - totalVisadas,
            promedio_cobertura_oas: promedioCobertura,
            en_alerta_roja: resultados.filter(r => r.semaforo === 'Rojo').length
        },
        filas: resultados
    };
}

module.exports = {
    obtenerCursosDocente,
    listarPlanificaciones,
    obtenerPlanificacionDetalle,
    crearPlanificacion,
    guardarPlanificacion,
    clonarPlanificacion,
    vincularCurso,
    desvincularCurso,
    crearCheckpointVersion,
    restaurarVersion,
    cambiarEstadoVisado,
    agregarObservacion,
    calcularCoberturaCurricular,
    obtenerDashboardCoberturaColegio,
    inferirNivelDesdeCurso,
    normalizar
};
