/**
 * Router API del Módulo Integral de Asistencia Escolar (Nativo)
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const asistenciaService = require('../services/asistencia');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 25 * 1024 * 1024 } // 25MB para libros Excel completos
});

// Middleware de Autenticación y Permisos Granulares de Asistencia
async function authMiddleware(req, res, next) {
    try {
        if (req.isAuthenticated && req.isAuthenticated()) {
            const perms = await asistenciaService.evaluarPermisosAsistencia(req.user);
            req.permisosAsistencia = perms;
            req.esAdmin = perms.esAdmin;
            req.esCoordinacion = perms.esCoordinacion;
            req.esAdminOCoordinacion = perms.esGestorAsistencia;
            return next();
        }
        // En modo desarrollo local (sin Google OAuth configurado)
        if (!process.env.GOOGLE_CLIENT_ID && !process.env.GAS_WEB_APP_URL) {
            const rolDev = (req.session && req.session.rolActivo) ? req.session.rolActivo : 'Administrador';
            req.user = req.user || {
                id: 1,
                email: 'admin@colegiocerrogrande.cl',
                nombre: 'Administrador Local',
                rol: rolDev
            };
            const perms = await asistenciaService.evaluarPermisosAsistencia(req.user);
            req.permisosAsistencia = perms;
            req.esAdmin = perms.esAdmin;
            req.esCoordinacion = perms.esCoordinacion;
            req.esAdminOCoordinacion = perms.esGestorAsistencia;
            return next();
        }
        return res.status(401).json({ error: 'No autenticado. Por favor inicie sesión.' });
    } catch (e) {
        return res.status(500).json({ error: 'Error validando permisos: ' + e.message });
    }
}

router.use(authMiddleware);

function requireTomarAsistencia(req, res, next) {
    if (!req.permisosAsistencia || !req.permisosAsistencia.puedeTomarAsistencia) {
        return res.status(403).json({
            error: 'Acceso denegado: Solo Inspectoría o usuarios autorizados pueden registrar asistencia.'
        });
    }
    next();
}

function requireGestorAsistencia(req, res, next) {
    if (!req.permisosAsistencia || !req.permisosAsistencia.esGestorAsistencia) {
        return res.status(403).json({
            error: 'Acceso denegado: Requiere perfil de Inspectoría, Coordinación o Administración.'
        });
    }
    next();
}

function requireAdminAsistencia(req, res, next) {
    if (!req.permisosAsistencia || !req.permisosAsistencia.esAdmin) {
        return res.status(403).json({
            error: 'Acceso denegado: Solo administradores pueden gestionar matrícula y configuración de asistencia.'
        });
    }
    next();
}

function parseAnioMesQuery(mesStr) {
    const { fecha } = asistenciaService.obtenerFechaHoraChile();
    const fallbackY = parseInt(fecha.slice(0, 4), 10);
    const fallbackM = parseInt(fecha.slice(5, 7), 10);
    if (mesStr && /^\d{4}-\d{1,2}$/.test(String(mesStr).trim())) {
        const [y, m] = String(mesStr).trim().split('-').map(n => parseInt(n, 10));
        if (m >= 1 && m <= 12) return { anio: y, mes: m };
    }
    return { anio: fallbackY, mes: fallbackM };
}

// =============================================================
// 1. RESUMEN DIARIO Y CONSULTAS GENERALES
// =============================================================

router.get('/hoy', async (req, res) => {
    try {
        const { fecha: hoyStr } = asistenciaService.obtenerFechaHoraChile();
        const fechaConsulta = req.query.fecha || hoyStr;
        const data = await asistenciaService.obtenerAsistenciaFecha(fechaConsulta);

        const diaQuery = asistenciaService.normalizarTexto(data.dia_info ? data.dia_info.diaSemana : '');
        const docentesBloque1 = await asistenciaService.obtenerCursosPrimerBloque(diaQuery);

        const userEmail = (req.user && req.user.email) ? req.user.email.toLowerCase().trim() : '';
        const userNombreNorm = (req.user && req.user.nombre) ? asistenciaService.normalizarTexto(req.user.nombre) : '';

        let misCursosInfo = null;
        for (const doc of docentesBloque1) {
            const docNombreNorm = asistenciaService.normalizarTexto(doc.profesor_nombre || '');
            if ((doc.profesor_email && doc.profesor_email.toLowerCase() === userEmail) ||
                (userNombreNorm && docNombreNorm && (docNombreNorm.includes(userNombreNorm) || userNombreNorm.includes(docNombreNorm)))) {
                misCursosInfo = doc;
                break;
            }
        }

        let misCursosAsistencia = [];
        if (misCursosInfo && misCursosInfo.cursos) {
            const cursosMap = new Map();
            (data.cursos || []).forEach(c => cursosMap.set(c.curso_normalizado, c));

            misCursosAsistencia = misCursosInfo.cursos.map(c => {
                const asist = cursosMap.get(c.curso_normalizado) || {
                    matricula_total: 0,
                    presentes: 0,
                    ausentes: 0,
                    porcentaje: 0,
                    alumnos_ausentes: [],
                    tomada: false
                };
                return { ...c, ...asist };
            });
        }

        let novedadesDia = [];
        if (req.permisosAsistencia && req.permisosAsistencia.esGestorAsistencia) {
            novedadesDia = await asistenciaService.listarNovedades({ fecha: fechaConsulta, limit: 30 });
        }

        res.json({
            ...data,
            dia_semana: diaQuery,
            usuario_actual: {
                nombre: req.user.nombre,
                email: req.user.email,
                rol: req.user.rol,
                esAdmin: req.permisosAsistencia.esGestorAsistencia,
                permisos: req.permisosAsistencia
            },
            mis_cursos_bloque1: misCursosAsistencia,
            novedades_dia: novedadesDia
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.get('/fecha/:fecha', async (req, res) => {
    try {
        const data = await asistenciaService.obtenerAsistenciaFecha(req.params.fecha);
        res.json(data);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// =============================================================
// 2. TOMA DE ASISTENCIA DIARIA Y NOVEDADES ("Reportar")
// =============================================================

router.get('/cursos-estado', async (req, res) => {
    try {
        const estado = await asistenciaService.obtenerEstadoCursosDia(req.query.fecha || null);
        res.json({
            ...estado,
            cursos_oficiales: asistenciaService.CURSOS_OFICIALES,
            permisos: req.permisosAsistencia
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.get('/curso/:curso/lista', requireTomarAsistencia, async (req, res) => {
    try {
        let cursoNombre = req.params.curso;
        try { cursoNombre = decodeURIComponent(cursoNombre); } catch (e) {}
        const data = await asistenciaService.obtenerFormularioCurso(cursoNombre, req.query.fecha || null);
        res.json(data);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

router.post('/curso/:curso/guardar', requireTomarAsistencia, async (req, res) => {
    try {
        let cursoNombre = req.params.curso;
        try { cursoNombre = decodeURIComponent(cursoNombre); } catch (e) {}

        const { fecha: hoyStr } = asistenciaService.obtenerFechaHoraChile();
        const fechaTarget = (req.body && req.body.fecha) ? String(req.body.fecha).trim() : hoyStr;

        if (fechaTarget > hoyStr) {
            return res.status(400).json({
                error: 'No se puede registrar asistencia en una fecha futura.'
            });
        }

        if (fechaTarget !== hoyStr && !req.permisosAsistencia.puedeEditarPasado) {
            return res.status(403).json({
                error: 'No tienes permisos para modificar asistencia de una fecha distinta a hoy.'
            });
        }

        const ausentesIds = Array.isArray(req.body.ausentesIds) ? req.body.ausentesIds : [];
        const observacionesMap = req.body.observacionesMap || {};

        const resultado = await asistenciaService.guardarAsistenciaCurso({
            curso: cursoNombre,
            fecha: fechaTarget,
            ausentesIds,
            observacionesMap,
            usuario: req.user
        });

        res.json({ success: true, registro: resultado });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

router.delete('/curso/:curso/fecha/:fecha', requireGestorAsistencia, async (req, res) => {
    try {
        let cursoNombre = req.params.curso;
        try { cursoNombre = decodeURIComponent(cursoNombre); } catch (e) {}
        const fecha = String(req.params.fecha || '').trim();
        const resultado = await asistenciaService.eliminarAsistenciaCursoFecha({
            curso: cursoNombre,
            fecha,
            usuario: req.user
        });
        res.json({ success: true, resultado });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

router.post('/novedad', requireTomarAsistencia, async (req, res) => {
    try {
        const { curso, fecha, mensaje } = req.body || {};
        const resNov = await asistenciaService.crearReporteNovedad({
            curso,
            fecha: fecha || null,
            mensaje,
            usuario: req.user
        });
        res.json({ success: true, novedad: resNov });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

router.get('/novedades', requireGestorAsistencia, async (req, res) => {
    try {
        const rows = await asistenciaService.listarNovedades(req.query);
        res.json(rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.patch('/novedades/:id/revisar', requireGestorAsistencia, async (req, res) => {
    try {
        const row = await asistenciaService.marcarNovedadRevisada(parseInt(req.params.id, 10), req.user);
        res.json({ success: true, novedad: row });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// =============================================================
// 3. PLANILLA MENSUAL (LIBRO DE CLASES) Y EXPORTACIÓN
// =============================================================

router.get('/mensual/:curso', async (req, res) => {
    try {
        let cursoNombre = req.params.curso;
        try { cursoNombre = decodeURIComponent(cursoNombre); } catch (e) {}
        const { anio, mes } = parseAnioMesQuery(req.query.mes);
        const planilla = await asistenciaService.obtenerPlanillaMensual(cursoNombre, anio, mes);
        res.json({
            ...planilla,
            puede_editar: Boolean(req.permisosAsistencia && req.permisosAsistencia.esGestorAsistencia)
        });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

router.patch('/registro-celda', requireGestorAsistencia, async (req, res) => {
    try {
        const { estudianteId, fecha, ausente, observacion } = req.body || {};
        if (!estudianteId || !fecha) {
            return res.status(400).json({ error: 'Se requiere estudianteId y fecha.' });
        }
        const { fecha: hoyStr } = asistenciaService.obtenerFechaHoraChile();
        if (String(fecha).trim() > hoyStr) {
            return res.status(400).json({ error: 'No se puede registrar asistencia en una fecha futura.' });
        }
        const registro = await asistenciaService.toggleCeldaAsistencia({
            estudianteId: parseInt(estudianteId, 10),
            fecha,
            ausente: Boolean(ausente),
            observacion: observacion || '',
            usuario: req.user
        });
        res.json({ success: true, registro });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

router.get('/exportar-mensual/xlsx', requireGestorAsistencia, async (req, res) => {
    try {
        const { anio, mes } = parseAnioMesQuery(req.query.mes);
        const archivos = await asistenciaService.generarReporteMensualArchivos(anio, mes);
        res.setHeader('Content-Disposition', `attachment; filename="${archivos.xlsxFilename}"`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(archivos.xlsxBuffer);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.get('/exportar-mensual/pdf', requireGestorAsistencia, async (req, res) => {
    try {
        const { anio, mes } = parseAnioMesQuery(req.query.mes);
        const archivos = await asistenciaService.generarReporteMensualArchivos(anio, mes);
        res.setHeader('Content-Disposition', `attachment; filename="${archivos.pdfFilename}"`);
        res.setHeader('Content-Type', 'application/pdf');
        res.send(archivos.pdfBuffer);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.get('/exportar-semanal/xlsx', requireGestorAsistencia, async (req, res) => {
    try {
        const fecha = req.query.fecha ? String(req.query.fecha).trim() : null;
        const archivos = await asistenciaService.generarReporteSemanalBuffers(fecha);
        res.setHeader('Content-Disposition', `attachment; filename="${archivos.xlsxFilename}"`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(archivos.xlsxBuffer);
    } catch (e) {
        res.status(e.message && e.message.includes('inválido') ? 400 : 500).json({ error: e.message });
    }
});

router.get('/exportar-semanal/pdf', requireGestorAsistencia, async (req, res) => {
    try {
        const fecha = req.query.fecha ? String(req.query.fecha).trim() : null;
        const archivos = await asistenciaService.generarReporteSemanalBuffers(fecha);
        res.setHeader('Content-Disposition', `attachment; filename="${archivos.pdfFilename}"`);
        res.setHeader('Content-Type', 'application/pdf');
        res.send(archivos.pdfBuffer);
    } catch (e) {
        res.status(e.message && e.message.includes('inválido') ? 400 : 500).json({ error: e.message });
    }
});

router.post('/enviar-mensual', requireGestorAsistencia, async (req, res) => {
    try {
        const { anio, mes } = parseAnioMesQuery(req.body && req.body.mes);
        const forzar = Boolean(req.body && req.body.forzar);
        const resultado = await asistenciaService.enviarReporteMensual({
            anio,
            mes,
            forzar,
            usuarioTrigger: req.user
        });
        res.json(resultado);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// =============================================================
// 4. MATRÍCULA, ESTUDIANTES Y MIGRACIÓN DESDE GOOGLE SHEETS
// =============================================================

router.get('/estudiantes', requireAdminAsistencia, async (req, res) => {
    try {
        const { curso, retirados, q, anno } = req.query;
        const incluirRetirados = retirados === undefined ? true : (retirados === '1' || retirados === 'true');
        const lista = await asistenciaService.listarEstudiantes({
            curso: curso || null,
            incluirRetirados,
            busqueda: q || '',
            anno: anno || null
        });
        res.json(lista);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.post('/estudiantes', requireAdminAsistencia, async (req, res) => {
    try {
        const creado = await asistenciaService.crearEstudiante(req.body || {}, req.user);
        res.json({ success: true, estudiante: creado });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

router.put('/estudiantes/:id', requireAdminAsistencia, async (req, res) => {
    try {
        const actualizado = await asistenciaService.actualizarEstudiante(
            parseInt(req.params.id, 10),
            req.body || {},
            req.user
        );
        res.json({ success: true, estudiante: actualizado });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

router.patch('/estudiantes/:id/retirar', requireAdminAsistencia, async (req, res) => {
    try {
        const retirado = Boolean(req.body && req.body.retirado);
        const fechaRetiro = req.body ? req.body.fecha_retiro : undefined;
        const actualizado = await asistenciaService.actualizarEstudiante(
            parseInt(req.params.id, 10),
            { retirado, fecha_retiro: fechaRetiro },
            req.user
        );
        res.json({ success: true, estudiante: actualizado });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

router.post('/importar-migracion', requireAdminAsistencia, upload.single('archivo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Debe seleccionar un archivo Excel (.xlsx) o CSV.' });
        }
        const importarMes = req.body.importarAsistenciaMes === 'true' || req.body.importarAsistenciaMes === '1' || req.body.importarAsistenciaMes === true;
        const anioMes = req.body.anioMes || null;
        const anno = req.body.anno || null;

        const stats = await asistenciaService.importarDesdeLibroSheets(
            req.file.buffer,
            req.file.originalname,
            { importarAsistenciaMes: importarMes, anioMes, anno },
            req.user
        );
        res.json({ success: true, stats });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// =============================================================
// 5. DÍAS ESPECIALES (FERIADOS Y CLASES EXTRA), BLOQUE 1 Y CONFIG
// =============================================================

router.get('/dias-especiales', async (req, res) => {
    try {
        const rows = await asistenciaService.listarDiasEspeciales(req.query.anio || null);
        res.json(rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.post('/dias-especiales', requireAdminAsistencia, async (req, res) => {
    try {
        const row = await asistenciaService.agregarDiaEspecial(req.body || {}, req.user);
        res.json({ success: true, dia: row });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

router.delete('/dias-especiales/:id', requireAdminAsistencia, async (req, res) => {
    try {
        const ok = await asistenciaService.eliminarDiaEspecial(parseInt(req.params.id, 10), req.user);
        if (!ok) return res.status(404).json({ error: 'Registro no encontrado.' });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.post('/dias-especiales/importar-calendario', requireAdminAsistencia, async (req, res) => {
    try {
        const anio = parseInt((req.body && req.body.anio) || asistenciaService.obtenerFechaHoraChile().anno, 10);
        const r = await asistenciaService.importarFeriadosDesdeEventos(anio, req.user);
        res.json({ success: true, ...r });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.get('/bloque1-hoy', async (req, res) => {
    try {
        const { diaSemana, fecha } = asistenciaService.obtenerFechaHoraChile();
        const docentes = await asistenciaService.obtenerCursosPrimerBloque(diaSemana);
        res.json({
            fecha,
            dia_semana: diaSemana,
            total_docentes: docentes.length,
            docentes
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.post('/enviar-bloque1', requireAdminAsistencia, async (req, res) => {
    try {
        const { fecha, forzar } = req.body || {};
        const resultado = await asistenciaService.enviarResumenesBloque1({
            fecha,
            forzar: !!forzar,
            usuarioTrigger: req.user
        });
        res.json(resultado);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.get('/logs-envios', requireAdminAsistencia, async (req, res) => {
    try {
        const { fecha, limit = 50 } = req.query;
        const db = asistenciaService.getDb();
        let sql = `SELECT * FROM asistencia_envios_log`;
        const params = [];
        if (fecha) {
            sql += ` WHERE fecha = ?`;
            params.push(fecha);
        }
        sql += ` ORDER BY id DESC LIMIT ?`;
        params.push(parseInt(limit, 10) || 50);

        db.all(sql, params, (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows || []);
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.get('/config', requireAdminAsistencia, async (req, res) => {
    try {
        const config = await asistenciaService.obtenerConfiguracion();
        res.json(config);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.put('/config', requireAdminAsistencia, async (req, res) => {
    try {
        const config = await asistenciaService.guardarConfiguracion(req.body || {}, req.user);
        res.json({ success: true, config });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;
