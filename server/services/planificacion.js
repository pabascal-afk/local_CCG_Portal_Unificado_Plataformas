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
        dbInstance.serialize(() => {
            dbInstance.run("ALTER TABLE planificaciones ADD COLUMN solicitud_eliminacion INTEGER DEFAULT 0", () => {});
            dbInstance.run("ALTER TABLE planificaciones ADD COLUMN solicitud_eliminacion_motivo TEXT", () => {});
            dbInstance.run("ALTER TABLE planificaciones ADD COLUMN solicitud_eliminacion_por TEXT", () => {});
            dbInstance.run("ALTER TABLE planificaciones ADD COLUMN solicitud_eliminacion_fecha DATETIME", () => {});
            dbInstance.run("ALTER TABLE planificaciones ADD COLUMN hitos_completados TEXT DEFAULT '[]'", () => {});
            dbInstance.run(`CREATE TABLE IF NOT EXISTS planificaciones_hitos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                anio INTEGER NOT NULL DEFAULT 2026,
                titulo TEXT NOT NULL,
                tipo TEXT NOT NULL DEFAULT 'Hito Pedagógico',
                icono TEXT DEFAULT '🎭',
                color TEXT DEFAULT '#2563eb',
                fecha_inicio TEXT NOT NULL,
                fecha_fin TEXT NOT NULL,
                todas_asignaturas INTEGER DEFAULT 0,
                asignaturas TEXT DEFAULT '[]',
                todos_cursos INTEGER DEFAULT 0,
                cursos TEXT DEFAULT '[]',
                cursos_excluidos TEXT DEFAULT '[]',
                lineamientos TEXT,
                oas_sugeridos TEXT DEFAULT '[]',
                metodologias_sugeridas TEXT DEFAULT '[]',
                recursos_enlaces TEXT DEFAULT '[]',
                bloquear_edicion INTEGER DEFAULT 0,
                activo INTEGER DEFAULT 1,
                creado_por TEXT,
                creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
                actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);
            dbInstance.run("CREATE INDEX IF NOT EXISTS idx_hitos_anio ON planificaciones_hitos(anio, fecha_inicio, fecha_fin)");
        });
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

function normalizarClave(txt) {
    if (!txt) return '';
    return txt.toString().trim().toUpperCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[°º]/g, "")
        .replace(/\s+/g, ' ');
}

/**
 * Mapea el nombre del curso a un nivel educativo estándar MINEDUC
 * Ej: "3° BASICO A" -> "3° Básico", "4to A" -> "4° Básico", "II° MEDIO B" -> "II° Medio"
 */
function inferirNivelDesdeCurso(curso) {
    if (!curso) return '';
    const c = curso.toString().toUpperCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, ' ').trim();

    // 1. Detección de Educación Media
    if (c.includes('IV MEDIO') || c.includes('CUARTO MEDIO') || /4(°|º|TO|RO)?\s*(MEDIO|MED)\b/.test(c)) return 'IV° Medio';
    if (c.includes('III MEDIO') || c.includes('TERCERO MEDIO') || /3(°|º|RO|ERO)?\s*(MEDIO|MED)\b/.test(c)) return 'III° Medio';
    if (c.includes('II MEDIO') || c.includes('SEGUNDO MEDIO') || /2(°|º|DO|NDO)?\s*(MEDIO|MED)\b/.test(c)) return 'II° Medio';
    if (c.includes('I MEDIO') || c.includes('PRIMERO MEDIO') || /1(°|º|RO|ERO)?\s*(MEDIO|MED)\b/.test(c)) return 'I° Medio';

    // 2. Detección de Educación Parvularia
    if (c.includes('PRE-KINDER') || c.includes('PREKINDER') || c.includes('PK')) return 'Pre-Kinder';
    if (c.includes('KINDER') || c.includes('KND')) return 'Kinder';

    // 3. Detección de Educación Básica (1° a 8°)
    if (c.includes('OCTAVO') || /8(°|º|VO|BA)?\s*(BASICO|BAS\b|[A-F]\b)/.test(c) || /^8[A-F]?$/.test(c)) return '8° Básico';
    if (c.includes('SEPTIMO') || /7(°|º|MO|MA)?\s*(BASICO|BAS\b|[A-F]\b)/.test(c) || /^7[A-F]?$/.test(c)) return '7° Básico';
    if (c.includes('SEXTO') || /6(°|º|TO|TA)?\s*(BASICO|BAS\b|[A-F]\b)/.test(c) || /^6[A-F]?$/.test(c)) return '6° Básico';
    if (c.includes('QUINTO') || /5(°|º|TO|TA)?\s*(BASICO|BAS\b|[A-F]\b)/.test(c) || /^5[A-F]?$/.test(c)) return '5° Básico';
    if (c.includes('CUARTO') || /4(°|º|TO|TA)?\s*(BASICO|BAS\b|[A-F]\b)/.test(c) || /^4[A-F]?$/.test(c)) return '4° Básico';
    if (c.includes('TERCERO') || /3(°|º|RO|RA|ERO)?\s*(BASICO|BAS\b|[A-F]\b)/.test(c) || /^3[A-F]?$/.test(c)) return '3° Básico';
    if (c.includes('SEGUNDO') || /2(°|º|DO|DA|NDO)?\s*(BASICO|BAS\b|[A-F]\b)/.test(c) || /^2[A-F]?$/.test(c)) return '2° Básico';
    if (c.includes('PRIMERO') || /1(°|º|RO|RA|ERO)?\s*(BASICO|BAS\b|[A-F]\b)/.test(c) || /^1[A-F]?$/.test(c)) return '1° Básico';

    // Fallback general para números 1 a 8 seguidos o precedidos de marcas básicas
    for (let i = 1; i <= 8; i++) {
        if (c.includes(`${i}`) && (c.includes('BAS') || c.includes('°') || c.includes('º') || c.includes('TO') || c.includes('RO') || c.includes('DO') || c.includes('VO') || c.includes('MO'))) {
            return `${i}° Básico`;
        }
    }

    return curso;
}

/**
 * Normaliza nombres de asignaturas según taxonomía y nivel MINEDUC
 */
function normalizarAsignaturaMineduc(asig, nivel = '') {
    if (!asig) return '';
    const clean = normalizar(asig);
    if (clean === 'LENGUAJE' || clean === 'LENGUAJE Y COMUNICACION') {
        if (nivel.includes('Medio') || nivel.includes('7°') || nivel.includes('8°') || nivel.includes('7') || nivel.includes('8')) {
            return 'LENGUA Y LITERATURA';
        }
        return 'LENGUAJE Y COMUNICACION';
    }
    if (clean === 'LENGUA Y LITERATURA') return 'LENGUA Y LITERATURA';
    if (clean === 'MATEMATICAS' || clean === 'MATEMATICA') return 'MATEMATICA';
    if (clean === 'HISTORIA Y GEOGRAFIA' || clean === 'HISTORIA' || clean === 'HISTORIA, GEOGRAFIA Y CIENCIAS SOCIALES') {
        if (nivel.includes('III') || nivel.includes('IV')) {
            return 'EDUCACION CIUDADANA';
        }
        return 'HISTORIA, GEOGRAFIA Y CIENCIAS SOCIALES';
    }
    if (clean === 'EDUCACION FISICA' || clean === 'EDUCACION FISICA Y SALUD') return 'EDUCACION FISICA Y SALUD';
    if (clean === 'CIENCIAS' || clean === 'CIENCIAS NATURALES') return 'CIENCIAS NATURALES';
    return clean;
}

/**
 * Compara dos cadenas de nivel curricular con tolerancia a formatos (tildes, °/º, números romanos/arábigos)
 */
function matchNivelCurricular(nivelPlan, nivelBuscado) {
    if (!nivelPlan || !nivelBuscado) return false;
    const nP = normalizarClave(nivelPlan);
    const nB = normalizarClave(nivelBuscado);
    if (nP === nB) return true;
    if (nP === 'TODOS LOS NIVELES' || nB === 'TODOS LOS NIVELES') return true;
    if (nP.includes(nB) || nB.includes(nP)) return true;

    const extraerNum = (str) => {
        const m = str.match(/(\d+)/);
        if (m) return parseInt(m[1], 10);
        if (str.includes('PRIMERO') || str.includes('I MEDIO') || str.includes('1 MEDIO')) return 1;
        if (str.includes('SEGUNDO') || str.includes('II MEDIO') || str.includes('2 MEDIO')) return 2;
        if (str.includes('TERCERO') || str.includes('III MEDIO') || str.includes('3 MEDIO')) return 3;
        if (str.includes('CUARTO') || str.includes('IV MEDIO') || str.includes('4 MEDIO')) return 4;
        if (str.includes('QUINTO')) return 5;
        if (str.includes('SEXTO')) return 6;
        if (str.includes('SEPTIMO')) return 7;
        if (str.includes('OCTAVO')) return 8;
        return null;
    };
    const esMediaP = nP.includes('MEDIO') || nP.includes('MEDIA');
    const esMediaB = nB.includes('MEDIO') || nB.includes('MEDIA');
    if (esMediaP !== esMediaB) return false;
    const numP = extraerNum(nP);
    const numB = extraerNum(nB);
    return numP !== null && numB !== null && numP === numB;
}

/**
 * Compara dos cadenas de asignaturas con equivalencias oficiales MINEDUC
 */
function matchAsignaturaCurricular(asigPlan, asigBuscada, nivel = '') {
    if (!asigPlan || !asigBuscada) return false;
    const aP = normalizarClave(asigPlan);
    const aB = normalizarClave(asigBuscada);
    if (aP === aB) return true;

    const equivalencias = [
        ['LENGUAJE', 'LENGUAJE Y COMUNICACION', 'LENGUA Y LITERATURA'],
        ['MATEMATICA', 'MATEMATICAS'],
        ['HISTORIA', 'HISTORIA Y GEOGRAFIA', 'HISTORIA, GEOGRAFIA Y CIENCIAS SOCIALES', 'EDUCACION CIUDADANA'],
        ['CIENCIAS', 'CIENCIAS NATURALES', 'CIENCIAS PARA LA CIUDADANIA', 'BIOLOGIA', 'FISICA', 'QUIMICA'],
        ['INGLES', 'IDIOMA EXTRANJERO: INGLES', 'IDIOMA EXTRANJERO INGLES'],
        ['EDUCACION FISICA', 'EDUCACION FISICA Y SALUD'],
        ['ARTES', 'ARTES VISUALES', 'ARTES PLASTICAS'],
        ['TECNOLOGIA', 'EDUCACION TECNOLOGICA']
    ];

    for (const eq of equivalencias) {
        const pEnEq = eq.some(e => aP === e || aP.includes(e));
        const bEnEq = eq.some(e => aB === e || aB.includes(e));
        if (pEnEq && bEnEq) return true;
    }

    if (aP.includes(aB) || aB.includes(aP)) return true;
    return false;
}

/**
 * Busca de forma flexible y tolerante a tildes/formatos un plan curricular coincidente en la base de datos
 */
async function buscarPlanCurricularCoincidente(curso, asignatura, anio = 2026) {
    const anioNum = parseInt(anio, 10) || 2026;
    const todosPlanes = await queryAll(`
        SELECT * FROM curriculo_planes 
        WHERE (anio = ? OR anio = 2026) AND activo = 1
        ORDER BY 
          (CASE WHEN anio = ? THEN 0 ELSE 1 END) ASC, 
          (CASE WHEN tipo = 'PROPIO' AND excluir_oas_mineduc = 1 THEN 0 WHEN tipo = 'PROPIO' THEN 1 ELSE 2 END) ASC, 
          id ASC
    `, [anioNum, anioNum]);

    if (!todosPlanes || todosPlanes.length === 0) return null;

    const nivelInferido = inferirNivelDesdeCurso(curso);
    const asigEstandar = normalizarAsignaturaMineduc(asignatura, nivelInferido);

    // 1. Prioridad: Planes Propios institucionales que suplantan MINEDUC
    const propioSuplantador = todosPlanes.find(p => 
        p.tipo === 'PROPIO' && p.excluir_oas_mineduc === 1 &&
        matchNivelCurricular(p.nivel, nivelInferido) &&
        (normalizarClave(p.asignatura) === normalizarClave(asigEstandar) || matchAsignaturaCurricular(p.asignatura, asignatura, nivelInferido))
    );
    if (propioSuplantador) return propioSuplantador;

    // 2. Coincidencia exacta de nivel y asignatura estándar
    for (const p of todosPlanes) {
        if (matchNivelCurricular(p.nivel, nivelInferido) && normalizarClave(p.asignatura) === normalizarClave(asigEstandar)) {
            return p;
        }
    }

    // 3. Coincidencia directa de nivel y asignatura original
    for (const p of todosPlanes) {
        if (matchNivelCurricular(p.nivel, nivelInferido) && normalizarClave(p.asignatura) === normalizarClave(asignatura)) {
            return p;
        }
    }

    // 4. Coincidencia flexible de nivel y asignatura
    for (const p of todosPlanes) {
        if (matchNivelCurricular(p.nivel, nivelInferido) && matchAsignaturaCurricular(p.asignatura, asignatura, nivelInferido)) {
            return p;
        }
    }

    // 5. Coincidencia si el plan abarca "Todos los niveles"
    for (const p of todosPlanes) {
        if (normalizarClave(p.nivel) === 'TODOS LOS NIVELES' && matchAsignaturaCurricular(p.asignatura, asignatura, nivelInferido)) {
            return p;
        }
    }

    return null;
}

// -------------------------------------------------------------
// 1. Obtener Cursos y Carga Horaria del Docente
// -------------------------------------------------------------
async function obtenerCursosDocente(usuarioEmail, usuarioNombre, anio = 2026) {
    if (typeof usuarioNombre === 'number' || (typeof usuarioNombre === 'string' && !isNaN(parseInt(usuarioNombre)) && arguments.length === 2)) {
        anio = usuarioNombre;
        usuarioNombre = usuarioEmail;
    }
    const anioNum = parseInt(anio) || 2026;
    
    // 1. Cursos donde el profesor figura en la malla de horarios del año consultado
    const qDocente = `
        SELECT DISTINCT curso, asignatura, profesor 
        FROM horarios 
        WHERE (anno = ? OR (anno IS NULL AND ? = 2026))
          AND (
            LOWER(profesor) LIKE '%' || LOWER(?) || '%' 
            OR LOWER(?) LIKE '%' || LOWER(profesor) || '%'
          ) AND curso IS NOT NULL AND TRIM(curso) != ''
        ORDER BY curso ASC, asignatura ASC
    `;
    const misCursosHorario = await queryAll(qDocente, [anioNum, anioNum, usuarioNombre || usuarioEmail, usuarioNombre || usuarioEmail]);

    // 2. Todos los cursos y asignaturas disponibles en el colegio para el año
    const todosCursosRows = await queryAll(`
        SELECT DISTINCT curso FROM (
            SELECT curso FROM horarios WHERE (anno = ? OR (anno IS NULL AND ? = 2026)) AND curso IS NOT NULL AND TRIM(curso) != ''
            UNION
            SELECT curso FROM evaluaciones WHERE curso IS NOT NULL AND TRIM(curso) != '' AND (strftime('%Y', fecha) = ? OR strftime('%Y', fecha) IS NULL)
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
    `, [anioNum, anioNum, String(anioNum)]);
    const todosLosCursos = todosCursosRows.map(r => r.curso);

    const todasAsignaturasRows = await queryAll(`
        SELECT DISTINCT asignatura FROM horarios 
        WHERE (anno = ? OR (anno IS NULL AND ? = 2026)) AND asignatura IS NOT NULL AND TRIM(asignatura) != ''
        ORDER BY asignatura ASC
    `, [anioNum, anioNum]);
    const todasLasAsignaturas = todasAsignaturasRows.map(r => r.asignatura);

    // 3. Planificaciones existentes para el año activo
    const planificacionesExistentes = await queryAll(`
        SELECT p.id, p.anio, p.curso, p.asignatura, p.titulo, p.docente_responsable, 
               p.docentes_colaboradores, p.creado_por, p.cursos_vinculados, p.estado, p.visado_por, p.visado_fecha, p.actualizado_en,
               p.solicitud_eliminacion, p.solicitud_eliminacion_motivo, p.solicitud_eliminacion_por, p.solicitud_eliminacion_fecha,
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

    // 4. Planificaciones del año anterior (para sugerir promoción/importación con 1 clic)
    const annoAnterior = anioNum - 1;
    const planesPrevios = await queryAll(`
        SELECT p.id, p.anio, p.curso, p.asignatura, p.titulo, p.estado,
               (SELECT COUNT(*) FROM planificaciones_unidades u WHERE u.planificacion_id = p.id) as total_unidades
        FROM planificaciones p
        WHERE p.anio = ?
    `, [annoAnterior]);
    const prevMap = {};
    planesPrevios.forEach(p => {
        prevMap[`${p.curso}___${normalizar(p.asignatura)}`] = p;
    });

    const uEmailNorm = (usuarioEmail || '').trim().toLowerCase();
    const uNombreNorm = (usuarioNombre || '').trim().toLowerCase();

    function coincideUsuario(texto) {
        if (!texto) return false;
        const t = String(texto).trim().toLowerCase();
        return (uEmailNorm && (t === uEmailNorm || t.includes(uEmailNorm) || uEmailNorm.includes(t))) ||
               (uNombreNorm && (t === uNombreNorm || t.includes(uNombreNorm) || uNombreNorm.includes(t)));
    }

    function esColaborador(colabsArr) {
        if (!Array.isArray(colabsArr) || colabsArr.length === 0) return false;
        return colabsArr.some(c => {
            if (!c) return false;
            if (typeof c === 'string') return coincideUsuario(c);
            if (typeof c === 'object') return coincideUsuario(c.nombre) || coincideUsuario(c.email);
            return false;
        });
    }

    const keysEnAsignaciones = new Set();

    // Enriquecer la carga horaria del docente con el estado de su planificación
    const misAsignaciones = misCursosHorario.map(c => {
        const k = `${c.curso}___${normalizar(c.asignatura)}`;
        keysEnAsignaciones.add(k);
        const plan = planMap[k] || null;
        const prevPlan = prevMap[k] || null;

        let colabs = [];
        if (plan && plan.docentes_colaboradores) {
            try { 
                colabs = typeof plan.docentes_colaboradores === 'string' ? JSON.parse(plan.docentes_colaboradores) : plan.docentes_colaboradores; 
            } catch(e) { colabs = []; }
        }

        const userEsCodoc = plan ? esColaborador(colabs) : false;
        const userEsCreador = plan ? (coincideUsuario(plan.creado_por) || coincideUsuario(plan.docente_responsable)) : false;

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
            cursos_vinculados: plan ? plan.cursos_vinculados_arr : [],
            es_codocente: userEsCodoc,
            es_creador: userEsCreador,
            docente_responsable: plan ? plan.docente_responsable : null,
            docentes_colaboradores: colabs,
            // Datos del año anterior para botón de importación
            tiene_plan_anterior: !plan && !!prevPlan,
            plan_anterior_id: prevPlan ? prevPlan.id : null,
            plan_anterior_anno: prevPlan ? prevPlan.anio : null,
            plan_anterior_titulo: prevPlan ? prevPlan.titulo : null,
            plan_anterior_unidades: prevPlan ? prevPlan.total_unidades : 0
        };
    });

    // Agregar planificaciones donde el profesor es Co-Docente, Creador o Responsable aunque no tenga el curso en su horario
    planificacionesExistentes.forEach(p => {
        const k = `${p.curso}___${normalizar(p.asignatura)}`;
        let colabs = [];
        try { 
            colabs = typeof p.docentes_colaboradores === 'string' ? JSON.parse(p.docentes_colaboradores || '[]') : p.docentes_colaboradores; 
        } catch(e) { colabs = []; }

        const userEsCodoc = esColaborador(colabs);
        const userEsCreador = coincideUsuario(p.creado_por);
        const userEsResp = coincideUsuario(p.docente_responsable);

        if ((userEsCodoc || userEsCreador || userEsResp) && !keysEnAsignaciones.has(k)) {
            keysEnAsignaciones.add(k);
            misAsignaciones.push({
                curso: p.curso,
                asignatura: p.asignatura,
                nivel: inferirNivelDesdeCurso(p.curso),
                planificacion_id: p.id,
                titulo: p.titulo,
                estado: p.estado,
                total_unidades: p.total_unidades,
                actualizado_en: p.actualizado_en,
                es_vinculado: false,
                curso_principal: p.curso,
                cursos_vinculados: p.cursos_vinculados_arr || [],
                es_codocente: userEsCodoc,
                es_creador: userEsCreador || userEsResp,
                docente_responsable: p.docente_responsable,
                docentes_colaboradores: colabs,
                tiene_plan_anterior: false,
                plan_anterior_id: null,
                plan_anterior_anno: null,
                plan_anterior_titulo: null,
                plan_anterior_unidades: 0
            });
        }
    });

    return {
        anio: anioNum,
        anno: anioNum,
        misAsignaciones,
        todosLosCursos,
        todasLasAsignaturas
    };
}

// -------------------------------------------------------------
// 1b. Obtener Pool de Docentes del Colegio (Para Co-Docencia / Equipo)
// -------------------------------------------------------------
async function obtenerPoolDocentes() {
    const usuarios = await queryAll(`
        SELECT id, nombre, email, rol 
        FROM usuarios 
        WHERE (activo = 1 OR activo IS NULL)
          AND (
            LOWER(rol) LIKE '%profesor%' OR 
            LOWER(rol) LIKE '%docente%' OR 
            LOWER(rol) LIKE '%coordinac%' OR 
            LOWER(rol) LIKE '%utp%' OR 
            LOWER(rol) LIKE '%admin%' OR 
            LOWER(rol) LIKE '%pie%' OR
            rol IS NULL
          )
        ORDER BY nombre ASC
    `);

    const profesoresHorario = await queryAll(`
        SELECT DISTINCT TRIM(profesor) as nombre 
        FROM horarios 
        WHERE profesor IS NOT NULL AND TRIM(profesor) != ''
        ORDER BY nombre ASC
    `);

    const map = new Map();
    usuarios.forEach(u => {
        if (u.nombre && u.nombre.trim()) {
            map.set(u.nombre.trim().toUpperCase(), {
                id: u.id,
                nombre: u.nombre.trim(),
                email: u.email ? u.email.trim() : '',
                rol: u.rol || 'PROFESOR'
            });
        }
    });

    profesoresHorario.forEach(p => {
        const nom = p.nombre.trim();
        const nomUpper = nom.toUpperCase();
        if (!map.has(nomUpper)) {
            map.set(nomUpper, {
                id: null,
                nombre: nom,
                email: '',
                rol: 'PROFESOR'
            });
        }
    });

    return Array.from(map.values()).sort((a, b) => a.nombre.localeCompare(b.nombre));
}

// -------------------------------------------------------------
// 1c. Obtener Horas Sugeridas y Sesiones de Clases Semanales desde Horarios
// -------------------------------------------------------------
async function obtenerSesionesClasesSemana(curso, asignatura, anio = 2026) {
    const anioNum = parseInt(anio) || 2026;
    if (!curso || !asignatura) {
        return {
            curso: curso || '',
            asignatura: asignatura || '',
            anno: anioNum,
            bloques_semanales: 0,
            horas_anuales_sugeridas: 0,
            sesiones: []
        };
    }

    // Buscar bloques en horarios para el curso y asignatura
    const rows = await queryAll(`
        SELECT dia, bloque, profesor
        FROM horarios
        WHERE (anno = ? OR (anno IS NULL AND ? = 2026))
          AND LOWER(TRIM(curso)) = LOWER(TRIM(?))
          AND (
            LOWER(TRIM(asignatura)) = LOWER(TRIM(?))
            OR LOWER(asignatura) LIKE '%' || LOWER(?) || '%'
            OR LOWER(?) LIKE '%' || LOWER(asignatura) || '%'
          )
        ORDER BY 
          CASE UPPER(dia)
            WHEN 'LUNES' THEN 1
            WHEN 'MARTES' THEN 2
            WHEN 'MIERCOLES' THEN 3
            WHEN 'MIÉRCOLES' THEN 3
            WHEN 'JUEVES' THEN 4
            WHEN 'VIERNES' THEN 5
            WHEN 'SABADO' THEN 6
            WHEN 'SÁBADO' THEN 6
            ELSE 7
          END, bloque ASC
    `, [anioNum, anioNum, curso, asignatura, asignatura, asignatura]);

    // Agrupar bloques por día para detectar clases de 90 min (2 bloques contiguos) o 45 min (1 bloque)
    const porDia = {};
    rows.forEach(r => {
        const d = (r.dia || 'Lunes').trim();
        const diaCap = d.charAt(0).toUpperCase() + d.slice(1).toLowerCase();
        if (!porDia[diaCap]) porDia[diaCap] = [];
        porDia[diaCap].push({ bloque: parseInt(r.bloque), profesor: r.profesor });
    });

    const sesiones = [];
    let sesionNum = 1;

    Object.keys(porDia).forEach(dia => {
        const items = porDia[dia].sort((a, b) => a.bloque - b.bloque);
        let i = 0;
        while (i < items.length) {
            // Verificar si el siguiente bloque es contiguo (ej: bloque 1 y 2 -> 90 min)
            if (i + 1 < items.length && items[i + 1].bloque === items[i].bloque + 1) {
                const b1 = items[i].bloque;
                const b2 = items[i + 1].bloque;
                sesiones.push({
                    numero: sesionNum++,
                    dia: dia,
                    bloques: [b1, b2],
                    duracion_minutos: 90,
                    label: `Clase ${sesionNum - 1} (${dia} - 90 min)`
                });
                i += 2;
            } else {
                const b = items[i].bloque;
                sesiones.push({
                    numero: sesionNum++,
                    dia: dia,
                    bloques: [b],
                    duracion_minutos: 45,
                    label: `Clase ${sesionNum - 1} (${dia} - 45 min)`
                });
                i += 1;
            }
        }
    });

    const totalBloques = rows.length;
    // 38 semanas lectivas oficiales MINEDUC
    const horasAnualesSugeridas = totalBloques > 0 ? (totalBloques * 38) : 0;

    // Si no hay horario cargado, entregar una estructura por defecto basada en la asignatura
    if (sesiones.length === 0) {
        sesiones.push(
            { numero: 1, dia: 'Lunes', bloques: [1, 2], duracion_minutos: 90, label: 'Clase 1 (90 min)' },
            { numero: 2, dia: 'Miércoles', bloques: [1, 2], duracion_minutos: 90, label: 'Clase 2 (90 min)' }
        );
    }

    return {
        curso,
        asignatura,
        anno: anioNum,
        bloques_semanales: totalBloques,
        horas_anuales_sugeridas: horasAnualesSugeridas || (sesiones.reduce((acc, s) => acc + (s.duracion_minutos / 45), 0) * 38),
        sesiones
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
               p.horas_anuales, p.actualizado_en, p.creado_en, p.creado_por,
               p.solicitud_eliminacion, p.solicitud_eliminacion_motivo, p.solicitud_eliminacion_por, p.solicitud_eliminacion_fecha,
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
    try {
        plan.hitos_completados = JSON.parse(plan.hitos_completados || '[]');
    } catch (e) {
        plan.hitos_completados = [];
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
        try { u.hitos_asociados = JSON.parse(u.hitos_asociados || '[]'); } catch (e) { u.hitos_asociados = []; }
        try { u.desglose_semanal = JSON.parse(u.desglose_semanal || '[]'); } catch (e) { u.desglose_semanal = []; }
    });
    plan.unidades = unidades;

    // Catálogo de OAs disponibles para este curso y asignatura
    const nivel = inferirNivelDesdeCurso(plan.curso);
    const asigEstandar = normalizarAsignaturaMineduc(plan.asignatura, nivel);

    let planCurr = null;
    if (plan.plan_curricular_id) {
        planCurr = await queryGet(`SELECT * FROM curriculo_planes WHERE id = ? AND activo = 1`, [plan.plan_curricular_id]);
    }

    if (!planCurr) {
        planCurr = await buscarPlanCurricularCoincidente(plan.curso, plan.asignatura, plan.anio);
        if (planCurr && !plan.plan_curricular_id) {
            await queryRun(`UPDATE planificaciones SET plan_curricular_id = ? WHERE id = ?`, [planCurr.id, plan.id]);
            plan.plan_curricular_id = planCurr.id;
        }
    }

    let oasDisponibles = [];
    if (planCurr) {
        try {
            planCurr.habilidades_sugeridas = JSON.parse(planCurr.habilidades_sugeridas || '[]');
        } catch (e) {
            planCurr.habilidades_sugeridas = [];
        }
        try {
            planCurr.unidades_oficiales = JSON.parse(planCurr.unidades_oficiales || '[]');
        } catch (e) {
            planCurr.unidades_oficiales = [];
        }
        if (planCurr.habilidades_sugeridas.length === 0) {
            planCurr.habilidades_sugeridas = curriculoSeed.HABILIDADES_POR_ASIGNATURA[planCurr.asignatura] || [];
        }
        plan.plan_curricular = planCurr;

        oasDisponibles = await queryAll(`
            SELECT id, plan_id, tipo_objetivo, eje_unidad, unidad_sugerida, nombre_unidad_oficial, codigo, descripcion, categoria, indicadores_sugeridos, orden, editado_manual
            FROM curriculo_objetivos 
            WHERE plan_id = ? AND activo = 1
            ORDER BY orden ASC, codigo ASC
        `, [planCurr.id]);

        // Si es un Plan Propio pero NO excluye al MINEDUC, se añaden también los OAs de MINEDUC para complementariedad
        if (planCurr.tipo === 'PROPIO' && !planCurr.excluir_oas_mineduc) {
            const todosPlanesM = await queryAll(`SELECT * FROM curriculo_planes WHERE (anio = ? OR anio = 2026) AND tipo = 'MINEDUC' AND activo = 1`, [plan.anio]);
            const pm = todosPlanesM.find(p => matchNivelCurricular(p.nivel, nivel) && matchAsignaturaCurricular(p.asignatura, plan.asignatura, nivel));
            if (pm) {
                const oasMineduc = await queryAll(`
                    SELECT id, plan_id, tipo_objetivo, eje_unidad, unidad_sugerida, nombre_unidad_oficial, codigo, descripcion, categoria, indicadores_sugeridos, orden, editado_manual
                    FROM curriculo_objetivos 
                    WHERE plan_id = ? AND activo = 1
                    ORDER BY orden ASC, codigo ASC
                `, [pm.id]);
                oasDisponibles = [...oasDisponibles, ...oasMineduc];
            }
        }
    }

    // Si aún no hay OAs por coincidencia directa de ID, búsqueda tolerante en memoria
    if (oasDisponibles.length === 0) {
        const todosObjetivos = await queryAll(`
            SELECT o.id, o.plan_id, o.tipo_objetivo, o.eje_unidad, o.unidad_sugerida, o.nombre_unidad_oficial, o.codigo, o.descripcion, o.categoria, o.indicadores_sugeridos, o.orden, o.editado_manual, cp.asignatura as asignatura_programa, cp.nivel as nivel_programa
            FROM curriculo_objetivos o
            JOIN curriculo_planes cp ON cp.id = o.plan_id
            WHERE (cp.anio = ? OR cp.anio = 2026) AND cp.activo = 1 AND o.activo = 1
            ORDER BY o.orden ASC, o.codigo ASC
        `, [plan.anio]);
        oasDisponibles = todosObjetivos.filter(o => 
            matchNivelCurricular(o.nivel_programa, nivel) && 
            matchAsignaturaCurricular(o.asignatura_programa, plan.asignatura, nivel)
        );
    }

    // Parsear indicadores_sugeridos para cada OA y armar catálogo de unidades oficiales
    const mapaUnidadesOficiales = new Map();
    if (planCurr && Array.isArray(planCurr.unidades_oficiales)) {
        planCurr.unidades_oficiales.forEach(u => {
            if (u && u.numero) mapaUnidadesOficiales.set(Number(u.numero), u.nombre || `Unidad ${u.numero}`);
        });
    }
    oasDisponibles.forEach(o => {
        try {
            o.indicadores_sugeridos = JSON.parse(o.indicadores_sugeridos || '[]');
        } catch (e) {
            o.indicadores_sugeridos = [];
        }
        const mNum = String(o.unidad_sugerida || '').match(/(\d+)/);
        if (mNum) {
            const num = parseInt(mNum[1], 10);
            if (o.nombre_unidad_oficial && !mapaUnidadesOficiales.has(num)) {
                mapaUnidadesOficiales.set(num, o.nombre_unidad_oficial);
            } else if (!o.nombre_unidad_oficial && mapaUnidadesOficiales.has(num)) {
                o.nombre_unidad_oficial = mapaUnidadesOficiales.get(num);
            }
        }
    });

    plan.unidades_oficiales = Array.from(mapaUnidadesOficiales.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([numero, nombre]) => ({ numero, nombre }));
    plan.oas_disponibles = oasDisponibles;
    plan.actitudes_sugeridas = curriculoSeed.ACTITUDES_GENERALES_MINEDUC;

    // Enriquecer oas_seleccionados en cada unidad con su descripción para tooltips y precisión
    unidades.forEach(u => {
        u.oas_seleccionados = (u.oas_seleccionados || []).map(o => {
            if (typeof o === 'string') {
                const match = oasDisponibles.find(x => x.codigo === o && (x.unidad_sugerida && x.unidad_sugerida.includes(`Unidad ${u.numero_unidad}`)));
                const fallbackMatch = match || oasDisponibles.find(x => x.codigo === o);
                return {
                    id: fallbackMatch ? fallbackMatch.id : null,
                    codigo: o,
                    descripcion: fallbackMatch ? fallbackMatch.descripcion : '',
                    categoria: fallbackMatch ? fallbackMatch.categoria : 'Basal',
                    unidad_sugerida: fallbackMatch ? fallbackMatch.unidad_sugerida : `Unidad ${u.numero_unidad || 1}`
                };
            } else if (typeof o === 'object') {
                if (!o.descripcion || !o.id) {
                    const match = oasDisponibles.find(x => (o.id && x.id === o.id) || (x.codigo === o.codigo && (!o.unidad_sugerida || x.unidad_sugerida === o.unidad_sugerida)));
                    const fallbackMatch = match || oasDisponibles.find(x => x.codigo === o.codigo);
                    if (fallbackMatch) {
                        o.id = o.id || fallbackMatch.id;
                        o.descripcion = o.descripcion || fallbackMatch.descripcion;
                        o.categoria = o.categoria || fallbackMatch.categoria;
                        o.unidad_sugerida = o.unidad_sugerida || fallbackMatch.unidad_sugerida;
                    }
                }
                return o;
            }
            return o;
        });
    });

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

    // Vincular automáticamente con el plan curricular (priorizando Plan Propio institucional si existe)
    let planCurricularId = payload.plan_curricular_id || null;
    if (!planCurricularId) {
        const pc = await buscarPlanCurricularCoincidente(curso, asignatura, anio);
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

    // Construir automáticamente las unidades oficiales y sus OAs asignados si existen en el programa curricular
    let unidadesIniciales = [];
    if (planCurricularId) {
        const planCurrRow = await queryGet(`SELECT * FROM curriculo_planes WHERE id = ?`, [planCurricularId]);
        const oasPlanCurr = await queryAll(`
            SELECT id, codigo, descripcion, categoria, unidad_sugerida, nombre_unidad_oficial, indicadores_sugeridos, orden
            FROM curriculo_objetivos
            WHERE plan_id = ? AND activo = 1
            ORDER BY orden ASC, codigo ASC
        `, [planCurricularId]);
        unidadesIniciales = construirUnidadesInicialesDesdeCurriculo(planCurrRow, oasPlanCurr, anio, horasAnuales);
    }

    if (unidadesIniciales.length > 0) {
        for (const u of unidadesIniciales) {
            await queryRun(`
                INSERT INTO planificaciones_unidades 
                (planificacion_id, numero_unidad, nombre_unidad, semestre, fecha_inicio, fecha_fin, horas_estimadas, oas_seleccionados, indicadores_evaluacion, orden)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                planId,
                u.numero_unidad,
                u.nombre_unidad,
                u.semestre,
                u.fecha_inicio,
                u.fecha_fin,
                u.horas_estimadas,
                JSON.stringify(u.oas_seleccionados || []),
                u.indicadores_evaluacion || '',
                u.orden
            ]);
        }
    } else {
        // Fallback: Crear Unidad 1 por defecto
        await queryRun(`
            INSERT INTO planificaciones_unidades 
            (planificacion_id, numero_unidad, nombre_unidad, semestre, fecha_inicio, fecha_fin, horas_estimadas, orden)
            VALUES (?, 1, 'Unidad 1: Introducción y Fundamentos', 1, '${anio}-03-02', '${anio}-04-30', 38, 1)
        `, [planId]);
    }

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

    return { id: planId, mensaje: "Planificación creada con éxito con sus unidades y OAs oficiales." };
}

function construirUnidadesInicialesDesdeCurriculo(planCurrRow, oasPlanCurr = [], anio = 2026, horasAnuales = 152) {
    let unidadesOficialesCat = [];
    if (planCurrRow && planCurrRow.unidades_oficiales) {
        try {
            unidadesOficialesCat = typeof planCurrRow.unidades_oficiales === 'string'
                ? JSON.parse(planCurrRow.unidades_oficiales || '[]')
                : (planCurrRow.unidades_oficiales || []);
        } catch (e) {
            unidadesOficialesCat = [];
        }
    }

    const mapaNombres = new Map();
    unidadesOficialesCat.forEach(u => {
        if (u && u.numero) mapaNombres.set(Number(u.numero), u.nombre);
    });

    const oas = Array.isArray(oasPlanCurr) ? oasPlanCurr : [];
    // Asegurar siempre las 4 unidades estándar del año escolar
    const gruposPorUnidad = new Map([[1, []], [2, []], [3, []], [4, []]]);

    // Si hay OAs disponibles, distribuirlos en sus unidades sugeridas o equitativamente
    if (oas.length > 0) {
        const oasSinUnidad = [];
        for (const oa of oas) {
            const m = String(oa.unidad_sugerida || '').match(/(\d+)/);
            if (m) {
                const num = parseInt(m[1], 10);
                if (!gruposPorUnidad.has(num)) gruposPorUnidad.set(num, []);
                gruposPorUnidad.get(num).push(oa);
                if (oa.nombre_unidad_oficial && !mapaNombres.has(num)) {
                    mapaNombres.set(num, oa.nombre_unidad_oficial);
                }
            } else {
                oasSinUnidad.push(oa);
            }
        }

        // Si hay OAs sin unidad explícita, distribuirlos entre las 4 unidades
        if (oasSinUnidad.length > 0) {
            oasSinUnidad.forEach((oa, idx) => {
                const targetUnidad = (idx % 4) + 1;
                gruposPorUnidad.get(targetUnidad).push(oa);
            });
        }
    }

    const numeros = Array.from(gruposPorUnidad.keys()).sort((a, b) => a - b);
    const rangosFechas = {
        1: { semestre: 1, inicio: `${anio}-03-02`, fin: `${anio}-05-08`, defNombre: 'Unidad 1: Nivelación y Fundamentos' },
        2: { semestre: 1, inicio: `${anio}-05-11`, fin: `${anio}-07-03`, defNombre: 'Unidad 2: Desarrollo Curricular Integrado' },
        3: { semestre: 2, inicio: `${anio}-07-20`, fin: `${anio}-09-25`, defNombre: 'Unidad 3: Profundización y Aplicación' },
        4: { semestre: 2, inicio: `${anio}-09-28`, fin: `${anio}-12-04`, defNombre: 'Unidad 4: Consolidación y Síntesis Final' }
    };

    const horasPorUnidad = Math.max(10, Math.round((parseInt(horasAnuales, 10) || 152) / Math.max(1, numeros.length)));

    return numeros.map((num, idx) => {
        const oasUnidad = gruposPorUnidad.get(num) || [];
        const rango = rangosFechas[num] || {
            semestre: num <= 2 ? 1 : 2,
            inicio: num <= 2 ? `${anio}-03-02` : `${anio}-07-20`,
            fin: num <= 2 ? `${anio}-07-03` : `${anio}-12-04`,
            defNombre: `Unidad ${num}`
        };
        const nombreOficial = mapaNombres.get(num) || rango.defNombre || `Unidad ${num}`;

        const oasSeleccionados = oasUnidad.map(o => ({
            id: o.id,
            codigo: o.codigo,
            descripcion: o.descripcion,
            categoria: o.categoria || 'Basal',
            unidad_sugerida: `Unidad ${num}`
        }));

        const indicadoresSet = new Set();
        oasUnidad.forEach(o => {
            try {
                const inds = typeof o.indicadores_sugeridos === 'string'
                    ? JSON.parse(o.indicadores_sugeridos || '[]')
                    : (o.indicadores_sugeridos || []);
                inds.forEach(i => { if (i) indicadoresSet.add(`• [${o.codigo}] ${i}`); });
            } catch (e) {}
        });

        return {
            numero_unidad: num,
            nombre_unidad: nombreOficial,
            semestre: rango.semestre,
            fecha_inicio: rango.inicio,
            fecha_fin: rango.fin,
            horas_estimadas: horasPorUnidad,
            oas_seleccionados: oasSeleccionados,
            indicadores_evaluacion: Array.from(indicadoresSet).join('\n'),
            orden: idx + 1
        };
    });
}

async function cargarUnidadesOficialesEnPlan(planId, opciones = {}, usuario) {
    const detalle = await obtenerPlanificacionDetalle(planId);
    if (!detalle) throw new Error("Planificación no encontrada.");

    // Si plan_curricular no está vinculado o no tiene OAs, intentar resolverlo dinámicamente con tolerancia de caracteres
    if (!detalle.plan_curricular || !detalle.oas_disponibles || detalle.oas_disponibles.length === 0) {
        const pc = await buscarPlanCurricularCoincidente(detalle.curso, detalle.asignatura, detalle.anio);
        if (pc) {
            detalle.plan_curricular = pc;
            detalle.oas_disponibles = await queryAll(`
                SELECT id, plan_id, tipo_objetivo, eje_unidad, unidad_sugerida, nombre_unidad_oficial, codigo, descripcion, categoria, indicadores_sugeridos, orden, editado_manual
                FROM curriculo_objetivos 
                WHERE plan_id = ? AND activo = 1
                ORDER BY orden ASC, codigo ASC
            `, [pc.id]);
            if (detalle.plan_curricular_id !== pc.id) {
                await queryRun(`UPDATE planificaciones SET plan_curricular_id = ? WHERE id = ?`, [pc.id, planId]);
            }
        }
    }

    const unidadesPropuestas = construirUnidadesInicialesDesdeCurriculo(
        detalle.plan_curricular,
        detalle.oas_disponibles,
        detalle.anio,
        detalle.horas_anuales
    );

    const numUnidadFiltro = opciones.numero_unidad ? parseInt(opciones.numero_unidad, 10) : null;

    if (numUnidadFiltro) {
        let uOficial = unidadesPropuestas.find(u => u.numero_unidad === numUnidadFiltro);
        if (!uOficial) {
            uOficial = {
                numero_unidad: numUnidadFiltro,
                nombre_unidad: `Unidad ${numUnidadFiltro}`,
                semestre: numUnidadFiltro <= 2 ? 1 : 2,
                fecha_inicio: numUnidadFiltro <= 2 ? `${detalle.anio}-03-02` : `${detalle.anio}-07-20`,
                fecha_fin: numUnidadFiltro <= 2 ? `${detalle.anio}-07-03` : `${detalle.anio}-12-04`,
                horas_estimadas: 38,
                oas_seleccionados: [],
                indicadores_evaluacion: '',
                orden: numUnidadFiltro
            };
        }
        const existente = await queryGet(
            `SELECT * FROM planificaciones_unidades WHERE planificacion_id = ? AND numero_unidad = ?`,
            [planId, numUnidadFiltro]
        );
        if (existente) {
            await queryRun(`
                UPDATE planificaciones_unidades
                SET nombre_unidad = ?, oas_seleccionados = ?, indicadores_evaluacion = ?, actualizado_en = CURRENT_TIMESTAMP
                WHERE id = ?
            `, [
                uOficial.nombre_unidad,
                JSON.stringify(uOficial.oas_seleccionados),
                uOficial.indicadores_evaluacion,
                existente.id
            ]);
        } else {
            await queryRun(`
                INSERT INTO planificaciones_unidades
                (planificacion_id, numero_unidad, nombre_unidad, semestre, fecha_inicio, fecha_fin, horas_estimadas, oas_seleccionados, indicadores_evaluacion, orden)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                planId,
                uOficial.numero_unidad,
                uOficial.nombre_unidad,
                uOficial.semestre,
                uOficial.fecha_inicio,
                uOficial.fecha_fin,
                uOficial.horas_estimadas,
                JSON.stringify(uOficial.oas_seleccionados),
                uOficial.indicadores_evaluacion,
                uOficial.orden
            ]);
        }
    } else {
        for (const uOficial of unidadesPropuestas) {
            const existente = await queryGet(
                `SELECT * FROM planificaciones_unidades WHERE planificacion_id = ? AND numero_unidad = ?`,
                [planId, uOficial.numero_unidad]
            );
            if (existente) {
                await queryRun(`
                    UPDATE planificaciones_unidades
                    SET nombre_unidad = ?, semestre = ?, oas_seleccionados = ?, indicadores_evaluacion = ?, actualizado_en = CURRENT_TIMESTAMP
                    WHERE id = ?
                `, [
                    uOficial.nombre_unidad,
                    uOficial.semestre,
                    JSON.stringify(uOficial.oas_seleccionados),
                    uOficial.indicadores_evaluacion,
                    existente.id
                ]);
            } else {
                await queryRun(`
                    INSERT INTO planificaciones_unidades
                    (planificacion_id, numero_unidad, nombre_unidad, semestre, fecha_inicio, fecha_fin, horas_estimadas, oas_seleccionados, indicadores_evaluacion, orden)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    planId,
                    uOficial.numero_unidad,
                    uOficial.nombre_unidad,
                    uOficial.semestre,
                    uOficial.fecha_inicio,
                    uOficial.fecha_fin,
                    uOficial.horas_estimadas,
                    JSON.stringify(uOficial.oas_seleccionados),
                    uOficial.indicadores_evaluacion,
                    uOficial.orden
                ]);
            }
        }
    }

    await queryRun(`UPDATE planificaciones SET actualizado_en = CURRENT_TIMESTAMP WHERE id = ?`, [planId]);
    const planActualizado = await obtenerPlanificacionDetalle(planId);
    const tieneOas = Boolean(planActualizado.oas_disponibles && planActualizado.oas_disponibles.length > 0);
    return {
        plan: planActualizado,
        tieneOasOficiales: tieneOas,
        totalUnidades: unidadesPropuestas.length
    };
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
            hitos_completados = COALESCE(?, hitos_completados),
            actualizado_en = CURRENT_TIMESTAMP
        WHERE id = ?
    `, [
        payload.titulo,
        payload.docente_responsable,
        payload.docentes_colaboradores ? JSON.stringify(payload.docentes_colaboradores) : null,
        payload.cursos_vinculados ? JSON.stringify(payload.cursos_vinculados) : null,
        payload.metas_anuales,
        payload.horas_anuales,
        payload.hitos_completados ? JSON.stringify(payload.hitos_completados) : null,
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
            const hitosAsociados = JSON.stringify(u.hitos_asociados || []);
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
                        hitos_asociados = ?,
                        orden = ?
                    WHERE id = ? AND planificacion_id = ?
                `, [numUnidad, nombre, semestre, fInicio, fFin, horas, oas, oats, habs, acts, indics, insts, desglose, tags, hitosAsociados, orden, u.id, id]);
            } else {
                await queryRun(`
                    INSERT INTO planificaciones_unidades
                    (planificacion_id, numero_unidad, nombre_unidad, semestre, fecha_inicio, fecha_fin, horas_estimadas, oas_seleccionados, oats_seleccionados, habilidades, actitudes, indicadores_evaluacion, instrumentos_evaluacion, desglose_semanal, tags, hitos_asociados, orden)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [id, numUnidad, nombre, semestre, fInicio, fFin, horas, oas, oats, habs, acts, indics, insts, desglose, tags, hitosAsociados, orden]);
            }
        }
    }

    return { mensaje: "Planificación guardada correctamente." };
}

// -------------------------------------------------------------
// 5b. Clonar Planificación (Copia Independiente a Paralelo)
// -------------------------------------------------------------
async function clonarPlanificacion(planId, cursoDestino, usuario) {
    const u = usuario || {};
    const userEmail = u.email || 'sistema@colegiocerrogrande.cl';
    const userName = u.nombre || userEmail.split('@')[0] || 'Sistema';
    const userRol = u.rol || 'Docente';

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
        userEmail
    ]);

    const nuevoPlanId = resIns.lastID;

    // Copiar todas las unidades
    const unidades = await queryAll(`SELECT * FROM planificaciones_unidades WHERE planificacion_id = ? ORDER BY numero_unidad ASC, orden ASC`, [planId]);
    for (const u of unidades) {
        await queryRun(`
            INSERT INTO planificaciones_unidades
            (planificacion_id, numero_unidad, nombre_unidad, semestre, fecha_inicio, fecha_fin, horas_estimadas, oas_seleccionados, oats_seleccionados, habilidades, actitudes, indicadores_evaluacion, instrumentos_evaluacion, desglose_semanal, tags, hitos_asociados, orden)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
            u.hitos_asociados || '[]',
            u.orden
        ]);
    }

    // Checkpoint de creación
    await crearCheckpointVersion(
        nuevoPlanId,
        `V1.0: Clonada desde ${plan.curso} por ${userName}`,
        { email: userEmail, nombre: userName, rol: userRol },
        'checkpoint'
    );

    auditoria.registrarAuditoria({
        modulo: 'PLANIFICACIONES',
        accion: 'Clonar',
        descripcion: `Clonó la planificación de ${plan.curso} a ${destinoNorm} en ${plan.asignatura}`,
        detalles: { plan_origen_id: planId, nuevo_plan_id: nuevoPlanId, curso_origen: plan.curso, curso_destino: destinoNorm, asignatura: plan.asignatura },
        usuario_email: userEmail,
        usuario_nombre: userName,
        rol: userRol,
        nivel: 'success'
    });

    return { id: nuevoPlanId, mensaje: `Planificación clonada con éxito a ${destinoNorm}.` };
}

// -------------------------------------------------------------
// 5c. Vincular Curso (Planificación Compartida en Vivo)
// -------------------------------------------------------------
async function vincularCurso(planId, cursoVinculado, usuario) {
    const u = usuario || {};
    const userEmail = u.email || 'sistema@colegiocerrogrande.cl';
    const userName = u.nombre || userEmail.split('@')[0] || 'Sistema';
    const userRol = u.rol || 'Docente';

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
        { email: userEmail, nombre: userName, rol: userRol },
        'checkpoint'
    );

    auditoria.registrarAuditoria({
        modulo: 'PLANIFICACIONES',
        accion: 'Vincular',
        descripcion: `Vinculó el curso paralelo ${vinculadNorm} a la planificación de ${plan.curso} (${plan.asignatura})`,
        detalles: { plan_id: planId, curso_principal: plan.curso, curso_vinculado: vinculadNorm },
        usuario_email: userEmail,
        usuario_nombre: userName,
        rol: userRol,
        nivel: 'info'
    });

    return { cursos_vinculados: arr, mensaje: `Curso ${vinculadNorm} vinculado exitosamente a ${plan.curso}.` };
}

// -------------------------------------------------------------
// 5d. Desvincular Curso (Con opción de fork/copia independiente)
// -------------------------------------------------------------
async function desvincularCurso(planId, cursoDesvincular, { crearCopia = false } = {}, usuario) {
    const u = usuario || {};
    const userEmail = u.email || 'sistema@colegiocerrogrande.cl';
    const userName = u.nombre || userEmail.split('@')[0] || 'Sistema';
    const userRol = u.rol || 'Docente';

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
        const resClon = await clonarPlanificacion(planId, desvNorm, { email: userEmail, nombre: userName, rol: userRol });
        nuevoPlanId = resClon.id;
    }

    await crearCheckpointVersion(
        planId,
        `Desvinculación del curso paralelo ${desvNorm}${crearCopia ? ' (se generó copia independiente)' : ''}`,
        { email: userEmail, nombre: userName, rol: userRol },
        'checkpoint'
    );

    auditoria.registrarAuditoria({
        modulo: 'PLANIFICACIONES',
        accion: 'Desvincular',
        descripcion: `Desvinculó el curso paralelo ${desvNorm} de la planificación de ${plan.curso} (${plan.asignatura})`,
        detalles: { plan_id: planId, curso_desvinculado: desvNorm, copia_creada: crearCopia, nuevo_plan_id: nuevoPlanId },
        usuario_email: userEmail,
        usuario_nombre: userName,
        rol: userRol,
        nivel: 'info'
    });

    return {
        cursos_vinculados: arr,
        nuevo_plan_id: nuevoPlanId,
        mensaje: `Curso ${desvNorm} desvinculado exitosamente.${crearCopia ? ' Se creó una copia independiente.' : ''}`
    };
}

// -------------------------------------------------------------
// 5e. Promover Planificación Individual desde Año Anterior
// -------------------------------------------------------------
async function promoverPlanificacionIndividual(planIdOrigen, annoDestino, usuario) {
    const annosService = require('./annos');
    const orig = await queryGet(`SELECT id, anio, curso, asignatura FROM planificaciones WHERE id = ?`, [planIdOrigen]);
    if (!orig) throw new Error("Planificación de origen no encontrada.");

    const dest = parseInt(annoDestino);
    if (!dest) throw new Error("Debe especificar el año de destino.");

    const res = await annosService.promoverPlanificacionesInteranual(
        orig.anio,
        dest,
        { planIds: [planIdOrigen], soloVisadas: false },
        usuario
    );

    const nuevo = await queryGet(`SELECT id FROM planificaciones WHERE anio = ? AND curso = ? AND asignatura = ?`, [dest, orig.curso, orig.asignatura]);
    return {
        id: nuevo ? nuevo.id : null,
        nuevoPlanId: nuevo ? nuevo.id : null,
        mensaje: nuevo 
            ? `Planificación promovida exitosamente al Año ${dest}.` 
            : res.mensaje
    };
}

// -------------------------------------------------------------
// 6. Control de Versiones Tipo Git (Checkpoints y Restauración)
// -------------------------------------------------------------
async function crearCheckpointVersion(planificacionId, mensaje, usuario, tipo = 'checkpoint') {
    const u = usuario || {};
    const userEmail = u.email || 'sistema@colegiocerrogrande.cl';
    const userName = u.nombre || userEmail.split('@')[0] || 'Sistema';
    const userRol = u.rol || 'Docente';

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
        userEmail,
        userName,
        JSON.stringify(snapshot),
        tipo
    ]);

    auditoria.registrarAuditoria({
        modulo: 'PLANIFICACIONES',
        accion: 'Guardar Versión',
        descripcion: `Creó el checkpoint de versión ${numVersion}: "${mensaje}" en ${plan.curso} - ${plan.asignatura}`,
        detalles: { plan_id: planificacionId, version: numVersion, mensaje },
        usuario_email: userEmail,
        usuario_nombre: userName,
        rol: userRol,
        nivel: 'info'
    });

    return { id: res.lastID, version_numero: numVersion, mensaje: "Versión guardada con éxito." };
}

async function restaurarVersion(planificacionId, versionId, usuario) {
    const u = usuario || {};
    const userEmail = u.email || 'sistema@colegiocerrogrande.cl';
    const userName = u.nombre || userEmail.split('@')[0] || 'Sistema';
    const userRol = u.rol || 'Docente';

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
        for (const un of unidades) {
            await queryRun(`
                INSERT INTO planificaciones_unidades
                (planificacion_id, numero_unidad, nombre_unidad, semestre, fecha_inicio, fecha_fin, horas_estimadas, oas_seleccionados, oats_seleccionados, habilidades, actitudes, indicadores_evaluacion, instrumentos_evaluacion, desglose_semanal, tags, hitos_asociados, orden)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                planificacionId,
                un.numero_unidad,
                un.nombre_unidad,
                un.semestre,
                un.fecha_inicio,
                un.fecha_fin,
                un.horas_estimadas,
                un.oas_seleccionados,
                un.oats_seleccionados,
                un.habilidades,
                un.actitudes,
                un.indicadores_evaluacion,
                un.instrumentos_evaluacion,
                un.desglose_semanal,
                un.tags || '[]',
                un.hitos_asociados || '[]',
                un.orden
            ]);
        }
    }

    // Registrar un nuevo checkpoint de restauración
    await crearCheckpointVersion(
        planificacionId,
        `Restauración a partir de versión ${version.version_numero} (${version.mensaje})`,
        { email: userEmail, nombre: userName, rol: userRol },
        'checkpoint'
    );

    auditoria.registrarAuditoria({
        modulo: 'PLANIFICACIONES',
        accion: 'Restaurar Versión',
        descripcion: `Restauró la planificación al estado de la versión ${version.version_numero}`,
        detalles: { plan_id: planificacionId, version_restaurada: version.version_numero },
        usuario_email: userEmail,
        usuario_nombre: userName,
        rol: userRol,
        nivel: 'warning'
    });

    return { mensaje: `Planificación restaurada exitosamente a la versión ${version.version_numero}.` };
}

// -------------------------------------------------------------
// 7. Flujo Ágil de Revisión y Visado (En edición <-> Visada)
// -------------------------------------------------------------
async function cambiarEstadoVisado(planificacionId, { estado, comentario }, usuario) {
    const u = usuario || {};
    const userEmail = u.email || 'coordinacion@colegiocerrogrande.cl';
    const userName = u.nombre || userEmail.split('@')[0] || 'Coordinación';
    const userRol = u.rol || 'Coordinador';

    const plan = await queryGet(`SELECT * FROM planificaciones WHERE id = ?`, [planificacionId]);
    if (!plan) throw new Error("Planificación no encontrada.");

    const nuevoEstado = (estado === 'Visada') ? 'Visada' : 'En edición';
    const visadoPor = (nuevoEstado === 'Visada') ? userEmail : null;
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
        ? `Visada por Coordinación (${userName}): ${comentario || 'Aprobada sin observaciones.'}`
        : `Reabierta a edición por ${userName}: ${comentario || 'Modificaciones solicitadas.'}`;

    await crearCheckpointVersion(planificacionId, msj, { email: userEmail, nombre: userName, rol: userRol }, 'visado');

    // Registrar en auditoría
    auditoria.registrarAuditoria({
        modulo: 'PLANIFICACIONES',
        accion: nuevoEstado === 'Visada' ? 'Visar' : 'Reabrir',
        descripcion: `${nuevoEstado === 'Visada' ? 'Visó' : 'Reabrió'} la planificación de ${plan.curso} - ${plan.asignatura}`,
        detalles: { plan_id: planificacionId, estado: nuevoEstado, comentario },
        usuario_email: userEmail,
        usuario_nombre: userName,
        rol: userRol,
        nivel: nuevoEstado === 'Visada' ? 'success' : 'warning'
    });

    // Enviar notificación por correo al docente responsable si está configurado
    if (plan.docente_responsable && plan.docente_responsable.includes('@')) {
        mailer.enviarConPlantilla({
            clave: 'aviso_general',
            variables: {
                profesor_nombre: plan.docente_responsable.split('@')[0],
                titulo_aviso: `Estado de Planificación: ${plan.curso} - ${plan.asignatura}`,
                mensaje_aviso: `La planificación ha cambiado de estado a <strong>${nuevoEstado}</strong> por ${userName}.<br>Observaciones: ${comentario || 'Sin observaciones adicionales.'}`
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
    const u = usuario || {};
    const userEmail = u.email || 'docente@colegiocerrogrande.cl';
    const userName = u.nombre || userEmail.split('@')[0] || 'Docente';
    const userRol = u.rol || 'Profesor';

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
        userEmail,
        userName,
        userRol,
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
        const objs = await queryAll(`SELECT codigo, categoria, descripcion, unidad_sugerida, nombre_unidad_oficial FROM curriculo_objetivos WHERE plan_id = ? AND activo = 1 ORDER BY orden ASC, codigo ASC`, [planCurr.id]);
        const codigosUnicosMap = new Map();
        objs.forEach(o => {
            const cod = (o.codigo || '').trim().toUpperCase();
            if (!cod) return;
            if (!codigosUnicosMap.has(cod)) {
                codigosUnicosMap.set(cod, o);
            } else if (o.categoria === 'Basal' && codigosUnicosMap.get(cod).categoria !== 'Basal') {
                codigosUnicosMap.set(cod, o);
            }
        });
        totalPrograma = codigosUnicosMap.size;
        codigosUnicosMap.forEach((o, cod) => {
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

// -------------------------------------------------------------
// 12. Gestión de Solicitud de Eliminación y Cambio de Propietario
// -------------------------------------------------------------

async function solicitarEliminacionPlan(planId, { motivo = '' } = {}, usuario = {}) {
    const plan = await queryGet(`SELECT * FROM planificaciones WHERE id = ?`, [planId]);
    if (!plan) throw new Error("Planificación no encontrada.");

    const uEmail = (usuario.email || '').trim().toLowerCase();
    const uNombre = (usuario.nombre || '').trim().toLowerCase();
    const rolNorm = (usuario.rol || '').trim().toLowerCase();
    const esAdmin = rolNorm.includes('admin') || rolNorm.includes('directiv') || rolNorm.includes('coordinaci');

    const esCreador = (plan.creado_por && plan.creado_por.toLowerCase() === uEmail) ||
                      (plan.docente_responsable && (plan.docente_responsable.toLowerCase() === uNombre || plan.docente_responsable.toLowerCase() === uEmail));

    if (!esCreador && !esAdmin) {
        throw new Error("Solo el creador, docente responsable o un administrador pueden solicitar la eliminación de esta planificación.");
    }

    const motivoFinal = motivo.trim() || 'El docente indicó que se equivocó de curso o asignatura.';
    const solicitadoPor = usuario.nombre || usuario.email || 'Docente';

    await queryRun(`
        UPDATE planificaciones 
        SET solicitud_eliminacion = 1,
            solicitud_eliminacion_motivo = ?,
            solicitud_eliminacion_por = ?,
            solicitud_eliminacion_fecha = CURRENT_TIMESTAMP
        WHERE id = ?
    `, [motivoFinal, solicitadoPor, planId]);

    auditoria.registrarAuditoria({
        usuario,
        modulo: 'PLANIFICACIONES',
        accion: 'Solicitud Eliminación',
        descripcion: `${solicitadoPor} solicitó eliminar la planificación de ${plan.curso} - ${plan.asignatura}: "${motivoFinal}"`,
        detalles: { plan_id: planId, curso: plan.curso, asignatura: plan.asignatura, motivo: motivoFinal },
        nivel: 'warning'
    });

    return {
        success: true,
        message: 'Solicitud de eliminación registrada. Quedará pendiente de aprobación por el equipo directivo/UTP.'
    };
}

async function cancelarSolicitudEliminacion(planId, usuario = {}) {
    const plan = await queryGet(`SELECT * FROM planificaciones WHERE id = ?`, [planId]);
    if (!plan) throw new Error("Planificación no encontrada.");

    await queryRun(`
        UPDATE planificaciones 
        SET solicitud_eliminacion = 0,
            solicitud_eliminacion_motivo = NULL,
            solicitud_eliminacion_por = NULL,
            solicitud_eliminacion_fecha = NULL
        WHERE id = ?
    `, [planId]);

    auditoria.registrarAuditoria({
        usuario,
        modulo: 'PLANIFICACIONES',
        accion: 'Cancelar Solicitud Eliminación',
        descripcion: `Se canceló la solicitud de eliminación de la planificación de ${plan.curso} - ${plan.asignatura}`,
        detalles: { plan_id: planId },
        nivel: 'info'
    });

    return { success: true, message: 'Solicitud de eliminación cancelada. La planificación sigue activa.' };
}

async function eliminarPlanificacion(planId, usuario = {}) {
    const plan = await queryGet(`SELECT * FROM planificaciones WHERE id = ?`, [planId]);
    if (!plan) throw new Error("Planificación no encontrada.");

    // Desvincular de otras planificaciones si estaba en cursos_vinculados
    try {
        const planesVinculantes = await queryAll(
            `SELECT id, cursos_vinculados FROM planificaciones WHERE anio = ? AND asignatura = ? AND id != ?`,
            [plan.anio, plan.asignatura, planId]
        );
        for (const pv of planesVinculantes) {
            let vArr = [];
            try { vArr = JSON.parse(pv.cursos_vinculados || '[]'); } catch(e) { vArr = []; }
            if (vArr.includes(plan.curso)) {
                vArr = vArr.filter(c => c !== plan.curso);
                await queryRun(`UPDATE planificaciones SET cursos_vinculados = ? WHERE id = ?`, [JSON.stringify(vArr), pv.id]);
            }
        }
    } catch(eVinc) {
        console.warn("Advertencia limpiando vínculos paralelos:", eVinc);
    }

    // Borrado en cascada
    await queryRun(`DELETE FROM planificaciones_observaciones WHERE planificacion_id = ?`, [planId]);
    await queryRun(`DELETE FROM planificaciones_versiones WHERE planificacion_id = ?`, [planId]);
    await queryRun(`DELETE FROM planificaciones_unidades WHERE planificacion_id = ?`, [planId]);
    await queryRun(`DELETE FROM planificaciones WHERE id = ?`, [planId]);

    auditoria.registrarAuditoria({
        usuario,
        modulo: 'PLANIFICACIONES',
        accion: 'Eliminar Planificación',
        descripcion: `Se eliminó definitivamente la planificación de ${plan.curso} - ${plan.asignatura} (Año ${plan.anio})`,
        detalles: { plan_id: planId, curso: plan.curso, asignatura: plan.asignatura, anio: plan.anio },
        nivel: 'danger'
    });

    return { success: true, message: `La planificación de ${plan.curso} - ${plan.asignatura} fue eliminada exitosamente.` };
}

async function resolverEliminacionPlan(planId, params = {}, usuario = {}) {
    const accion = (params.accion || params.resolucion || '').toLowerCase();
    const nuevo_propietario = params.nuevo_propietario || params.nuevoDocente || '';
    const motivo_respuesta = params.motivo_respuesta || params.observacion || '';

    const plan = await queryGet(`SELECT * FROM planificaciones WHERE id = ?`, [planId]);
    if (!plan) throw new Error("Planificación no encontrada.");

    if (accion === 'aceptar' || accion === 'eliminar') {
        return await eliminarPlanificacion(planId, usuario);
    } else if (accion === 'denegar' || accion === 'rechazar') {
        await queryRun(`
            UPDATE planificaciones 
            SET solicitud_eliminacion = 0,
                solicitud_eliminacion_motivo = NULL,
                solicitud_eliminacion_por = NULL,
                solicitud_eliminacion_fecha = NULL
            WHERE id = ?
        `, [planId]);

        if (motivo_respuesta && motivo_respuesta.trim()) {
            await queryRun(`
                INSERT INTO planificaciones_observaciones (planificacion_id, seccion, autor_email, autor_nombre, autor_rol, comentario, resuelto)
                VALUES (?, 'general', ?, ?, 'Administración', ?, 1)
            `, [planId, usuario.email || 'admin@colegiocerrogrande.cl', usuario.nombre || 'Administración', `Solicitud de eliminación denegada: ${motivo_respuesta.trim()}`]);
        }

        auditoria.registrarAuditoria({
            usuario,
            modulo: 'PLANIFICACIONES',
            accion: 'Denegar Eliminación',
            descripcion: `Se denegó la solicitud de eliminación de ${plan.curso} - ${plan.asignatura}`,
            detalles: { plan_id: planId, motivo_respuesta },
            nivel: 'info'
        });

        return { success: true, message: 'La solicitud de eliminación fue denegada. La planificación permanece activa.' };
    } else if (accion === 'cambiar_propietario' || accion === 'reasignar') {
        if (!nuevo_propietario || !nuevo_propietario.trim()) {
            throw new Error("Debe indicar el nombre o correo del nuevo docente propietario.");
        }
        const propietarioFinal = nuevo_propietario.trim();
        await queryRun(`
            UPDATE planificaciones 
            SET docente_responsable = ?,
                solicitud_eliminacion = 0,
                solicitud_eliminacion_motivo = NULL,
                solicitud_eliminacion_por = NULL,
                solicitud_eliminacion_fecha = NULL
            WHERE id = ?
        `, [propietarioFinal, planId]);

        auditoria.registrarAuditoria({
            usuario,
            modulo: 'PLANIFICACIONES',
            accion: 'Cambiar Propietario',
            descripcion: `Se cambió el propietario de la planificación de ${plan.curso} - ${plan.asignatura} de "${plan.docente_responsable}" a "${propietarioFinal}"`,
            detalles: { plan_id: planId, anterior: plan.docente_responsable, nuevo: propietarioFinal },
            nivel: 'info'
        });

        return { success: true, message: `Propietario actualizado a "${propietarioFinal}". La solicitud de eliminación ha sido resuelta.` };
    } else {
        throw new Error(`Acción no válida ('${accion}'). Debe ser 'aceptar', 'denegar' o 'cambiar_propietario'.`);
    }
}

async function cambiarPropietarioPlan(planId, nuevoPropietario, usuario = {}) {
    const plan = await queryGet(`SELECT * FROM planificaciones WHERE id = ?`, [planId]);
    if (!plan) throw new Error("Planificación no encontrada.");

    if (!nuevoPropietario || !nuevoPropietario.trim()) {
        throw new Error("Debe especificar el nuevo docente propietario.");
    }
    const prop = nuevoPropietario.trim();
    await queryRun(`UPDATE planificaciones SET docente_responsable = ? WHERE id = ?`, [prop, planId]);

    auditoria.registrarAuditoria({
        usuario,
        modulo: 'PLANIFICACIONES',
        accion: 'Cambiar Propietario',
        descripcion: `Se reasignó la planificación de ${plan.curso} - ${plan.asignatura} a: ${prop}`,
        detalles: { plan_id: planId, anterior: plan.docente_responsable, nuevo: prop },
        nivel: 'info'
    });

    return { success: true, message: `Propietario reasignado con éxito a "${prop}".` };
}

// -------------------------------------------------------------
// 19. HITOS Y LINEAMIENTOS INSTITUCIONALES (UTP / ADMIN)
// -------------------------------------------------------------
async function listarHitos(anio) {
    const anioNum = parseInt(anio) || 2026;
    const rows = await queryAll(`SELECT * FROM planificaciones_hitos WHERE anio = ? ORDER BY fecha_inicio ASC, id ASC`, [anioNum]);
    return rows.map(r => {
        try { r.asignaturas = typeof r.asignaturas === 'string' ? JSON.parse(r.asignaturas || '[]') : (r.asignaturas || []); } catch(e) { r.asignaturas = []; }
        try { r.cursos = typeof r.cursos === 'string' ? JSON.parse(r.cursos || '[]') : (r.cursos || []); } catch(e) { r.cursos = []; }
        try { r.cursos_excluidos = typeof r.cursos_excluidos === 'string' ? JSON.parse(r.cursos_excluidos || '[]') : (r.cursos_excluidos || []); } catch(e) { r.cursos_excluidos = []; }
        try { r.oas_sugeridos = typeof r.oas_sugeridos === 'string' ? JSON.parse(r.oas_sugeridos || '[]') : (r.oas_sugeridos || []); } catch(e) { r.oas_sugeridos = []; }
        try { r.metodologias_sugeridas = typeof r.metodologias_sugeridas === 'string' ? JSON.parse(r.metodologias_sugeridas || '[]') : (r.metodologias_sugeridas || []); } catch(e) { r.metodologias_sugeridas = []; }
        try { r.recursos_enlaces = typeof r.recursos_enlaces === 'string' ? JSON.parse(r.recursos_enlaces || '[]') : (r.recursos_enlaces || []); } catch(e) { r.recursos_enlaces = []; }
        return r;
    });
}

function normTextoHito(s) {
    return String(s || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/\s+/g, ' ').trim();
}

async function obtenerHitosParaPlan(anio, curso, asignatura) {
    const hitos = await listarHitos(anio);
    const cNorm = normTextoHito(curso);
    const aNorm = normTextoHito(asignatura);

    return hitos.filter(h => {
        if (h.activo === 0) return false;

        // 1. Exclusiones de cursos (prioridad máxima)
        const excluidos = (h.cursos_excluidos || []).map(c => normTextoHito(c));
        if (excluidos.some(exc => {
            if (!exc) return false;
            return cNorm === exc || (exc.length >= 2 && (cNorm.includes(exc) || exc.includes(cNorm)));
        })) {
            return false;
        }

        // 2. Inclusión de cursos
        if (!h.todos_cursos) {
            const cursosInc = (h.cursos || []).map(c => normTextoHito(c));
            if (cursosInc.length > 0 && !cursosInc.includes('TODOS')) {
                const coincideCurso = cursosInc.some(inc => {
                    if (!inc) return false;
                    return cNorm === inc || (inc.length >= 2 && (cNorm.includes(inc) || inc.includes(cNorm)));
                });
                if (!coincideCurso) return false;
            }
        }

        // 3. Inclusión de asignaturas
        if (!h.todas_asignaturas) {
            const asigsInc = (h.asignaturas || []).map(a => normTextoHito(a));
            if (asigsInc.length > 0 && !asigsInc.includes('TODAS')) {
                const coincideAsig = asigsInc.some(inc => {
                    if (!inc) return false;
                    return aNorm === inc || (inc.length >= 3 && (aNorm.includes(inc) || inc.includes(aNorm)));
                });
                if (!coincideAsig) return false;
            }
        }

        return true;
    });
}

async function crearHito(datos, usuario = {}) {
    const anio = parseInt(datos.anio || datos.anno) || 2026;
    const titulo = (datos.titulo || '').trim();
    if (!titulo) throw new Error("El título del hito es obligatorio.");
    if (!datos.fecha_inicio || !datos.fecha_fin) throw new Error("Las fechas de inicio y término son obligatorias.");

    const res = await queryRun(`
        INSERT INTO planificaciones_hitos (
            anio, titulo, tipo, icono, color, fecha_inicio, fecha_fin,
            todas_asignaturas, asignaturas, todos_cursos, cursos, cursos_excluidos,
            lineamientos, oas_sugeridos, metodologias_sugeridas, recursos_enlaces,
            bloquear_edicion, activo, creado_por
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
        anio,
        titulo,
        datos.tipo || 'Semana Temática',
        datos.icono || '🎭',
        datos.color || '#2563eb',
        datos.fecha_inicio,
        datos.fecha_fin,
        datos.todas_asignaturas ? 1 : 0,
        JSON.stringify(Array.isArray(datos.asignaturas) ? datos.asignaturas : []),
        datos.todos_cursos ? 1 : 0,
        JSON.stringify(Array.isArray(datos.cursos) ? datos.cursos : []),
        JSON.stringify(Array.isArray(datos.cursos_excluidos) ? datos.cursos_excluidos : []),
        datos.lineamientos || '',
        JSON.stringify(Array.isArray(datos.oas_sugeridos) ? datos.oas_sugeridos : []),
        JSON.stringify(Array.isArray(datos.metodologias_sugeridas) ? datos.metodologias_sugeridas : []),
        JSON.stringify(Array.isArray(datos.recursos_enlaces) ? datos.recursos_enlaces : []),
        datos.bloquear_edicion ? 1 : 0,
        datos.activo !== undefined ? (datos.activo ? 1 : 0) : 1,
        usuario.email || usuario.nombre || 'admin'
    ]);

    auditoria.registrarAuditoria({
        usuario,
        modulo: 'PLANIFICACIONES',
        accion: 'Crear Hito',
        descripcion: `Creó el hito institucional "${titulo}" (${datos.fecha_inicio} al ${datos.fecha_fin}) para el año ${anio}`,
        detalles: { hito_id: res.lastID, titulo, anio },
        nivel: 'info'
    });

    return { success: true, id: res.lastID, mensaje: `Hito "${titulo}" creado con éxito.` };
}

async function actualizarHito(id, datos, usuario = {}) {
    const hitoActual = await queryGet(`SELECT * FROM planificaciones_hitos WHERE id = ?`, [id]);
    if (!hitoActual) throw new Error("Hito no encontrado.");

    const titulo = (datos.titulo || hitoActual.titulo || '').trim();
    if (!titulo) throw new Error("El título del hito es obligatorio.");

    await queryRun(`
        UPDATE planificaciones_hitos SET
            titulo = ?,
            tipo = ?,
            icono = ?,
            color = ?,
            fecha_inicio = ?,
            fecha_fin = ?,
            todas_asignaturas = ?,
            asignaturas = ?,
            todos_cursos = ?,
            cursos = ?,
            cursos_excluidos = ?,
            lineamientos = ?,
            oas_sugeridos = ?,
            metodologias_sugeridas = ?,
            recursos_enlaces = ?,
            bloquear_edicion = ?,
            activo = ?,
            actualizado_en = CURRENT_TIMESTAMP
        WHERE id = ?
    `, [
        titulo,
        datos.tipo || hitoActual.tipo,
        datos.icono || hitoActual.icono,
        datos.color || hitoActual.color,
        datos.fecha_inicio || hitoActual.fecha_inicio,
        datos.fecha_fin || hitoActual.fecha_fin,
        datos.todas_asignaturas !== undefined ? (datos.todas_asignaturas ? 1 : 0) : hitoActual.todas_asignaturas,
        JSON.stringify(Array.isArray(datos.asignaturas) ? datos.asignaturas : JSON.parse(hitoActual.asignaturas || '[]')),
        datos.todos_cursos !== undefined ? (datos.todos_cursos ? 1 : 0) : hitoActual.todos_cursos,
        JSON.stringify(Array.isArray(datos.cursos) ? datos.cursos : JSON.parse(hitoActual.cursos || '[]')),
        JSON.stringify(Array.isArray(datos.cursos_excluidos) ? datos.cursos_excluidos : JSON.parse(hitoActual.cursos_excluidos || '[]')),
        datos.lineamientos !== undefined ? datos.lineamientos : hitoActual.lineamientos,
        JSON.stringify(Array.isArray(datos.oas_sugeridos) ? datos.oas_sugeridos : JSON.parse(hitoActual.oas_sugeridos || '[]')),
        JSON.stringify(Array.isArray(datos.metodologias_sugeridas) ? datos.metodologias_sugeridas : JSON.parse(hitoActual.metodologias_sugeridas || '[]')),
        JSON.stringify(Array.isArray(datos.recursos_enlaces) ? datos.recursos_enlaces : JSON.parse(hitoActual.recursos_enlaces || '[]')),
        datos.bloquear_edicion !== undefined ? (datos.bloquear_edicion ? 1 : 0) : hitoActual.bloquear_edicion,
        datos.activo !== undefined ? (datos.activo ? 1 : 0) : hitoActual.activo,
        id
    ]);

    auditoria.registrarAuditoria({
        usuario,
        modulo: 'PLANIFICACIONES',
        accion: 'Actualizar Hito',
        descripcion: `Actualizó el hito institucional "${titulo}"`,
        detalles: { hito_id: id, titulo },
        nivel: 'info'
    });

    return { success: true, mensaje: `Hito "${titulo}" actualizado.` };
}

async function eliminarHito(id, usuario = {}) {
    const hito = await queryGet(`SELECT * FROM planificaciones_hitos WHERE id = ?`, [id]);
    if (!hito) throw new Error("Hito no encontrado.");

    await queryRun(`DELETE FROM planificaciones_hitos WHERE id = ?`, [id]);

    auditoria.registrarAuditoria({
        usuario,
        modulo: 'PLANIFICACIONES',
        accion: 'Eliminar Hito',
        descripcion: `Eliminó el hito institucional "${hito.titulo}"`,
        detalles: { hito_id: id, titulo: hito.titulo, anio: hito.anio },
        nivel: 'warning'
    });

    return { success: true, mensaje: `Hito "${hito.titulo}" eliminado correctamente.` };
}

async function marcarHitoCompletadoPlan(planId, hitoId, completado, usuario = {}) {
    const plan = await queryGet(`SELECT id, titulo, curso, asignatura, anio, hitos_completados FROM planificaciones WHERE id = ?`, [planId]);
    if (!plan) throw new Error("Planificación no encontrada.");

    let completados = [];
    try {
        completados = JSON.parse(plan.hitos_completados || '[]');
    } catch (e) {
        completados = [];
    }

    const hId = parseInt(hitoId);
    if (completado) {
        if (!completados.includes(hId)) {
            completados.push(hId);
        }
    } else {
        completados = completados.filter(id => id !== hId);
    }

    await queryRun(`UPDATE planificaciones SET hitos_completados = ?, actualizado_en = CURRENT_TIMESTAMP WHERE id = ?`, [JSON.stringify(completados), planId]);

    auditoria.registrarAuditoria({
        usuario,
        modulo: 'PLANIFICACIONES',
        accion: completado ? 'Completar Hito' : 'Reactivar Hito',
        descripcion: `Hito ID ${hId} marcado como ${completado ? 'completado/planificado' : 'pendiente'} en planificación de ${plan.curso} - ${plan.asignatura}`,
        detalles: { plan_id: planId, hito_id: hId, completado },
        usuario_email: usuario ? usuario.email : null,
        usuario_nombre: usuario ? usuario.nombre : null,
        rol: usuario ? usuario.rol : null,
        nivel: 'info'
    });

    return { success: true, hitos_completados: completados };
}

// -------------------------------------------------------------
// 20. PLANTILLAS E IMPORTACIÓN MASIVA XLS
// -------------------------------------------------------------
function generarPlantillaHitosExcel() {
    const ejemplo = [
        {
            titulo: 'Semana del Teatro',
            tipo: 'Semana Temática',
            icono: '🎭',
            color: '#e11d48',
            fecha_inicio: '2026-05-11',
            fecha_fin: '2026-05-15',
            asignaturas: 'LENGUAJE Y COMUNICACION, LENGUA Y LITERATURA',
            cursos: 'TODOS',
            cursos_excluidos: '1° BASICO, 2° BASICO',
            lineamientos: 'Desarrollar una obra teatral o lectura dramatizada articulando expresión oral, comprensión lectora y puesta en escena escolar.',
            oas_sugeridos: 'OA 01 Lenguaje y Comunicación (3° Básico), OA 03 Lenguaje y Comunicación (3° Básico)',
            metodologias: 'ABP (Proyectos), DUA II: Acción y Expresión, Aprendizaje Colaborativo'
        },
        {
            titulo: 'Mes de la Ciencia y STEM',
            tipo: 'Proyecto Interdisciplinario',
            icono: '🔬',
            color: '#059669',
            fecha_inicio: '2026-08-03',
            fecha_fin: '2026-08-28',
            asignaturas: 'CIENCIAS NATURALES, FISICA, QUIMICA, BIOLOGIA, MATEMATICA, TECNOLOGIA',
            cursos: 'TODOS',
            cursos_excluidos: '',
            lineamientos: 'Feria de ciencias escolar con enfoque experimental y resolución de problemas cotidianos mediante proyectos STEAM.',
            oas_sugeridos: 'OA 01 Ciencias Naturales (4° Básico), OA 04 Matemática (4° Básico)',
            metodologias: 'STEAM, ABP (Proyectos), Rutinas de Pensamiento'
        },
        {
            titulo: 'Día Internacional del Libro',
            tipo: 'Efeméride Institucional',
            icono: '📖',
            color: '#2563eb',
            fecha_inicio: '2026-04-20',
            fecha_fin: '2026-04-24',
            asignaturas: 'TODAS',
            cursos: 'TODOS',
            cursos_excluidos: '',
            lineamientos: 'Actividades transversales de fomento lector, creación literaria y narración oral en todas las materias.',
            oas_sugeridos: 'OA 02 Lenguaje y Comunicación (2° Básico)',
            metodologias: 'DUA III: Compromiso y Motivación'
        }
    ];

    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(ejemplo);
    ws['!cols'] = [
        { wch: 25 }, { wch: 22 }, { wch: 8 }, { wch: 10 },
        { wch: 14 }, { wch: 14 }, { wch: 32 }, { wch: 15 },
        { wch: 30 }, { wch: 50 }, { wch: 35 }, { wch: 35 }
    ];
    xlsx.utils.book_append_sheet(wb, ws, "Hitos");
    return xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

async function importarHitosExcel(buffer, anio, usuario = {}) {
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(firstSheet);
    if (!rows || rows.length === 0) throw new Error("La planilla no contiene filas de datos.");

    const anioNum = parseInt(anio) || 2026;
    let creados = 0;

    for (const r of rows) {
        const titulo = (r['titulo'] || r['Titulo'] || r['Nombre'] || r['Hito'] || '').toString().trim();
        const fInicio = (r['fecha_inicio'] || r['Fecha Inicio'] || r['Desde'] || r['fecha inicio'] || '').toString().trim();
        const fFin = (r['fecha_fin'] || r['Fecha Fin'] || r['Hasta'] || r['fecha fin'] || '').toString().trim();
        if (!titulo || !fInicio || !fFin) continue;

        const tipo = (r['tipo'] || r['Tipo'] || 'Semana Temática').toString().trim();
        const icono = (r['icono'] || r['Icono'] || '🎭').toString().trim();
        const color = (r['color'] || r['Color'] || '#2563eb').toString().trim();
        
        const asigsRaw = (r['asignaturas'] || r['Asignaturas'] || 'TODAS').toString().trim();
        const todasAsigs = asigsRaw.toUpperCase() === 'TODAS' || asigsRaw === '';
        const asignaturasArr = todasAsigs ? [] : asigsRaw.split(/[,;\n]/).map(s => s.trim().toUpperCase()).filter(Boolean);

        const cursosRaw = (r['cursos'] || r['Cursos'] || 'TODOS').toString().trim();
        const todosCursos = cursosRaw.toUpperCase() === 'TODOS' || cursosRaw === '';
        const cursosArr = todosCursos ? [] : cursosRaw.split(/[,;\n]/).map(s => s.trim().toUpperCase()).filter(Boolean);

        // Cursos o Niveles Excluidos (Excepciones)
        const excluidosRaw = (r['cursos_excluidos'] || r['Excluidos'] || r['cursos excluidos'] || r['Cursos Excluidos'] || r['Niveles Excluidos'] || r['Excepciones'] || '').toString().trim();
        const excluidosArr = excluidosRaw ? excluidosRaw.split(/[,;\n]/).map(s => s.trim().toUpperCase()).filter(Boolean) : [];

        const lineamientos = (r['lineamientos'] || r['Lineamientos'] || r['Orientaciones'] || r['orientaciones'] || '').toString().trim();
        
        // OAs sugeridos con enriquecimiento automático desde currículo MINEDUC
        const oasRaw = (r['oas_sugeridos'] || r['OAs'] || r['oas'] || r['OAs Sugeridos'] || r['OA'] || r['Objetivos'] || '').toString().trim();
        const oasArr = oasRaw ? oasRaw.split(/[,;\n]/).map(s => s.trim()).filter(Boolean) : [];
        const enrichedOas = [];

        for (const rawOa of oasArr) {
            const oaTrim = rawOa.trim();
            if (!oaTrim) continue;
            const matchCod = oaTrim.match(/OA\s*\d+/i);
            if (matchCod) {
                const codClean = matchCod[0].toUpperCase().replace(/\s+/, ' ');
                try {
                    const found = await queryGet(`
                        SELECT o.codigo, o.descripcion, o.categoria, cp.nivel, cp.asignatura 
                        FROM curriculo_objetivos o
                        JOIN curriculo_planes cp ON cp.id = o.plan_id
                        WHERE cp.anio = ? AND (LOWER(o.codigo) = LOWER(?) OR o.codigo LIKE ?)
                        LIMIT 1
                    `, [anioNum, codClean, `%${codClean}%`]);
                    if (found) {
                        enrichedOas.push({
                            codigo: found.codigo,
                            nivel: found.nivel,
                            asignatura: found.asignatura,
                            categoria: found.categoria || 'Basal',
                            descripcion: found.descripcion
                        });
                        continue;
                    }
                } catch(e) {}
            }
            enrichedOas.push(oaTrim);
        }

        const metRaw = (r['metodologias'] || r['Metodologias'] || r['DUA'] || r['dua'] || r['Estrategias'] || '').toString().trim();
        const metArr = metRaw ? metRaw.split(/[,;\n]/).map(s => s.trim()).filter(Boolean) : [];

        await crearHito({
            anio: anioNum,
            titulo,
            tipo,
            icono,
            color,
            fecha_inicio: fInicio,
            fecha_fin: fFin,
            todas_asignaturas: todasAsigs,
            asignaturas: asignaturasArr,
            todos_cursos: todosCursos,
            cursos: cursosArr,
            cursos_excluidos: excluidosArr,
            lineamientos,
            oas_sugeridos: enrichedOas,
            metodologias_sugeridas: metArr
        }, usuario);
        creados++;
    }

    return { success: true, importados: creados, mensaje: `Se importaron ${creados} hitos institucionales exitosamente.` };
}

function generarPlantillaPlanificacionesExcel(anio = 2026) {
    const ejemplo = [
        {
            curso: '4° BASICO A',
            asignatura: 'LENGUAJE Y COMUNICACION',
            titulo: 'Plan Anual de Lenguaje y Comunicación 2026',
            docente_responsable: 'Docente Ejemplo',
            horas_anuales: 152,
            metas_anuales: 'Promover el gusto por la lectura comprensiva y el desarrollo de habilidades comunicativas orales y escritas.'
        },
        {
            curso: '4° BASICO B',
            asignatura: 'MATEMATICA',
            titulo: 'Planificación Curricular Matemática 2026',
            docente_responsable: 'Docente Ejemplo',
            horas_anuales: 152,
            metas_anuales: 'Consolidar el pensamiento lógico-matemático, cálculo mental y resolución de problemas contextualizados.'
        }
    ];

    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(ejemplo);
    ws['!cols'] = [
        { wch: 18 }, { wch: 30 }, { wch: 40 }, { wch: 25 }, { wch: 14 }, { wch: 50 }
    ];
    xlsx.utils.book_append_sheet(wb, ws, "Planificaciones");
    return xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

async function importarPlanificacionesMasivasExcel(buffer, anio, usuario = {}) {
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(firstSheet);
    if (!rows || rows.length === 0) throw new Error("La planilla no contiene filas de datos.");

    const anioNum = parseInt(anio) || 2026;
    let creadas = 0;
    let actualizadas = 0;

    for (const r of rows) {
        const curso = (r['curso'] || r['Curso'] || '').toString().trim().toUpperCase();
        const asignatura = (r['asignatura'] || r['Asignatura'] || '').toString().trim().toUpperCase();
        if (!curso || !asignatura) continue;

        const titulo = (r['titulo'] || r['Titulo'] || `Planificación ${asignatura} - ${curso}`).toString().trim();
        const docente = (r['docente_responsable'] || r['Docente'] || usuario.nombre || 'Docente').toString().trim();
        const horas = parseInt(r['horas_anuales'] || r['Horas']) || 152;
        const metas = (r['metas_anuales'] || r['Metas'] || '').toString().trim();

        const planExistente = await queryGet(`
            SELECT id FROM planificaciones WHERE anio = ? AND curso = ? AND asignatura = ?
        `, [anioNum, curso, asignatura]);

        if (planExistente) {
            await queryRun(`
                UPDATE planificaciones SET
                    titulo = ?,
                    docente_responsable = ?,
                    horas_anuales = ?,
                    metas_anuales = ?,
                    actualizado_en = CURRENT_TIMESTAMP
                WHERE id = ?
            `, [titulo, docente, horas, metas, planExistente.id]);
            actualizadas++;
        } else {
            const nivel = inferirNivelDesdeCurso(curso);
            const planCurr = await queryGet(`
                SELECT id FROM curriculo_planes WHERE anio = ? AND nivel = ? AND asignatura = ?
            `, [anioNum, nivel, asignatura]);

            await queryRun(`
                INSERT INTO planificaciones (
                    anio, curso, asignatura, titulo, docente_responsable,
                    horas_anuales, metas_anuales, plan_curricular_id, creado_por
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                anioNum, curso, asignatura, titulo, docente,
                horas, metas, planCurr ? planCurr.id : null, usuario.email || 'sistema'
            ]);
            creadas++;
        }
    }

    auditoria.registrarAuditoria({
        usuario,
        modulo: 'PLANIFICACIONES',
        accion: 'Importación Masiva Planificaciones',
        descripcion: `Importó planificaciones masivas para el año ${anioNum}: ${creadas} creadas, ${actualizadas} actualizadas`,
        detalles: { anio: anioNum, creadas, actualizadas },
        nivel: 'success'
    });

    return { success: true, creadas, actualizadas, mensaje: `Proceso completado: ${creadas} planificaciones creadas y ${actualizadas} actualizadas.` };
}

async function generarPlantillaUnidadesExcel(planId) {
    const plan = planId ? await obtenerPlanificacionDetalle(planId) : null;
    
    // Hoja 1: Unidades
    let unidadesDatos = [];
    if (plan && plan.unidades && plan.unidades.length > 0) {
        unidadesDatos = plan.unidades.map(u => ({
            numero_unidad: u.numero_unidad,
            nombre_unidad: u.nombre_unidad,
            semestre: u.semestre || 1,
            fecha_inicio: u.fecha_inicio || '',
            fecha_fin: u.fecha_fin || '',
            horas_estimadas: u.horas_estimadas || 38,
            oas_codigos: (u.oas_seleccionados || []).join(', '),
            habilidades: u.habilidades || '',
            tags_dua: (u.tags || []).join(', ')
        }));
    } else {
        unidadesDatos = [
            {
                numero_unidad: 1,
                nombre_unidad: 'Unidad 1: Descubriendo el mundo de la lectura',
                semestre: 1,
                fecha_inicio: '2026-03-02',
                fecha_fin: '2026-04-17',
                horas_estimadas: 38,
                oas_codigos: 'OA 01, OA 03, OA 06',
                habilidades: 'Comprensión lectora, extracción de información explícita e implícita',
                tags_dua: 'DUA I: Representación, ABP (Proyectos)'
            },
            {
                numero_unidad: 2,
                nombre_unidad: 'Unidad 2: Expresión oral y textos dramáticos',
                semestre: 1,
                fecha_inicio: '2026-04-20',
                fecha_fin: '2026-06-05',
                horas_estimadas: 38,
                oas_codigos: 'OA 04, OA 08',
                habilidades: 'Dramatización, lectura fluida',
                tags_dua: 'DUA II: Acción y Expresión, Aprendizaje Colaborativo'
            }
        ];
    }

    // Hoja 2: Semanas
    let semanasDatos = [];
    if (plan && plan.unidades && plan.unidades.length > 0) {
        plan.unidades.forEach(u => {
            (u.desglose_semanal || []).forEach(s => {
                const oasSemStr = Array.isArray(s.oas_semana) && s.oas_semana.length > 0
                    ? s.oas_semana.map(x => typeof x === 'object' ? x.codigo : String(x)).join(', ')
                    : (s.actividades_formativas || '');
                semanasDatos.push({
                    numero_unidad: u.numero_unidad,
                    semana: s.semana || 1,
                    fecha_inicio: s.fecha_inicio || '',
                    fecha_fin: s.fecha_fin || '',
                    tema: s.tema || '',
                    oas_a_desarrollar: oasSemStr,
                    recursos: s.recursos || '',
                    tags_metodologias: (s.tags || []).join(', ')
                });
            });
        });
    }
    if (semanasDatos.length === 0) {
        semanasDatos = [
            {
                numero_unidad: 1,
                semana: 1,
                fecha_inicio: '2026-03-02',
                fecha_fin: '2026-03-06',
                tema: 'Diagnóstico y activación de conocimientos previos',
                oas_a_desarrollar: 'OA 01, OA 03',
                recursos: 'Texto del estudiante, guía diagnóstica',
                tags_metodologias: 'Formativa, Ticket de Salida'
            },
            {
                numero_unidad: 1,
                semana: 2,
                fecha_inicio: '2026-03-09',
                fecha_fin: '2026-03-13',
                tema: 'Estrategias de comprensión: ideas principales',
                oas_a_desarrollar: 'OA 03, OA 06',
                recursos: 'Cuentos breves, pizarra interactiva',
                tags_metodologias: 'DUA I: Representación, Aprendizaje Colaborativo'
            }
        ];
    }

    const wb = xlsx.utils.book_new();
    const wsU = xlsx.utils.json_to_sheet(unidadesDatos);
    wsU['!cols'] = [{ wch: 15 }, { wch: 40 }, { wch: 10 }, { wch: 14 }, { wch: 14 }, { wch: 15 }, { wch: 25 }, { wch: 40 }, { wch: 30 }];
    xlsx.utils.book_append_sheet(wb, wsU, "Unidades");

    const wsS = xlsx.utils.json_to_sheet(semanasDatos);
    wsS['!cols'] = [{ wch: 15 }, { wch: 10 }, { wch: 14 }, { wch: 14 }, { wch: 35 }, { wch: 50 }, { wch: 30 }, { wch: 30 }];
    xlsx.utils.book_append_sheet(wb, wsS, "Semanas");

    return xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

async function importarUnidadesSemanasExcel(planId, buffer, usuario = {}) {
    const plan = await queryGet(`SELECT * FROM planificaciones WHERE id = ?`, [planId]);
    if (!plan) throw new Error("Planificación no encontrada.");

    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetNames = workbook.SheetNames;
    if (!sheetNames || sheetNames.length === 0) throw new Error("Archivo Excel inválido o vacío.");

    // Hoja 1: Unidades
    const wsU = workbook.Sheets["Unidades"] || workbook.Sheets[sheetNames[0]];
    const unidadesRows = xlsx.utils.sheet_to_json(wsU);
    if (!unidadesRows || unidadesRows.length === 0) throw new Error("No se encontraron registros en la hoja de Unidades.");

    // Hoja 2: Semanas
    let semanasRows = [];
    if (workbook.Sheets["Semanas"]) {
        semanasRows = xlsx.utils.sheet_to_json(workbook.Sheets["Semanas"]);
    } else if (sheetNames.length > 1) {
        semanasRows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetNames[1]]);
    }

    const mapaSemanasPorUnidad = {};
    for (const sr of semanasRows) {
        const uNum = parseInt(sr['numero_unidad'] || sr['Unidad'] || 1);
        if (!mapaSemanasPorUnidad[uNum]) mapaSemanasPorUnidad[uNum] = [];
        
        const tagsRaw = (sr['tags_metodologias'] || sr['tags'] || sr['DUA'] || '').toString().trim();
        const tagsArr = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [];

        const oasSemRaw = (sr['oas_a_desarrollar'] || sr['OAs a desarrollar'] || sr['oas_semana'] || sr['OAs'] || '').toString().trim();
        const oasSemArr = oasSemRaw ? oasSemRaw.split(',').map(o => o.trim()).filter(Boolean) : [];
        const actLegacy = (sr['actividades'] || sr['Actividades'] || oasSemRaw || '').toString().trim();

        mapaSemanasPorUnidad[uNum].push({
            semana: parseInt(sr['semana'] || sr['Semana']) || (mapaSemanasPorUnidad[uNum].length + 1),
            fecha_inicio: (sr['fecha_inicio'] || sr['Fecha Inicio'] || '').toString().trim(),
            fecha_fin: (sr['fecha_fin'] || sr['Fecha Fin'] || '').toString().trim(),
            tema: (sr['tema'] || sr['Tema'] || sr['Contenido'] || '').toString().trim(),
            oas_semana: oasSemArr,
            actividades_formativas: actLegacy,
            recursos: (sr['recursos'] || sr['Recursos'] || '').toString().trim(),
            tags: tagsArr,
            dividir_clases: false,
            clases: []
        });
    }

    // Limpiar unidades anteriores de esta planificación
    await queryRun(`DELETE FROM planificaciones_unidades WHERE planificacion_id = ?`, [planId]);

    let unidadesCreadas = 0;
    for (const ur of unidadesRows) {
        const numU = parseInt(ur['numero_unidad'] || ur['Unidad'] || (unidadesCreadas + 1));
        const nombreU = (ur['nombre_unidad'] || ur['Nombre'] || `Unidad ${numU}`).toString().trim();
        const semestre = parseInt(ur['semestre'] || ur['Semestre']) || (numU > 2 ? 2 : 1);
        const fInicio = (ur['fecha_inicio'] || ur['Fecha Inicio'] || '').toString().trim();
        const fFin = (ur['fecha_fin'] || ur['Fecha Fin'] || '').toString().trim();
        const horas = parseInt(ur['horas_estimadas'] || ur['Horas']) || 38;

        const oasRaw = (ur['oas_codigos'] || ur['OAs'] || '').toString().trim();
        const oasArr = oasRaw ? oasRaw.split(',').map(o => o.trim()).filter(Boolean) : [];

        const habs = (ur['habilidades'] || ur['Habilidades'] || '').toString().trim();
        const tagsRaw = (ur['tags_dua'] || ur['tags'] || ur['DUA'] || '').toString().trim();
        const tagsArr = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [];

        const semanasDeEstaUnidad = mapaSemanasPorUnidad[numU] || [];

        await queryRun(`
            INSERT INTO planificaciones_unidades (
                planificacion_id, numero_unidad, nombre_unidad, semestre,
                fecha_inicio, fecha_fin, horas_estimadas, oas_seleccionados,
                habilidades, desglose_semanal, orden
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            planId, numU, nombreU, semestre,
            fInicio, fFin, horas, JSON.stringify(oasArr),
            habs, JSON.stringify(semanasDeEstaUnidad), numU
        ]);
        unidadesCreadas++;
    }

    await queryRun(`UPDATE planificaciones SET actualizado_en = CURRENT_TIMESTAMP WHERE id = ?`, [planId]);

    auditoria.registrarAuditoria({
        usuario,
        modulo: 'PLANIFICACIONES',
        accion: 'Importar Unidades y Semanas',
        descripcion: `Importó ${unidadesCreadas} unidades desde Excel para ${plan.curso} - ${plan.asignatura}`,
        detalles: { plan_id: planId, unidades_creadas: unidadesCreadas },
        nivel: 'info'
    });

    return { success: true, unidades_creadas: unidadesCreadas, mensaje: `Se importaron ${unidadesCreadas} unidades y sus semanas exitosamente.` };
}

function generarPlantillaCurriculoExcel() {
    const ejemplo = [
        {
            Nivel: '6° BASICO',
            Asignatura: 'HISTORIA, GEOGRAFIA Y CIENCIAS SOCIALES',
            Unidad: 1,
            Nombre_Unidad: 'Unidad 1: Constitución y organización política de Chile',
            Eje: 'Formación Ciudadana',
            Codigo_OA: 'OA 15',
            Descripcion_OA: 'Explicar algunos elementos fundamentales de la organización democrática de Chile, incluyendo la división de poderes del Estado.',
            Basal_Complementario: 'Basal',
            Indicadores: 'Distinguen los poderes del Estado | Reconocen autoridades elegidas democráticamente',
            Tipo_Plan: 'MINEDUC',
            Suplantar_MINEDUC: 'NO',
            Habilidades: 'Pensamiento temporal y espacial, análisis de fuentes y pensamiento crítico'
        },
        {
            Nivel: '4° BASICO',
            Asignatura: 'INGLES INSTITUCIONAL',
            Unidad: 1,
            Nombre_Unidad: 'Unit 1: Communication and Daily Life',
            Eje: 'Comprensión Oral y Escrita',
            Codigo_OA: 'OA 01',
            Descripcion_OA: 'Demostrar comprensión de textos orales y escritos propios del programa institucional.',
            Basal_Complementario: 'Basal',
            Indicadores: 'Identifican vocabulario clave | Siguen instrucciones en inglés',
            Tipo_Plan: 'PROPIO',
            Suplantar_MINEDUC: 'SI',
            Habilidades: 'Comprensión auditiva, expresión oral y escrita'
        }
    ];

    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(ejemplo);
    ws['!cols'] = [
        { wch: 15 }, { wch: 38 }, { wch: 10 }, { wch: 45 }, { wch: 28 }, { wch: 14 },
        { wch: 60 }, { wch: 20 }, { wch: 45 }, { wch: 14 }, { wch: 18 }, { wch: 38 }
    ];
    xlsx.utils.book_append_sheet(wb, ws, "Curriculo");
    return xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

// -------------------------------------------------------------
// 12. Clases Planificadas del Docente para el Día (Libro Digital)
// -------------------------------------------------------------
const HORARIOS_BLOQUES_OFICIALES = {
    1: { inicio: '08:00', fin: '08:45', duracion: 45 },
    2: { inicio: '08:45', fin: '09:30', duracion: 45 },
    3: { inicio: '09:45', fin: '10:30', duracion: 45 },
    4: { inicio: '10:30', fin: '11:15', duracion: 45 },
    5: { inicio: '11:30', fin: '12:15', duracion: 45 },
    6: { inicio: '12:15', fin: '13:00', duracion: 45 },
    7: { inicio: '13:45', fin: '14:30', duracion: 45 },
    8: { inicio: '14:30', fin: '15:15', duracion: 45 },
    9: { inicio: '15:30', fin: '16:15', duracion: 45 },
    10: { inicio: '16:15', fin: '17:00', duracion: 45 }
};

async function obtenerClasesPlanificadasDocente(usuario = {}, fechaStr, anio = 2026) {
    let fechaObj;
    if (fechaStr && /^\d{4}-\d{2}-\d{2}$/.test(fechaStr)) {
        fechaObj = new Date(`${fechaStr}T12:00:00`);
    } else {
        fechaObj = new Date();
    }

    const pad = (n) => String(n).padStart(2, '0');
    const anioNum = fechaObj.getFullYear() || parseInt(anio, 10) || 2026;
    const mesNum = fechaObj.getMonth() + 1;
    const diaMes = fechaObj.getDate();
    const fechaIso = `${anioNum}-${pad(mesNum)}-${pad(diaMes)}`;

    // Fechas anterior y siguiente para navegación rápida
    const dAnt = new Date(fechaObj);
    dAnt.setDate(dAnt.getDate() - 1);
    const fechaAnterior = `${dAnt.getFullYear()}-${pad(dAnt.getMonth() + 1)}-${pad(dAnt.getDate())}`;

    const dSig = new Date(fechaObj);
    dSig.setDate(dSig.getDate() + 1);
    const fechaSiguiente = `${dSig.getFullYear()}-${pad(dSig.getMonth() + 1)}-${pad(dSig.getDate())}`;

    const diasSemanaNombres = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const diaSemana = diasSemanaNombres[fechaObj.getDay()];

    const userEmail = (usuario.email || '').trim().toLowerCase();
    const userNombre = (usuario.nombre || '').trim();

    // Buscar en horarios
    let bloquesDocente = await queryAll(`
        SELECT curso, asignatura, bloque, dia, profesor
        FROM horarios
        WHERE (anno = ? OR (anno IS NULL AND ? = 2026))
          AND (
            LOWER(profesor) LIKE '%' || LOWER(?) || '%' 
            OR LOWER(?) LIKE '%' || LOWER(profesor) || '%'
            OR LOWER(profesor) LIKE '%' || LOWER(?) || '%'
            OR LOWER(?) LIKE '%' || LOWER(profesor) || '%'
          )
          AND (
            LOWER(dia) = LOWER(?)
            OR (LOWER(?) = 'miercoles' AND LOWER(dia) = 'miércoles')
            OR (LOWER(?) = 'miércoles' AND LOWER(dia) = 'miercoles')
            OR (LOWER(?) = 'sabado' AND LOWER(dia) = 'sábado')
            OR (LOWER(?) = 'sábado' AND LOWER(dia) = 'sabado')
          )
        ORDER BY bloque ASC
    `, [
        anioNum, anioNum,
        userNombre || userEmail, userNombre || userEmail,
        userEmail || userNombre, userEmail || userNombre,
        diaSemana, diaSemana, diaSemana, diaSemana, diaSemana
    ]);

    // Si el usuario es admin o dev y no tiene bloques asignados a su nombre exacto en ese día,
    // buscamos los primeros bloques del día para visualización pedagógica
    if (bloquesDocente.length === 0 && (usuario.rol === 'Administrador' || usuario.esAdminBase)) {
        bloquesDocente = await queryAll(`
            SELECT curso, asignatura, bloque, dia, profesor
            FROM horarios
            WHERE (anno = ? OR (anno IS NULL AND ? = 2026))
              AND (
                LOWER(dia) = LOWER(?)
                OR (LOWER(?) = 'miercoles' AND LOWER(dia) = 'miércoles')
                OR (LOWER(?) = 'miércoles' AND LOWER(dia) = 'miercoles')
              )
            ORDER BY bloque ASC
            LIMIT 6
        `, [anioNum, anioNum, diaSemana, diaSemana, diaSemana]);
    }

    // Agrupar bloques contiguos de la misma asignatura y curso (ej: bloques 1 y 2 -> 90 min)
    const clasesAgrupadas = [];
    const porCursoAsig = {};
    bloquesDocente.forEach(b => {
        const k = `${b.curso}___${b.asignatura}`;
        if (!porCursoAsig[k]) porCursoAsig[k] = [];
        porCursoAsig[k].push(b);
    });

    Object.keys(porCursoAsig).forEach(k => {
        const items = porCursoAsig[k].sort((a, b) => a.bloque - b.bloque);
        let i = 0;
        while (i < items.length) {
            const bActual = items[i];
            const numB1 = parseInt(bActual.bloque, 10);
            if (i + 1 < items.length && parseInt(items[i + 1].bloque, 10) === numB1 + 1) {
                // Clase doble de 90 min
                const numB2 = parseInt(items[i + 1].bloque, 10);
                const info1 = HORARIOS_BLOQUES_OFICIALES[numB1] || { inicio: '08:00', fin: '08:45' };
                const info2 = HORARIOS_BLOQUES_OFICIALES[numB2] || { inicio: '08:45', fin: '09:30' };
                clasesAgrupadas.push({
                    curso: bActual.curso,
                    asignatura: bActual.asignatura,
                    profesor: bActual.profesor,
                    bloques: [numB1, numB2],
                    bloquesTexto: `Bloques ${numB1} y ${numB2}`,
                    horaInicio: info1.inicio,
                    horaFin: info2.fin,
                    horarioTexto: `${info1.inicio} - ${info2.fin}`,
                    duracionMinutos: 90
                });
                i += 2;
            } else {
                // Clase individual de 45 min
                const info = HORARIOS_BLOQUES_OFICIALES[numB1] || { inicio: '08:00', fin: '08:45' };
                clasesAgrupadas.push({
                    curso: bActual.curso,
                    asignatura: bActual.asignatura,
                    profesor: bActual.profesor,
                    bloques: [numB1],
                    bloquesTexto: `Bloque ${numB1}`,
                    horaInicio: info.inicio,
                    horaFin: info.fin,
                    horarioTexto: `${info.inicio} - ${info.fin}`,
                    duracionMinutos: 45
                });
                i += 1;
            }
        }
    });

    // Ordenar cronológicamente por hora de inicio
    clasesAgrupadas.sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));

    // Obtener todas las planificaciones para este año escolar
    const planesDocente = await queryAll(`
        SELECT p.id, p.titulo, p.curso, p.asignatura, p.anio, p.horas_anuales, p.metas_anuales,
               p.docente_responsable, p.docentes_colaboradores, cp.unidades_oficiales as cp_unidades
        FROM planificaciones p
        LEFT JOIN curriculo_planes cp ON cp.id = p.plan_curricular_id
        WHERE (p.anio = ? OR p.anio = 2026)
    `, [anioNum]);

    // Para cada clase del horario, encontrar la planificación y la sesión correspondiente a la fecha
    const clasesConPlan = [];

    for (let idx = 0; idx < clasesAgrupadas.length; idx++) {
        const c = clasesAgrupadas[idx];
        const nivelC = inferirNivelDesdeCurso(c.curso);

        // Buscar plan correspondiente priorizando coincidencia de docente
        let planMatch = planesDocente.find(p => 
            (p.docente_responsable && (
                p.docente_responsable.toLowerCase().includes(userEmail) ||
                (userNombre && p.docente_responsable.toLowerCase().includes(userNombre.toLowerCase()))
            ) || (p.docentes_colaboradores && (
                p.docentes_colaboradores.toLowerCase().includes(userEmail) ||
                (userNombre && p.docentes_colaboradores.toLowerCase().includes(userNombre.toLowerCase()))
            ))) &&
            matchNivelCurricular(inferirNivelDesdeCurso(p.curso), nivelC) &&
            matchAsignaturaCurricular(p.asignatura, c.asignatura, nivelC)
        );

        // Fallback: Si no coincide por docente, buscar el plan activo del colegio para ese curso y asignatura
        if (!planMatch) {
            planMatch = planesDocente.find(p => 
                matchNivelCurricular(inferirNivelDesdeCurso(p.curso), nivelC) &&
                matchAsignaturaCurricular(p.asignatura, c.asignatura, nivelC)
            );
        }

        let planData = null;

        if (planMatch) {
            // Cargar unidades del plan
            const unidades = await queryAll(`
                SELECT * FROM planificaciones_unidades 
                WHERE planificacion_id = ? 
                ORDER BY numero_unidad ASC, orden ASC
            `, [planMatch.id]);

            unidades.forEach(u => {
                try { u.oas_seleccionados = JSON.parse(u.oas_seleccionados || '[]'); } catch(e) { u.oas_seleccionados = []; }
                try { u.desglose_semanal = JSON.parse(u.desglose_semanal || '[]'); } catch(e) { u.desglose_semanal = []; }
                try { u.habilidades = JSON.parse(u.habilidades || '[]'); } catch(e) { u.habilidades = []; }
                try { u.actitudes = JSON.parse(u.actitudes || '[]'); } catch(e) { u.actitudes = []; }
            });

            // 1. Identificar Unidad correspondiente a la fecha
            let unidadActiva = unidades.find(u => u.fecha_inicio && u.fecha_fin && u.fecha_inicio <= fechaIso && fechaIso <= u.fecha_fin);
            if (!unidadActiva && unidades.length > 0) {
                // Verificar si alguna unidad tiene semanas cuyas fechas coincidan con fechaIso
                unidadActiva = unidades.find(u => 
                    Array.isArray(u.desglose_semanal) && u.desglose_semanal.some(s => s.fecha_inicio && s.fecha_fin && s.fecha_inicio <= fechaIso && fechaIso <= s.fecha_fin)
                );
            }
            if (!unidadActiva && unidades.length > 0) {
                const esSegundoSem = (mesNum >= 7);
                const unidadesSemestre = unidades.filter(u => esSegundoSem ? u.semestre == 2 : u.semestre == 1);
                const tieneContenido = u => Array.isArray(u.desglose_semanal) && u.desglose_semanal.some(s => (s.actividades && s.actividades.trim()) || (s.clases && s.clases.length > 0) || (s.oas_semana && s.oas_semana.length > 0));
                unidadActiva = unidadesSemestre.find(tieneContenido) ||
                               unidades.find(tieneContenido) ||
                               unidadesSemestre[0] ||
                               unidades[0];
            }

            // 2. Identificar Semana lectiva correspondiente
            let semanaActiva = null;
            let semanaNum = 1;
            let semanaRango = '';
            let clasesSemana = [];

            if (unidadActiva && Array.isArray(unidadActiva.desglose_semanal) && unidadActiva.desglose_semanal.length > 0) {
                // Primero buscar por coincidencia de rango de fechas
                const sMatch = unidadActiva.desglose_semanal.find(s => 
                    s.fecha_inicio && s.fecha_fin && s.fecha_inicio <= fechaIso && fechaIso <= s.fecha_fin
                );
                // Si no coincide por fecha exacta, buscar la primera semana que tenga actividades registradas, o la primera semana
                const tieneContenidoSem = s => (s.actividades && s.actividades.trim()) || 
                                               (s.clases && s.clases.some(c => c.actividades && c.actividades.trim()));
                semanaActiva = sMatch || 
                               unidadActiva.desglose_semanal.find(tieneContenidoSem) ||
                               unidadActiva.desglose_semanal[0];
                semanaNum = semanaActiva.semana || 1;
                semanaRango = (semanaActiva.fecha_inicio && semanaActiva.fecha_fin) 
                    ? `${semanaActiva.fecha_inicio} al ${semanaActiva.fecha_fin}` 
                    : '';
                clasesSemana = Array.isArray(semanaActiva.clases) ? semanaActiva.clases : [];
            }

            // 3. Determinar el orden de sesión de esta clase en la semana (para correlativo con clasesSemana)
            let sesionIndexSemana = 0;
            try {
                const bloquesSemana = await queryAll(`
                    SELECT dia, bloque FROM horarios
                    WHERE (anno = ? OR (anno IS NULL AND ? = 2026))
                      AND curso = ?
                      AND asignatura = ?
                    ORDER BY 
                      CASE LOWER(dia)
                        WHEN 'lunes' THEN 1
                        WHEN 'martes' THEN 2
                        WHEN 'miercoles' THEN 3
                        WHEN 'miércoles' THEN 3
                        WHEN 'jueves' THEN 4
                        WHEN 'viernes' THEN 5
                        WHEN 'sabado' THEN 6
                        WHEN 'sábado' THEN 6
                        ELSE 7
                      END,
                      bloque ASC
                `, [anioNum, anioNum, c.curso, c.asignatura]);

                const sesionesSemana = [];
                let sIdx = 0;
                while (sIdx < bloquesSemana.length) {
                    const bCur = bloquesSemana[sIdx];
                    const numB = parseInt(bCur.bloque, 10);
                    if (sIdx + 1 < bloquesSemana.length && 
                        bloquesSemana[sIdx + 1].dia === bCur.dia && 
                        parseInt(bloquesSemana[sIdx + 1].bloque, 10) === numB + 1) {
                        sesionesSemana.push({ dia: bCur.dia, bloqueInicio: numB });
                        sIdx += 2;
                    } else {
                        sesionesSemana.push({ dia: bCur.dia, bloqueInicio: numB });
                        sIdx += 1;
                    }
                }

                const diaNorm = (diaSemana || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                const bInicioClase = c.bloques && c.bloques.length > 0 ? c.bloques[0] : 1;
                const matchPos = sesionesSemana.findIndex(ses => {
                    const sDiaNorm = (ses.dia || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                    return sDiaNorm === diaNorm && ses.bloqueInicio === bInicioClase;
                });
                if (matchPos >= 0) {
                    sesionIndexSemana = matchPos;
                }
            } catch (errHor) {
                // Silencioso
            }

            // 4. Identificar Sesión específica de la semana (por día, label o correlativo calculado)
            let sesionActiva = null;
            if (clasesSemana.length > 0) {
                const diaNorm = (diaSemana || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                sesionActiva = clasesSemana.find(cs => {
                    const cDia = (cs.dia || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                    const cLab = (cs.label || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                    return (cDia && cDia.includes(diaNorm)) || (cLab && cLab.includes(diaNorm));
                });
                if (!sesionActiva) {
                    sesionActiva = clasesSemana.find(cs => cs.numero === (sesionIndexSemana + 1)) ||
                                   clasesSemana[sesionIndexSemana] ||
                                   clasesSemana[0];
                }
            }

            // 5. Extraer OAs específicos asignados a esta clase / semana (NUNCA VOLCAR LA UNIDAD COMPLETA)
            const oasCodigosClase = [];
            const agregarCodOa = (cod) => {
                if (!cod) return;
                const cLimpio = String(cod).trim().toUpperCase();
                if (cLimpio && !oasCodigosClase.includes(cLimpio)) {
                    oasCodigosClase.push(cLimpio);
                }
            };

            // 5a. Prioridad 1: OAs asignados directamente a la sesión (oas_tags, oas_seleccionados, oas)
            if (sesionActiva) {
                const oasSesion = Array.isArray(sesionActiva.oas_tags) ? sesionActiva.oas_tags :
                                  (Array.isArray(sesionActiva.oas_seleccionados) ? sesionActiva.oas_seleccionados :
                                  (Array.isArray(sesionActiva.oas) ? sesionActiva.oas : []));
                oasSesion.forEach(o => agregarCodOa(typeof o === 'object' ? o.codigo : o));

                // 5b. Prioridad 2: Extraer códigos [OA XX] desde los indicadores asociados a esta sesión
                if (Array.isArray(sesionActiva.indicadores_tags)) {
                    sesionActiva.indicadores_tags.forEach(ind => {
                        const m = String(ind).match(/\[(OA\s*\d+)\]/i);
                        if (m) agregarCodOa(m[1]);
                    });
                }
            }

            // 5c. Prioridad 3: Si la sesión no especificó OAs propios, heredar los de la semana (oas_semana / actividades_formativas)
            if (oasCodigosClase.length === 0 && semanaActiva) {
                const oasSem = Array.isArray(semanaActiva.oas_semana) ? semanaActiva.oas_semana :
                               (Array.isArray(semanaActiva.oas_seleccionados) ? semanaActiva.oas_seleccionados :
                               (Array.isArray(semanaActiva.oas) ? semanaActiva.oas : []));
                oasSem.forEach(o => agregarCodOa(typeof o === 'object' ? o.codigo : o));

                if (oasCodigosClase.length === 0 && semanaActiva.actividades_formativas) {
                    const matchesOa = String(semanaActiva.actividades_formativas).match(/OA\s*\d+/gi);
                    if (matchesOa) {
                        matchesOa.forEach(m => agregarCodOa(m));
                    }
                }
            }

            // 5d. Mapear códigos encontrados a sus metadatos (descripcion, categoria) de la unidad
            const oasUnidad = Array.isArray(unidadActiva?.oas_seleccionados) ? unidadActiva.oas_seleccionados : [];
            const oasFinales = oasCodigosClase.map(cod => {
                const found = oasUnidad.find(ou => {
                    const c = (typeof ou === 'object' ? ou.codigo : String(ou)).trim().toUpperCase();
                    return c === cod;
                });
                if (found && typeof found === 'object') {
                    return { codigo: cod, descripcion: found.descripcion || '', categoria: found.categoria || 'Basal' };
                }
                return { codigo: cod, descripcion: '', categoria: 'Basal' };
            });

            // 6. Habilidades e Indicadores
            const habs = sesionActiva && Array.isArray(sesionActiva.habilidades_tags) && sesionActiva.habilidades_tags.length > 0
                ? sesionActiva.habilidades_tags.map(h => typeof h === 'object' ? h.label : String(h))
                : [];

            const inds = sesionActiva && Array.isArray(sesionActiva.indicadores_tags) && sesionActiva.indicadores_tags.length > 0
                ? sesionActiva.indicadores_tags
                : [];

            // 7. Actividades de la clase registradas (NUNCA VOLCAR DESCRIPCIONES DE OA)
            let actividades = '';
            if (sesionActiva && sesionActiva.actividades && sesionActiva.actividades.trim()) {
                actividades = sesionActiva.actividades.trim();
            } else if (sesionActiva && sesionActiva.descripcion && sesionActiva.descripcion.trim()) {
                actividades = sesionActiva.descripcion.trim();
            } else if (semanaActiva) {
                if (semanaActiva.actividades && semanaActiva.actividades.trim()) {
                    actividades = semanaActiva.actividades.trim();
                } else if (semanaActiva.descripcion && semanaActiva.descripcion.trim()) {
                    actividades = semanaActiva.descripcion.trim();
                } else if (semanaActiva.tema && semanaActiva.tema.trim()) {
                    const temaTrim = semanaActiva.tema.trim();
                    // Si el tema contiene código o descripción de OA (ej: "OA 04: Practicar..."), NO es una actividad de clase
                    const esSoloOA = /^OA\s*\d+\s*[:\-]/i.test(temaTrim) || 
                                     /^Desarrollo de OA\s*\d+/i.test(temaTrim) ||
                                     oasUnidad.some(ou => ou.descripcion && ou.descripcion.trim() === temaTrim);
                    if (!esSoloOA) {
                        actividades = temaTrim;
                    }
                }
            }

            // Recursos
            const recursos = (sesionActiva && sesionActiva.recursos && sesionActiva.recursos.trim()) 
                ? sesionActiva.recursos.trim() 
                : ((semanaActiva && semanaActiva.recursos && semanaActiva.recursos.trim()) ? semanaActiva.recursos.trim() : '');

            // DUA: Extraer tanto de adecuaciones escritas como de tags metodológicos DUA
            const tagsDua = (semanaActiva && Array.isArray(semanaActiva.tags) && semanaActiva.tags.length > 0)
                ? semanaActiva.tags.join(', ')
                : '';
            const duaTexto = (sesionActiva && sesionActiva.dua && sesionActiva.dua.trim())
                ? sesionActiva.dua.trim()
                : ((semanaActiva && semanaActiva.dua_adecuaciones && semanaActiva.dua_adecuaciones.trim()) ? semanaActiva.dua_adecuaciones.trim() : '');

            const duaPartes = [];
            if (duaTexto) duaPartes.push(duaTexto);
            if (tagsDua && !duaTexto.includes(tagsDua)) {
                duaPartes.push(duaTexto ? `Metodologías DUA: ${tagsDua}` : tagsDua);
            }
            const dua = duaPartes.join(' - ');

            // Limpiar viñetas en habilidades e indicadores
            const habsLimpias = habs.map(h => String(h).replace(/^[•\-\*]\s*/, '').trim()).filter(Boolean);
            const indsLimpios = inds.map(i => String(i).replace(/^[•\-\*]\s*/, '').trim()).filter(Boolean);

            // 8. Formateo exacto solicitado para el Libro Digital
            const oaCodigosStr = oasFinales.map(o => o.codigo).filter(Boolean).join(', ');
            const textoOasLibro = oaCodigosStr ? `OAs de la Sesión [${oaCodigosStr}]` : '';
            const textoHabilidadesLibro = habsLimpias.length > 0 ? `Habilidades\n${habsLimpias.join('\n')}` : '';
            const textoIndicadoresLibro = indsLimpios.length > 0 ? `Indicadores de Evaluación\n${indsLimpios.join('\n')}` : '';
            const textoActividadesLibro = actividades ? `Actividades de la Sesión\n${actividades}` : '';
            const textoRecursosLibro = recursos ? `Recursos\n${recursos}` : '';
            const textoDuaLibro = dua ? `DUA & Adecuaciones\n${dua}` : '';

            // Bloque unificado estructurado para el Libro Digital (secciones separadas por doble salto de línea)
            const seccionesLibro = [
                textoOasLibro,
                textoHabilidadesLibro,
                textoIndicadoresLibro,
                textoActividadesLibro,
                textoRecursosLibro,
                textoDuaLibro
            ].filter(Boolean);

            const textoCompletoLibroDigital = seccionesLibro.join('\n\n');

            planData = {
                planId: planMatch.id,
                planTitulo: planMatch.titulo,
                tienePlan: true,
                unidadNumero: unidadActiva ? unidadActiva.numero_unidad : 1,
                unidadNombre: unidadActiva ? unidadActiva.nombre_unidad : 'Unidad 1',
                semanaNumero: semanaNum,
                semanaRango: semanaRango,
                sesionNumero: sesionActiva ? (sesionActiva.numero || 1) : 1,
                sesionLabel: sesionActiva ? (sesionActiva.label || `Clase ${sesionActiva.numero || 1}`) : c.bloquesTexto,
                oas: oasFinales,
                oasCodigos: oaCodigosStr,
                habilidades: habsLimpias,
                indicadores: indsLimpios,
                actividades: actividades,
                recursos: recursos,
                dua: dua,
                textoCompletoLibro: textoCompletoLibroDigital,
                textoOAs: textoOasLibro,
                textoActividades: textoActividadesLibro,
                textoHabilidades: textoHabilidadesLibro,
                textoIndicadores: textoIndicadoresLibro,
                textoRecursos: textoRecursosLibro,
                textoDUA: textoDuaLibro
            };
        } else {
            planData = {
                tienePlan: false,
                mensaje: `Sin planificación creada aún para ${c.curso} • ${c.asignatura}`,
                textoCompletoLibro: `Clase: ${c.asignatura} - ${c.curso}\nHorario: ${c.horarioTexto} (${c.bloquesTexto})`
            };
        }

        clasesConPlan.push({
            id: `clase_${idx + 1}`,
            numeroClase: idx + 1,
            curso: c.curso,
            asignatura: c.asignatura,
            profesor: c.profesor,
            bloques: c.bloques,
            bloquesTexto: c.bloquesTexto,
            horaInicio: c.horaInicio,
            horaFin: c.horaFin,
            horarioTexto: c.horarioTexto,
            duracionMinutos: c.duracionMinutos,
            plan: planData
        });
    }

    return {
        fecha: fechaIso,
        dia: diaSemana,
        fechaAnterior,
        fechaSiguiente,
        esFinDeSemana: (diaSemana === 'Sábado' || diaSemana === 'Domingo'),
        totalClases: clasesConPlan.length,
        clases: clasesConPlan
    };
}

module.exports = {
    obtenerClasesPlanificadasDocente,
    obtenerCursosDocente,
    obtenerPoolDocentes,
    obtenerSesionesClasesSemana,
    listarPlanificaciones,
    obtenerPlanificacionDetalle,
    crearPlanificacion,
    cargarUnidadesOficialesEnPlan,
    guardarPlanificacion,
    clonarPlanificacion,
    vincularCurso,
    desvincularCurso,
    promoverPlanificacionIndividual,
    crearCheckpointVersion,
    restaurarVersion,
    cambiarEstadoVisado,
    solicitarEliminacionPlan,
    cancelarSolicitudEliminacion,
    eliminarPlanificacion,
    resolverEliminacionPlan,
    cambiarPropietarioPlan,
    agregarObservacion,
    calcularCoberturaCurricular,
    obtenerDashboardCoberturaColegio,
    inferirNivelDesdeCurso,
    normalizar,
    construirUnidadesInicialesDesdeCurriculo,
    buscarPlanCurricularCoincidente,
    // Hitos y Plantillas Masivas XLS
    listarHitos,
    obtenerHitosParaPlan,
    crearHito,
    actualizarHito,
    eliminarHito,
    marcarHitoCompletadoPlan,
    generarPlantillaHitosExcel,
    importarHitosExcel,
    generarPlantillaPlanificacionesExcel,
    importarPlanificacionesMasivasExcel,
    generarPlantillaUnidadesExcel,
    importarUnidadesSemanasExcel,
    generarPlantillaCurriculoExcel
};

