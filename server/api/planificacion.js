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
    const anio = parseInt(req.query.anio) || 2026;
    db.all(`SELECT * FROM curriculo_planes WHERE anio = ? AND activo = 1 ORDER BY nivel ASC, asignatura ASC`, [anio], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows || []);
    });
});

// 5. Búsqueda de Objetivos de Aprendizaje (OAs)
router.get('/curriculo/objetivos', (req, res) => {
    const { plan_id, nivel, asignatura, anio = 2026, q = '', unidad } = req.query;
    let sql = `
        SELECT o.*, cp.nivel, cp.asignatura, cp.tipo as tipo_plan
        FROM curriculo_objetivos o
        JOIN curriculo_planes cp ON cp.id = o.plan_id
        WHERE cp.anio = ? AND o.activo = 1
    `;
    const params = [parseInt(anio) || 2026];

    if (plan_id) {
        sql += ` AND o.plan_id = ?`;
        params.push(plan_id);
    }
    if (nivel) {
        sql += ` AND cp.nivel = ?`;
        params.push(nivel);
    }
    if (asignatura) {
        sql += ` AND (cp.asignatura = ? OR LOWER(cp.asignatura) LIKE '%' || LOWER(?) || '%')`;
        params.push(asignatura, asignatura);
    }
    if (unidad && unidad !== 'todas') {
        sql += ` AND (o.unidad_sugerida = ? OR o.unidad_sugerida LIKE ?)`;
        params.push(unidad, `%${unidad}%`);
    }
    if (q && q.trim()) {
        sql += ` AND (LOWER(o.codigo) LIKE ? OR LOWER(o.descripcion) LIKE ? OR LOWER(o.eje_unidad) LIKE ?)`;
        const qParam = `%${q.trim().toLowerCase()}%`;
        params.push(qParam, qParam, qParam);
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
        const resultado = await curriculoSeed.importarCurriculoExcel(db, req.file.buffer, anio, tipo);
        res.json(resultado);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 7. Crear asignatura o plan propio del colegio
router.post('/curriculo/propio', (req, res) => {
    if (!req.esAdminOCoordinacion) {
        return res.status(403).json({ error: 'Acceso denegado.' });
    }
    const { anio = 2026, nivel, asignatura, descripcion, objetivos } = req.body;
    if (!nivel || !asignatura) {
        return res.status(400).json({ error: 'Nivel y Asignatura son obligatorios.' });
    }

    db.run(`
        INSERT INTO curriculo_planes (anio, tipo, nivel, asignatura, descripcion, activo)
        VALUES (?, 'PROPIO', ?, ?, ?, 1)
    `, [parseInt(anio) || 2026, nivel, asignatura.trim().toUpperCase(), descripcion || `Plan Propio Institucional ${asignatura} - ${nivel}`],
    function (err) {
        if (err) return res.status(500).json({ error: err.message });
        const planId = this.lastID;

        // Si se enviaron OAs iniciales
        if (Array.isArray(objetivos) && objetivos.length > 0) {
            const stmt = db.prepare(`
                INSERT INTO curriculo_objetivos (plan_id, tipo_objetivo, eje_unidad, codigo, descripcion, categoria, activo)
                VALUES (?, 'OA', ?, ?, ?, ?, 1)
            `);
            objetivos.forEach(o => {
                stmt.run([planId, o.eje || 'General', o.codigo, o.descripcion, o.categoria || 'Basal']);
            });
            stmt.finalize();
        }

        res.json({ id: planId, mensaje: `Plan propio creado exitosamente.` });
    });
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
