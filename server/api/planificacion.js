/**
 * Router API de Planificación Curricular y Cobertura Académica
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const xlsx = require('xlsx');
const planificacion = require('../services/planificacion');
const curriculoSeed = require('../services/curriculo_seed');
const sqlite3 = require('sqlite3').verbose();

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const dbPath = path.join(__dirname, '..', 'db', 'colegio.db');
const db = new sqlite3.Database(dbPath);

// Middleware de autenticación y resolución de usuario
function authMiddleware(req, res, next) {
    if (req.isAuthenticated && req.isAuthenticated()) {
        const rolNorm = (req.user.rol || '').toLowerCase();
        req.esAdmin = rolNorm.includes('admin') || rolNorm.includes('directiv');
        req.esCoordinacion = rolNorm.includes('coordinaci');
        req.esAdminOCoordinacion = req.esAdmin || req.esCoordinacion;
        return next();
    }
    // Modo desarrollo local
    if (!process.env.GOOGLE_CLIENT_ID) {
        req.user = {
            id: 1,
            email: 'admin@colegiocerrogrande.cl',
            nombre: 'Administrador Local',
            rol: 'Administrador'
        };
        req.esAdmin = true;
        req.esCoordinacion = true;
        req.esAdminOCoordinacion = true;
        return next();
    }
    res.status(401).json({ error: 'No autenticado. Por favor inicie sesión.' });
}

router.use(authMiddleware);

// 1. Cursos y asignaciones del docente
router.get('/cursos-docente', async (req, res) => {
    try {
        const anio = req.query.anio || 2026;
        const data = await planificacion.obtenerCursosDocente(req.user.email, req.user.nombre, anio);
        res.json(data);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 1b. Pool de docentes disponibles para co-docencia y equipo
router.get('/pool-docentes', async (req, res) => {
    try {
        const docentes = await planificacion.obtenerPoolDocentes();
        res.json(docentes);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 1c. Horas sugeridas y sesiones de clases semanales según horarios
router.get('/sesiones-semana', async (req, res) => {
    try {
        const { curso, asignatura, anio } = req.query;
        const data = await planificacion.obtenerSesionesClasesSemana(curso, asignatura, anio);
        res.json(data);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 1d. Clases planificadas del docente para el día (Vista Dashboard & Libro Digital)
router.get('/mis-clases-dia', async (req, res) => {
    try {
        let usuario = req.user || (req.session && req.session.user) || {
            email: 'dev@colegio.edu',
            nombre: 'Docente',
            rol: 'Profesor'
        };
        if (req.query.docente) {
            usuario = { ...usuario, nombre: req.query.docente };
            if (req.query.email) usuario.email = req.query.email;
        }
        const fecha = req.query.fecha || '';
        const anio = req.query.anio || 2026;
        const data = await planificacion.obtenerClasesPlanificadasDocente(usuario, fecha, anio);
        res.json({ success: true, ...data });
    } catch (e) {
        console.error('Error al obtener clases del día:', e);
        res.status(500).json({ error: e.message || 'Error al obtener clases del día' });
    }
});

// 1e. Planificador semanal de clases del docente ("Planificar mis clases para esta semana")
router.get('/mi-semana-planificador', async (req, res) => {
    try {
        let usuario = req.user || (req.session && req.session.user) || {
            email: 'dev@colegio.edu',
            nombre: 'Docente',
            rol: 'Profesor'
        };
        if (req.query.docente) {
            usuario = { ...usuario, nombre: req.query.docente };
            if (req.query.email) usuario.email = req.query.email;
        }
        const fecha = req.query.fecha || '';
        const anio = req.query.anio || 2026;
        const data = await planificacion.obtenerPlanificadorSemanalDocente(usuario, fecha, anio);
        res.json({ success: true, ...data });
    } catch (e) {
        console.error('Error al obtener planificador semanal:', e);
        res.status(500).json({ error: e.message || 'Error al obtener planificador semanal' });
    }
});

// 1f. Guardar sesiones desde el planificador semanal
router.post('/mi-semana-planificador/guardar', async (req, res) => {
    try {
        const usuario = req.user || (req.session && req.session.user) || {
            email: 'dev@colegio.edu',
            nombre: 'Docente',
            rol: 'Profesor'
        };
        const resultado = await planificacion.guardarSesionPlanificadorSemanal(usuario, req.body || {});
        res.json(resultado);
    } catch (e) {
        console.error('Error al guardar sesión del planificador semanal:', e);
        res.status(400).json({ error: e.message || 'Error al guardar sesión semanal' });
    }
});

// 2. Listado de planificaciones con filtros
router.get('/', async (req, res) => {
    try {
        const planes = await planificacion.listarPlanificaciones(req.query);
        res.json(planes);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 3. Dashboard general de cobertura curricular del colegio (Exclusivo Administradores y Coordinadores)
router.get('/cobertura/colegio', async (req, res) => {
    try {
        const user = req.user || (req.session && req.session.user) || {
            rol: req.headers['x-user-role'] || (req.query.user_rol || '')
        };
        const rolNorm = (user.rol || '').toLowerCase().trim();
        const esAdminOCoord = rolNorm.includes('admin') || rolNorm.includes('directiv') || rolNorm.includes('coordinaci') || rolNorm.includes('utp');

        if (req.headers['x-user-role'] && !esAdminOCoord) {
            return res.status(403).json({ error: "Acceso denegado: El dashboard de cobertura curricular es exclusivo para Administradores y Coordinadores." });
        }

        const anio = req.query.anio || 2026;
        const data = await planificacion.obtenerDashboardCoberturaColegio(anio);
        res.json(data);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});


// 4. Catálogo de Planes Curriculares
router.get('/curriculo/planes', (req, res) => {
    const anio = parseInt(req.query.anio || req.query.anno) || 2026;
    const sql = `
        SELECT cp.*, COUNT(co.id) as cantidad_oas
        FROM curriculo_planes cp
        LEFT JOIN curriculo_objetivos co ON co.plan_id = cp.id AND co.activo = 1
        WHERE cp.anio = ? AND cp.activo = 1
        GROUP BY cp.id
        ORDER BY (CASE WHEN cp.tipo = 'PROPIO' THEN 0 ELSE 1 END) ASC, cp.nivel ASC, cp.asignatura ASC
    `;
    db.all(sql, [anio], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows || []);
    });
});

// 5. Búsqueda de Objetivos de Aprendizaje (OAs)
router.get('/curriculo/objetivos', (req, res) => {
    const { plan_id, nivel, asignatura, anio = 2026, q = '', unidad, tipo_plan, solo_mineduc } = req.query;
    let sql = `
        SELECT o.*, cp.nivel, cp.asignatura, cp.tipo as tipo_plan, cp.excluir_oas_mineduc, cp.unidades_oficiales
        FROM curriculo_objetivos o
        JOIN curriculo_planes cp ON cp.id = o.plan_id
        WHERE (cp.anio = ? OR cp.anio = 2026) AND o.activo = 1
    `;
    const params = [parseInt(anio) || 2026];

    if (plan_id) {
        sql += ` AND o.plan_id = ?`;
        params.push(plan_id);
    }
    if (tipo_plan) {
        sql += ` AND cp.tipo = ?`;
        params.push(tipo_plan);
    }
    if (nivel) {
        const nivNorm = curriculoSeed.normalizarNivel(nivel);
        sql += ` AND (cp.nivel = ? OR cp.nivel = ? OR cp.nivel LIKE ? OR cp.nivel LIKE ?)`;
        params.push(nivel, nivNorm, `%${nivel}%`, `%${nivNorm}%`);
    }
    if (asignatura) {
        const asigNorm = curriculoSeed.normalizarNombreAsignatura(asignatura);
        sql += ` AND (cp.asignatura = ? OR cp.asignatura = ? OR LOWER(cp.asignatura) LIKE '%' || LOWER(?) || '%' OR LOWER(cp.asignatura) LIKE '%' || LOWER(?) || '%')`;
        params.push(asignatura, asigNorm, asignatura, asigNorm);
    }
    if (unidad && unidad !== 'todas') {
        sql += ` AND (o.unidad_sugerida = ? OR o.unidad_sugerida LIKE ?)`;
        params.push(unidad, `%${unidad}%`);
    }
    if (q && q.trim()) {
        sql += ` AND (LOWER(o.codigo) LIKE ? OR LOWER(o.descripcion) LIKE ? OR LOWER(o.eje_unidad) LIKE ? OR LOWER(COALESCE(o.nombre_unidad_oficial, '')) LIKE ?)`;
        const qParam = `%${q.trim().toLowerCase()}%`;
        params.push(qParam, qParam, qParam, qParam);
    }

    // Si NO se pide explícitamente ver solo MINEDUC ni se filtró por un plan_id específico,
    // excluir los OAs de MINEDUC para aquellas asignaturas y niveles que tengan un Plan Propio con excluir_oas_mineduc = 1
    if (!plan_id && tipo_plan !== 'MINEDUC' && !solo_mineduc) {
        sql += `
            AND NOT (
                cp.tipo = 'MINEDUC' AND EXISTS (
                    SELECT 1 FROM curriculo_planes cp_propio
                    WHERE (cp_propio.anio = cp.anio OR cp_propio.anio = 2026)
                      AND cp_propio.tipo = 'PROPIO'
                      AND cp_propio.excluir_oas_mineduc = 1
                      AND cp_propio.activo = 1
                      AND (cp_propio.nivel = cp.nivel OR cp_propio.nivel = 'Todos los niveles' OR cp.nivel LIKE '%' || cp_propio.nivel || '%')
                      AND (
                        cp_propio.asignatura = cp.asignatura 
                        OR LOWER(cp_propio.asignatura) = LOWER(cp.asignatura)
                        OR LOWER(cp.asignatura) LIKE '%' || LOWER(cp_propio.asignatura) || '%'
                        OR LOWER(cp_propio.asignatura) LIKE '%' || LOWER(cp.asignatura) || '%'
                      )
                )
            )
        `;
    }

    sql += ` ORDER BY o.orden ASC, o.codigo ASC`;

    db.all(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const data = (rows || []).map(r => {
            let inds = [];
            try {
                inds = JSON.parse(r.indicadores_sugeridos || '[]');
            } catch (e) {
                inds = [];
            }
            return {
                ...r,
                indicadores_sugeridos: inds
            };
        });
        res.json(data);
    });
});

// 5b. Obtener habilidades y actitudes sugeridas MINEDUC
router.get('/curriculo/habilidades', (req, res) => {
    const { asignatura = '' } = req.query;
    const asigNorm = curriculoSeed.normalizarNombreAsignatura(asignatura);
    const habs = curriculoSeed.HABILIDADES_POR_ASIGNATURA[asigNorm] || curriculoSeed.HABILIDADES_POR_ASIGNATURA[asignatura] || [];
    res.json({
        asignatura: asigNorm,
        habilidades: habs,
        actitudes: curriculoSeed.ACTITUDES_GENERALES_MINEDUC
    });
});

// 6. Importar actualización de currículo vía Excel/CSV (Exclusivo UTP/Admin)
router.post('/curriculo/importar', upload.single('archivo'), async (req, res) => {
    if (!req.esAdminOCoordinacion) {
        return res.status(403).json({ error: 'Acceso denegado: Solo Coordinación o Administración pueden actualizar el currículo.' });
    }
    if (!req.file) {
        return res.status(400).json({ error: 'Debe adjuntar una planilla Excel (.xlsx) o CSV.' });
    }

    try {
        const anio = req.body.anio || 2026;
        const tipo = req.body.tipo || 'MINEDUC';
        const excluir_oas_mineduc = (req.body.excluir_oas_mineduc === '1' || req.body.excluir_oas_mineduc === 'true' || req.body.excluir_oas_mineduc === true);
        const resultado = await curriculoSeed.importarCurriculoExcel(db, req.file.buffer, anio, tipo, { excluir_oas_mineduc });
        res.json(resultado);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 7. Crear o actualizar asignatura o plan propio del colegio
router.post('/curriculo/propio', async (req, res) => {
    if (!req.esAdminOCoordinacion) {
        return res.status(403).json({ error: 'Acceso denegado.' });
    }
    const { anio = 2026, nivel, asignatura, descripcion, objetivos, excluir_oas_mineduc = 1 } = req.body;
    if (!nivel || !asignatura) {
        return res.status(400).json({ error: 'Nivel y Asignatura son obligatorios.' });
    }

    const anioNum = parseInt(anio) || 2026;
    const asigUpper = asignatura.trim().toUpperCase();
    const excluyeVal = (excluir_oas_mineduc === false || excluir_oas_mineduc === 0 || excluir_oas_mineduc === '0') ? 0 : 1;

    // Soportar creación individual o multinivel
    let nivelesArr = [];
    if (Array.isArray(nivel)) {
        nivelesArr = nivel;
    } else {
        const nNorm = nivel.toString().trim();
        if (nNorm.toLowerCase().includes('todos los niveles') || nNorm.toLowerCase() === 'todos') {
            nivelesArr = ['1° Básico', '2° Básico', '3° Básico', '4° Básico', '5° Básico', '6° Básico', '7° Básico', '8° Básico', 'I° Medio', 'II° Medio', 'III° Medio', 'IV° Medio'];
        } else if (nNorm.toLowerCase().includes('basica') || nNorm.includes('1° a 8°')) {
            nivelesArr = ['1° Básico', '2° Básico', '3° Básico', '4° Básico', '5° Básico', '6° Básico', '7° Básico', '8° Básico'];
        } else if (nNorm.toLowerCase().includes('media') || nNorm.includes('I° a IV°')) {
            nivelesArr = ['I° Medio', 'II° Medio', 'III° Medio', 'IV° Medio'];
        } else if (nNorm.includes(',')) {
            nivelesArr = nNorm.split(',').map(s => s.trim()).filter(Boolean);
        } else {
            nivelesArr = [nNorm];
        }
    }

    try {
        const planesCreados = [];
        for (const niv of nivelesArr) {
            const desc = descripcion || `Plan Propio Institucional ${asigUpper} - ${niv}`;
            const planId = await new Promise((resolve, reject) => {
                db.get(`SELECT id FROM curriculo_planes WHERE anio = ? AND tipo = 'PROPIO' AND nivel = ? AND asignatura = ?`,
                    [anioNum, niv, asigUpper], (err, row) => {
                        if (err) return reject(err);
                        if (row) {
                            db.run(`UPDATE curriculo_planes SET descripcion = ?, excluir_oas_mineduc = ?, activo = 1, actualizado_en = CURRENT_TIMESTAMP WHERE id = ?`,
                                [desc, excluyeVal, row.id], (errUpd) => {
                                    if (errUpd) return reject(errUpd);
                                    resolve(row.id);
                                });
                        } else {
                            db.run(`INSERT INTO curriculo_planes (anio, tipo, nivel, asignatura, descripcion, excluir_oas_mineduc, activo)
                                    VALUES (?, 'PROPIO', ?, ?, ?, ?, 1)`,
                                [anioNum, niv, asigUpper, desc, excluyeVal],
                                function(errIns) {
                                    if (errIns) return reject(errIns);
                                    resolve(this.lastID);
                                });
                        }
                    });
            });

            // Si se enviaron objetivos iniciales
            if (Array.isArray(objetivos) && objetivos.length > 0) {
                for (const o of objetivos) {
                    await new Promise((resO, rejO) => {
                        db.run(`INSERT INTO curriculo_objetivos (plan_id, tipo_objetivo, eje_unidad, unidad_sugerida, codigo, descripcion, categoria, activo)
                                VALUES (?, 'OA', ?, ?, ?, ?, ?, 1)`,
                            [planId, o.eje || 'General', o.unidad || 'Unidad 1', o.codigo, o.descripcion, o.categoria || 'Basal'],
                            (errO) => errO ? rejO(errO) : resO());
                    });
                }
            }
            planesCreados.push({ id: planId, nivel: niv });
        }

        res.json({
            id: planesCreados[0] ? planesCreados[0].id : null,
            mensaje: `Plan propio guardado exitosamente para ${planesCreados.length} nivel(es). ${excluyeVal ? '(Configurado para suplantar OAs estándar del MINEDUC)' : ''}`,
            planes: planesCreados
        });
    } catch(e) {
        res.status(500).json({ error: e.message });
    }
});

// 7b. Alternar suplantación de OAs MINEDUC en un plan propio
router.patch('/curriculo/planes/:id/suplantar', (req, res) => {
    if (!req.esAdminOCoordinacion) {
        return res.status(403).json({ error: 'Acceso denegado.' });
    }
    const { excluir_oas_mineduc } = req.body;
    const val = (excluir_oas_mineduc === true || excluir_oas_mineduc === 1 || excluir_oas_mineduc === '1') ? 1 : 0;
    db.run(`UPDATE curriculo_planes SET excluir_oas_mineduc = ?, actualizado_en = CURRENT_TIMESTAMP WHERE id = ?`, [val, req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, excluir_oas_mineduc: val, mensaje: val ? 'Plan propio configurado para suplantar OAs del MINEDUC.' : 'Plan propio configurado sin suplantar MINEDUC.' });
    });
});

// 7c. Eliminar un plan propio y sus OAs
router.delete('/curriculo/planes/:id', (req, res) => {
    if (!req.esAdminOCoordinacion) {
        return res.status(403).json({ error: 'Acceso denegado.' });
    }
    db.run(`DELETE FROM curriculo_objetivos WHERE plan_id = ?`, [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        db.run(`DELETE FROM curriculo_planes WHERE id = ? AND tipo = 'PROPIO'`, [req.params.id], function(err2) {
            if (err2) return res.status(500).json({ error: err2.message });
            res.json({ success: true, mensaje: 'Plan propio eliminado correctamente.' });
        });
    });
});

// 7d. Agregar OA a un plan propio
router.post('/curriculo/planes/:id/objetivos', (req, res) => {
    if (!req.esAdminOCoordinacion) {
        return res.status(403).json({ error: 'Acceso denegado.' });
    }
    const { codigo, descripcion, eje = 'General', unidad = 'Unidad 1', categoria = 'Basal', indicadores = [] } = req.body;
    if (!codigo || !descripcion) {
        return res.status(400).json({ error: 'Código y Descripción son obligatorios.' });
    }
    const indArr = Array.isArray(indicadores) ? indicadores : (typeof indicadores === 'string' ? indicadores.split(';').map(x => x.trim()).filter(Boolean) : []);
    db.run(`
        INSERT INTO curriculo_objetivos (plan_id, tipo_objetivo, eje_unidad, unidad_sugerida, codigo, descripcion, categoria, indicadores_sugeridos, activo)
        VALUES (?, 'OA', ?, ?, ?, ?, ?, ?, 1)
    `, [req.params.id, eje, unidad, codigo.trim().toUpperCase(), descripcion.trim(), categoria, JSON.stringify(indArr)],
    function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, mensaje: 'Objetivo de aprendizaje agregado con éxito al plan propio.' });
    });
});

// 7e. Eliminar OA de un plan
router.delete('/curriculo/objetivos/:id', (req, res) => {
    if (!req.esAdminOCoordinacion) {
        return res.status(403).json({ error: 'Acceso denegado.' });
    }
    db.run(`DELETE FROM curriculo_objetivos WHERE id = ?`, [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, mensaje: 'Objetivo de aprendizaje eliminado.' });
    });
});

// 7f. Editar un OA existente (código, descripción, eje, unidad asignada, nombre de unidad, categoría, indicadores)
router.put('/curriculo/objetivos/:id', (req, res) => {
    if (!req.esAdminOCoordinacion) {
        return res.status(403).json({ error: 'Acceso denegado: Solo Coordinación o Administración pueden editar OAs.' });
    }
    const oaId = req.params.id;
    const {
        codigo,
        descripcion,
        eje_unidad,
        unidad_sugerida,
        nombre_unidad_oficial,
        categoria,
        indicadores_sugeridos
    } = req.body;

    if (!codigo || !descripcion) {
        return res.status(400).json({ error: 'Código y Descripción son obligatorios.' });
    }

    const codNorm = codigo.toString().trim().toUpperCase();
    const descNorm = descripcion.toString().trim();
    const ejeNorm = (eje_unidad || 'General').toString().trim();
    const mNum = String(unidad_sugerida || 'Unidad 1').match(/(\d+)/);
    const numUnidad = mNum ? parseInt(mNum[1], 10) : 1;
    const uNorm = `Unidad ${numUnidad}`;
    const nomUnidad = (nombre_unidad_oficial || '').toString().trim();
    const catNorm = (categoria === 'Complementario') ? 'Complementario' : 'Basal';
    const indArr = Array.isArray(indicadores_sugeridos)
        ? indicadores_sugeridos.map(x => String(x).trim()).filter(Boolean)
        : (typeof indicadores_sugeridos === 'string'
            ? indicadores_sugeridos.split(/\r?\n|;|\|/).map(x => x.trim()).filter(Boolean)
            : []);

    db.get(`SELECT * FROM curriculo_objetivos WHERE id = ?`, [oaId], (errGet, row) => {
        if (errGet) return res.status(500).json({ error: errGet.message });
        if (!row) return res.status(404).json({ error: 'Objetivo de aprendizaje no encontrado.' });

        db.run(`
            UPDATE curriculo_objetivos
            SET codigo = ?, descripcion = ?, eje_unidad = ?, unidad_sugerida = ?, nombre_unidad_oficial = ?, categoria = ?, indicadores_sugeridos = ?, editado_manual = 1
            WHERE id = ?
        `, [codNorm, descNorm, ejeNorm, uNorm, nomUnidad || row.nombre_unidad_oficial || uNorm, catNorm, JSON.stringify(indArr), oaId], function(errUpd) {
            if (errUpd) return res.status(500).json({ error: errUpd.message });

            if (nomUnidad) {
                db.run(`UPDATE curriculo_objetivos SET nombre_unidad_oficial = ? WHERE plan_id = ? AND unidad_sugerida = ?`, [nomUnidad, row.plan_id, uNorm]);
                db.get(`SELECT unidades_oficiales FROM curriculo_planes WHERE id = ?`, [row.plan_id], (eP, planRow) => {
                    if (!eP && planRow) {
                        let uCat = [];
                        try { uCat = JSON.parse(planRow.unidades_oficiales || '[]'); } catch (e) { uCat = []; }
                        const idx = uCat.findIndex(u => Number(u.numero) === numUnidad);
                        if (idx >= 0) uCat[idx].nombre = nomUnidad;
                        else uCat.push({ numero: numUnidad, nombre: nomUnidad });
                        uCat.sort((a, b) => a.numero - b.numero);
                        db.run(`UPDATE curriculo_planes SET unidades_oficiales = ?, actualizado_en = CURRENT_TIMESTAMP WHERE id = ?`, [JSON.stringify(uCat), row.plan_id]);
                    }
                });
            }

            res.json({ success: true, id: oaId, mensaje: 'Objetivo de aprendizaje actualizado correctamente.' });
        });
    });
});

// 7g. Crear un nuevo OA directamente en cualquier nivel y asignatura (MINEDUC o PROPIO)
router.post('/curriculo/objetivos', (req, res) => {
    if (!req.esAdminOCoordinacion) {
        return res.status(403).json({ error: 'Acceso denegado: Solo Coordinación o Administración pueden agregar OAs.' });
    }
    const {
        plan_id,
        anio = 2026,
        tipo = 'MINEDUC',
        nivel,
        asignatura,
        codigo,
        descripcion,
        eje_unidad = 'General',
        unidad_sugerida = 'Unidad 1',
        nombre_unidad_oficial = '',
        categoria = 'Basal',
        indicadores_sugeridos = []
    } = req.body;

    if (!codigo || !descripcion) {
        return res.status(400).json({ error: 'Código y Descripción son obligatorios.' });
    }

    const codNorm = codigo.toString().trim().toUpperCase();
    const descNorm = descripcion.toString().trim();
    const ejeNorm = (eje_unidad || 'General').toString().trim();
    const mNum = String(unidad_sugerida || 'Unidad 1').match(/(\d+)/);
    const numUnidad = mNum ? parseInt(mNum[1], 10) : 1;
    const uNorm = `Unidad ${numUnidad}`;
    const nomUnidad = (nombre_unidad_oficial || uNorm).toString().trim();
    const catNorm = (categoria === 'Complementario') ? 'Complementario' : 'Basal';
    const indArr = Array.isArray(indicadores_sugeridos)
        ? indicadores_sugeridos.map(x => String(x).trim()).filter(Boolean)
        : (typeof indicadores_sugeridos === 'string'
            ? indicadores_sugeridos.split(/\r?\n|;|\|/).map(x => x.trim()).filter(Boolean)
            : []);

    const insertarEnPlan = (targetPlanId) => {
        db.run(`
            INSERT INTO curriculo_objetivos
            (plan_id, tipo_objetivo, eje_unidad, unidad_sugerida, nombre_unidad_oficial, codigo, descripcion, categoria, indicadores_sugeridos, orden, activo, editado_manual)
            VALUES (?, 'OA', ?, ?, ?, ?, ?, ?, ?, ?, 1, 1)
        `, [targetPlanId, ejeNorm, uNorm, nomUnidad, codNorm, descNorm, catNorm, JSON.stringify(indArr), numUnidad * 100], function(errIns) {
            if (errIns) return res.status(500).json({ error: errIns.message });
            res.json({ success: true, id: this.lastID, plan_id: targetPlanId, mensaje: 'Objetivo de aprendizaje creado exitosamente.' });
        });
    };

    if (plan_id) {
        return insertarEnPlan(plan_id);
    }

    if (!nivel || !asignatura) {
        return res.status(400).json({ error: 'Debe indicar plan_id o bien Nivel y Asignatura.' });
    }

    const nivNorm = curriculoSeed.normalizarNivel(nivel);
    const asigNorm = curriculoSeed.normalizarNombreAsignatura(asignatura);
    const anioNum = parseInt(anio, 10) || 2026;
    const tipoNorm = (tipo === 'PROPIO') ? 'PROPIO' : 'MINEDUC';

    db.get(`SELECT id FROM curriculo_planes WHERE anio = ? AND tipo = ? AND (nivel = ? OR nivel = ?) AND (asignatura = ? OR asignatura = ?)`,
        [anioNum, tipoNorm, nivNorm, nivel, asigNorm, asignatura], (errP, planRow) => {
            if (errP) return res.status(500).json({ error: errP.message });
            if (planRow) {
                return insertarEnPlan(planRow.id);
            }
            const descPlan = `Programa ${tipoNorm} ${asigNorm} - ${nivNorm}`;
            db.run(`INSERT INTO curriculo_planes (anio, tipo, nivel, asignatura, descripcion, activo) VALUES (?, ?, ?, ?, ?, 1)`,
                [anioNum, tipoNorm, nivNorm, asigNorm, descPlan], function(errNew) {
                    if (errNew) return res.status(500).json({ error: errNew.message });
                    insertarEnPlan(this.lastID);
                });
        });
});

// 7h. Obtener y actualizar Unidades Oficiales y asignación de OAs por unidad para un Nivel y Asignatura
router.get('/curriculo/unidades-oficiales', (req, res) => {
    const { nivel, asignatura, anio = 2026, tipo = 'MINEDUC' } = req.query;
    if (!nivel || !asignatura) {
        return res.status(400).json({ error: 'Nivel y Asignatura son obligatorios.' });
    }
    const nivNorm = curriculoSeed.normalizarNivel(nivel);
    const asigNorm = curriculoSeed.normalizarNombreAsignatura(asignatura);
    const anioNum = parseInt(anio, 10) || 2026;

    db.get(`
        SELECT * FROM curriculo_planes
        WHERE (anio = ? OR anio = 2026)
          AND (nivel = ? OR nivel = ?)
          AND (asignatura = ? OR asignatura = ? OR LOWER(asignatura) LIKE '%' || LOWER(?) || '%')
          AND (tipo = ? OR ? = 'TODOS')
          AND activo = 1
        ORDER BY (CASE WHEN tipo = 'PROPIO' THEN 0 ELSE 1 END) ASC, id ASC
        LIMIT 1
    `, [anioNum, nivNorm, nivel, asigNorm, asignatura, asigNorm, tipo, tipo], (err, planRow) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!planRow) return res.json({ plan: null, unidades: [], objetivos: [] });

        db.all(`SELECT * FROM curriculo_objetivos WHERE plan_id = ? AND activo = 1 ORDER BY orden ASC, codigo ASC`, [planRow.id], (errO, objs) => {
            if (errO) return res.status(500).json({ error: errO.message });
            let unidadesCat = [];
            try { unidadesCat = JSON.parse(planRow.unidades_oficiales || '[]'); } catch (e) { unidadesCat = []; }
            const mapaUnidades = new Map();
            [1, 2, 3, 4].forEach(n => mapaUnidades.set(n, `Unidad ${n}`));
            unidadesCat.forEach(u => { if (u && u.numero) mapaUnidades.set(Number(u.numero), u.nombre); });
            (objs || []).forEach(o => {
                const m = String(o.unidad_sugerida || '').match(/(\d+)/);
                const n = m ? parseInt(m[1], 10) : 1;
                if (o.nombre_unidad_oficial) mapaUnidades.set(n, o.nombre_unidad_oficial);
            });
            const unidades = Array.from(mapaUnidades.entries()).sort((a, b) => a[0] - b[0]).map(([numero, nombre]) => ({ numero, nombre }));
            res.json({ plan: planRow, unidades, objetivos: objs || [] });
        });
    });
});

router.put('/curriculo/unidades-oficiales', async (req, res) => {
    if (!req.esAdminOCoordinacion) {
        return res.status(403).json({ error: 'Acceso denegado: Solo Coordinación o Administración pueden modificar las unidades oficiales.' });
    }
    const { plan_id, unidades = [], asignaciones = [] } = req.body;
    if (!plan_id) {
        return res.status(400).json({ error: 'plan_id es obligatorio.' });
    }

    try {
        const unidadesNormalizadas = (unidades || []).map(u => ({
            numero: parseInt(u.numero, 10) || 1,
            nombre: (u.nombre || `Unidad ${u.numero}`).toString().trim()
        })).sort((a, b) => a.numero - b.numero);

        await new Promise((resolve, reject) => {
            db.run(`UPDATE curriculo_planes SET unidades_oficiales = ?, actualizado_en = CURRENT_TIMESTAMP WHERE id = ?`,
                [JSON.stringify(unidadesNormalizadas), plan_id], err => err ? reject(err) : resolve());
        });

        const mapaNombres = new Map();
        unidadesNormalizadas.forEach(u => mapaNombres.set(u.numero, u.nombre));

        // Actualizar nombre_unidad_oficial en todos los OAs de cada unidad
        for (const [num, nom] of mapaNombres.entries()) {
            await new Promise((resolve, reject) => {
                db.run(`UPDATE curriculo_objetivos SET nombre_unidad_oficial = ? WHERE plan_id = ? AND unidad_sugerida = ?`,
                    [nom, plan_id, `Unidad ${num}`], err => err ? reject(err) : resolve());
            });
        }

        // Si vienen reasignaciones de OAs a unidades ({ id, unidad_numero, categoria })
        if (Array.isArray(asignaciones) && asignaciones.length > 0) {
            for (const asig of asignaciones) {
                if (!asig.id) continue;
                const numU = parseInt(asig.unidad_numero, 10) || 1;
                const uStr = `Unidad ${numU}`;
                const nomU = mapaNombres.get(numU) || `Unidad ${numU}`;
                const cat = asig.categoria === 'Complementario' ? 'Complementario' : (asig.categoria === 'Basal' ? 'Basal' : null);
                await new Promise((resolve, reject) => {
                    if (cat) {
                        db.run(`UPDATE curriculo_objetivos SET unidad_sugerida = ?, nombre_unidad_oficial = ?, categoria = ?, editado_manual = 1 WHERE id = ? AND plan_id = ?`,
                            [uStr, nomU, cat, asig.id, plan_id], err => err ? reject(err) : resolve());
                    } else {
                        db.run(`UPDATE curriculo_objetivos SET unidad_sugerida = ?, nombre_unidad_oficial = ?, editado_manual = 1 WHERE id = ? AND plan_id = ?`,
                            [uStr, nomU, asig.id, plan_id], err => err ? reject(err) : resolve());
                    }
                });
            }
        }

        res.json({ success: true, mensaje: 'Unidades oficiales y asignación de OAs actualizadas correctamente.' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 7i. Cargar / Precargar Unidades y OAs Oficiales MINEDUC en una planificación existente
router.post('/:id/cargar-unidades-oficiales', async (req, res) => {
    try {
        const resultado = await planificacion.cargarUnidadesOficialesEnPlan(req.params.id, req.body || {}, req.user);
        const plan = (resultado && resultado.plan) ? resultado.plan : resultado;
        const msg = req.body && req.body.numero_unidad
            ? `Unidad ${req.body.numero_unidad} actualizada con su título y OAs.`
            : (resultado && resultado.tieneOasOficiales
                ? 'Se cargaron las 4 Unidades y OAs oficiales del programa curricular.'
                : 'Se estructuraron las 4 Unidades base para el año escolar.');
        res.json({
            success: true,
            plan: plan,
            mensaje: msg
        });
    } catch (e) {
        console.error('Error cargando unidades oficiales:', e);
        res.status(500).json({ error: e.message || 'Error al cargar unidades' });
    }
});

// -------------------------------------------------------------
// HITOS Y LINEAMIENTOS INSTITUCIONALES (UTP / DOCENTES)
// -------------------------------------------------------------

// Listar hitos del año (acepta anio o anno)
router.get('/hitos', async (req, res) => {
    try {
        const anio = req.query.anio || req.query.anno || 2026;
        const hitos = await planificacion.listarHitos(anio);
        res.json(hitos);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Obtener hitos vigentes para un curso y asignatura específicos (acepta anio o anno)
router.get('/hitos/vigentes', async (req, res) => {
    try {
        const anio = req.query.anio || req.query.anno || 2026;
        const { curso, asignatura } = req.query;
        const hitos = await planificacion.obtenerHitosParaPlan(anio, curso, asignatura);
        res.json(hitos);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Descargar plantilla Excel para hitos institucionales
router.get('/hitos/plantilla', async (req, res) => {
    try {
        const buf = planificacion.generarPlantillaHitosExcel();
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="Plantilla_Hitos_Institucionales.xlsx"');
        res.send(buf);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Importar hitos masivamente desde Excel (Exclusivo UTP / Admin)
router.post('/hitos/importar', upload.single('archivo'), async (req, res) => {
    if (!req.esAdminOCoordinacion) {
        return res.status(403).json({ error: 'Acceso denegado: Solo Coordinación o Administración pueden importar hitos.' });
    }
    try {
        if (!req.file || !req.file.buffer) {
            return res.status(400).json({ error: 'Debe adjuntar un archivo Excel (.xlsx).' });
        }
        const anio = req.body.anio || req.body.anno || 2026;
        const resultado = await planificacion.importarHitosExcel(req.file.buffer, anio, req.user);
        res.json(resultado);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Crear nuevo hito (Exclusivo UTP / Admin)
router.post('/hitos', async (req, res) => {
    if (!req.esAdminOCoordinacion) {
        return res.status(403).json({ error: 'Acceso denegado: Solo Coordinación o Administración pueden crear hitos.' });
    }
    try {
        if (req.body.anno && !req.body.anio) req.body.anio = req.body.anno;
        const resultado = await planificacion.crearHito(req.body, req.user);
        res.json(resultado);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Actualizar hito existente (Exclusivo UTP / Admin)
router.put('/hitos/:id', async (req, res) => {
    if (!req.esAdminOCoordinacion) {
        return res.status(403).json({ error: 'Acceso denegado: Solo Coordinación o Administración pueden modificar hitos.' });
    }
    try {
        if (req.body.anno && !req.body.anio) req.body.anio = req.body.anno;
        const resultado = await planificacion.actualizarHito(req.params.id, req.body, req.user);
        res.json(resultado);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Eliminar hito (Exclusivo UTP / Admin)
router.delete('/hitos/:id', async (req, res) => {
    if (!req.esAdminOCoordinacion) {
        return res.status(403).json({ error: 'Acceso denegado: Solo Coordinación o Administración pueden eliminar hitos.' });
    }
    try {
        const resultado = await planificacion.eliminarHito(req.params.id, req.user);
        res.json(resultado);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// -------------------------------------------------------------
// PLANTILLAS E IMPORTACIONES MASIVAS (PLANIFICACIONES & CURRICULO)
// -------------------------------------------------------------

// Descargar plantilla Excel para planificaciones anuales masivas
router.get('/plantilla-masiva', async (req, res) => {
    try {
        const anio = req.query.anio || req.query.anno || 2026;
        const buf = planificacion.generarPlantillaPlanificacionesExcel(anio);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="Plantilla_Planificaciones_${anio}.xlsx"`);
        res.send(buf);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Importar planificaciones anuales masivamente desde Excel
router.post('/importar-masivo', upload.single('archivo'), async (req, res) => {
    try {
        if (!req.file || !req.file.buffer) {
            return res.status(400).json({ error: 'Debe adjuntar un archivo Excel (.xlsx).' });
        }
        const anio = req.body.anio || req.body.anno || 2026;
        const resultado = await planificacion.importarPlanificacionesMasivasExcel(req.file.buffer, anio, req.user);
        res.json(resultado);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Descargar plantilla de currículo / planes propios
router.get('/curriculo/plantilla', async (req, res) => {
    try {
        const buf = planificacion.generarPlantillaCurriculoExcel();
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="Plantilla_Curriculo_MINEDUC_Planes_Propios.xlsx"');
        res.send(buf);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 8. Detalle de una planificación
router.get('/:id', async (req, res) => {
    try {
        const data = await planificacion.obtenerPlanificacionDetalle(req.params.id);
        res.json(data);
    } catch (e) {
        res.status(404).json({ error: e.message });
    }
});

// 9. Crear nueva planificación
router.post('/', async (req, res) => {
    try {
        const resultado = await planificacion.crearPlanificacion(req.body, req.user);
        res.json(resultado);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// 10. Guardar cambios en planificación (Borrador / Auto-guardado)
router.put('/:id', async (req, res) => {
    try {
        const resultado = await planificacion.guardarPlanificacion(req.params.id, req.body, req.user);
        res.json(resultado);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 10a. Marcar / desmarcar hito completado en una planificación
router.post('/:id/hitos/:hitoId/completar', async (req, res) => {
    try {
        const { completado } = req.body;
        const resultado = await planificacion.marcarHitoCompletadoPlan(req.params.id, parseInt(req.params.hitoId), completado !== false, req.user);
        res.json(resultado);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 10b. Clonar Planificación a otro paralelo
router.post('/:id/clonar', async (req, res) => {
    try {
        const { curso_destino } = req.body;
        if (!curso_destino) return res.status(400).json({ error: 'Debe especificar el curso de destino.' });
        const resultado = await planificacion.clonarPlanificacion(req.params.id, curso_destino, req.user);
        res.json(resultado);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// 10c. Vincular curso paralelo a la planificación
router.post('/:id/vincular', async (req, res) => {
    try {
        const { curso_vinculado } = req.body;
        if (!curso_vinculado) return res.status(400).json({ error: 'Debe especificar el curso a vincular.' });
        const resultado = await planificacion.vincularCurso(req.params.id, curso_vinculado, req.user);
        res.json(resultado);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// 10d. Desvincular curso paralelo
router.post('/:id/desvincular', async (req, res) => {
    try {
        const { curso_desvincular, crear_copia } = req.body;
        if (!curso_desvincular) return res.status(400).json({ error: 'Debe especificar el curso a desvincular.' });
        const resultado = await planificacion.desvincularCurso(req.params.id, curso_desvincular, { crearCopia: !!crear_copia }, req.user);
        res.json(resultado);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// 10e. Promover planificación individual al nuevo año escolar
router.post('/:id/promover', async (req, res) => {
    try {
        const annoDestino = req.body.annoDestino || req.body.anno_destino || req.body.anioDestino || req.body.anio_destino || 2027;
        const resultado = await planificacion.promoverPlanificacionIndividual(req.params.id, annoDestino, req.user);
        res.json(resultado);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// 11. Crear Checkpoint de Versión ("Tipo Git")
router.post('/:id/checkpoint', async (req, res) => {
    try {
        const mensaje = req.body.mensaje || 'Actualización de planificación';
        const resultado = await planificacion.crearCheckpointVersion(req.params.id, mensaje, req.user, 'checkpoint');
        res.json(resultado);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 12. Restaurar versión anterior
router.post('/:id/restaurar-version', async (req, res) => {
    try {
        const { version_id } = req.body;
        if (!version_id) return res.status(400).json({ error: 'Debe especificar el ID de la versión a restaurar.' });
        const resultado = await planificacion.restaurarVersion(req.params.id, version_id, req.user);
        res.json(resultado);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 13. Cambiar estado de Visado (Exclusivo Coordinación/Admin)
router.put('/:id/visado', async (req, res) => {
    if (!req.esAdminOCoordinacion) {
        return res.status(403).json({ error: 'Acceso denegado: Solo Coordinación o Administración pueden visar planificaciones.' });
    }
    try {
        const resultado = await planificacion.cambiarEstadoVisado(req.params.id, req.body, req.user);
        res.json(resultado);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 14. Agregar Observación Pedagógica
router.post('/:id/observaciones', async (req, res) => {
    try {
        const resultado = await planificacion.agregarObservacion(req.params.id, req.body, req.user);
        res.json(resultado);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 15. Exportar Planificación a Excel estructurado
router.get('/:id/exportar-excel', async (req, res) => {
    try {
        const plan = await planificacion.obtenerPlanificacionDetalle(req.params.id);
        const wb = xlsx.utils.book_new();

        // Hoja 1: Resumen General
        const resumenData = [
            ["COLEGIO CERRO GRANDE - PLANIFICACIÓN CURRICULAR"],
            ["Año Escolar:", plan.anio],
            ["Curso:", plan.curso],
            ["Asignatura:", plan.asignatura],
            ["Título de Plan:", plan.titulo],
            ["Docente Responsable:", plan.docente_responsable],
            ["Docentes Colaboradores:", (plan.docentes_colaboradores || []).join(', ')],
            ["Estado:", plan.estado],
            ["Visado por:", plan.visado_por ? `${plan.visado_por} (${plan.visado_fecha})` : 'Pendiente'],
            ["Horas Anuales Estimadas:", plan.horas_anuales],
            ["Metas y Objetivos Anuales:", plan.metas_anuales || ''],
            ["Cobertura OAs Planificados:", `${plan.cobertura.cobertura_oas_pct}% (${plan.cobertura.oas_cubiertos} de ${plan.cobertura.oas_totales_programa})`],
            ["Evaluaciones Calendarizadas:", plan.cobertura.evaluaciones_calendarizadas]
        ];
        const wsResumen = xlsx.utils.aoa_to_sheet(resumenData);
        xlsx.utils.book_append_sheet(wb, wsResumen, "Resumen General");

        // Hoja 2: Unidades de Aprendizaje
        const unidadesData = (plan.unidades || []).map(u => ({
            "N° Unidad": u.numero_unidad,
            "Nombre Unidad": u.nombre_unidad,
            "Semestre": u.semestre,
            "Fecha Inicio": u.fecha_inicio || '',
            "Fecha Término": u.fecha_fin || '',
            "Horas Pedagógicas": u.horas_estimadas,
            "OAs Asignados": (u.oas_seleccionados || []).map(o => (typeof o === 'object' ? o.codigo : o)).join('; '),
            "Habilidades": u.habilidades || '',
            "Actitudes": u.actitudes || '',
            "Indicadores de Evaluación": u.indicadores_evaluacion || '',
            "Instrumentos de Evaluación": u.instrumentos_evaluacion || ''
        }));
        const wsUnidades = xlsx.utils.json_to_sheet(unidadesData);
        xlsx.utils.book_append_sheet(wb, wsUnidades, "Unidades");

        // Hoja 3: Desglose Semanal (Clase a Clase)
        const semanasData = [];
        (plan.unidades || []).forEach(u => {
            (u.desglose_semanal || []).forEach(s => {
                semanasData.push({
                    "Unidad": u.numero_unidad,
                    "Semana N°": s.semana || '',
                    "Fecha Desde": s.fecha_inicio || '',
                    "Fecha Hasta": s.fecha_fin || '',
                    "Tema / Contenido": s.tema || '',
                    "OAs de la Semana": Array.isArray(s.oas_semana) ? s.oas_semana.join(', ') : '',
                    "Actividades Formativas (Inicio-Desarrollo-Cierre)": s.actividades_formativas || '',
                    "Recursos Pedagógicos": s.recursos || '',
                    "Adecuaciones DUA": s.dua_adecuaciones || ''
                });
            });
        });
        const wsSemanas = xlsx.utils.json_to_sheet(semanasData.length > 0 ? semanasData : [{ "Información": "Sin desglose semanal cargado" }]);
        xlsx.utils.book_append_sheet(wb, wsSemanas, "Desglose Semanal");

        const buf = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
        const filename = `Planificacion_${plan.curso}_${plan.asignatura}_${plan.anio}.xlsx`.replace(/\s+/g, '_');

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(buf);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Descargar plantilla Excel para unidades y semanas de una planificación
router.get('/:id/plantilla-unidades', async (req, res) => {
    try {
        const buf = await planificacion.generarPlantillaUnidadesExcel(req.params.id);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="Plantilla_Unidades_Plan_${req.params.id}.xlsx"`);
        res.send(buf);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Importar unidades y desglose semanal desde Excel para una planificación
router.post('/:id/importar-unidades', upload.single('archivo'), async (req, res) => {
    try {
        if (!req.file || !req.file.buffer) {
            return res.status(400).json({ error: 'Debe adjuntar un archivo Excel (.xlsx).' });
        }
        const resultado = await planificacion.importarUnidadesSemanasExcel(req.params.id, req.file.buffer, req.user);
        res.json(resultado);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 16. Solicitar Eliminación de Planificación (Creador, Docente o Admin)
router.post('/:id/solicitar-eliminacion', async (req, res) => {
    try {
        const resultado = await planificacion.solicitarEliminacionPlan(req.params.id, req.body, req.user);
        res.json(resultado);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 17. Cancelar Solicitud de Eliminación (Creador o Admin)
router.post('/:id/cancelar-solicitud-eliminacion', async (req, res) => {
    try {
        const resultado = await planificacion.cancelarSolicitudEliminacion(req.params.id, req.user);
        res.json(resultado);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 18. Resolver Solicitud de Eliminación (Exclusivo Coordinación/Admin)
router.post('/:id/resolver-eliminacion', async (req, res) => {
    if (!req.esAdminOCoordinacion) {
        return res.status(403).json({ error: 'Acceso denegado: Solo Coordinación o Administración pueden resolver solicitudes de eliminación.' });
    }
    try {
        const resultado = await planificacion.resolverEliminacionPlan(req.params.id, req.body, req.user);
        res.json(resultado);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 19. Cambiar Propietario de Planificación (Exclusivo Coordinación/Admin)
router.post('/:id/cambiar-propietario', async (req, res) => {
    if (!req.esAdminOCoordinacion) {
        return res.status(403).json({ error: 'Acceso denegado: Solo Coordinación o Administración pueden reasignar el propietario.' });
    }
    try {
        const nuevo_propietario = req.body.nuevo_propietario || req.body.nuevoDocente || req.body.propietario;
        const resultado = await planificacion.cambiarPropietarioPlan(req.params.id, nuevo_propietario, req.user);
        res.json(resultado);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 20. Eliminar Planificación Directamente (Exclusivo Coordinación/Admin)
router.delete('/:id', async (req, res) => {
    if (!req.esAdminOCoordinacion) {
        return res.status(403).json({ error: 'Acceso denegado: Solo Coordinación o Administración pueden eliminar planificaciones.' });
    }
    try {
        const resultado = await planificacion.eliminarPlanificacion(req.params.id, req.user);
        res.json(resultado);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;
