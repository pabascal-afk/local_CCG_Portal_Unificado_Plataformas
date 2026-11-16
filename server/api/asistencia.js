/**
 * Router API del Módulo de Asistencia Diaria
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const asistenciaService = require('../services/asistencia');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 15 * 1024 * 1024 } // 15MB
});

// Middleware de Autenticación
function authMiddleware(req, res, next) {
    if (req.isAuthenticated && req.isAuthenticated()) {
        const rolNorm = (req.user.rol || '').toLowerCase();
        req.esAdmin = rolNorm.includes('admin') || rolNorm.includes('directiv');
        req.esCoordinacion = rolNorm.includes('coordinaci');
        req.esAdminOCoordinacion = req.esAdmin || req.esCoordinacion;
        return next();
    }
    // En modo desarrollo local
    if (!process.env.GOOGLE_CLIENT_ID) {
        req.user = req.user || {
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

// 1. Obtener Asistencia de Hoy (con desglose personal para el docente autenticado)
router.get('/hoy', async (req, res) => {
    try {
        const { fecha: hoyStr, diaSemana } = asistenciaService.obtenerFechaHoraChile();
        const data = await asistenciaService.obtenerAsistenciaFecha(hoyStr);

        // Si es profesor o quiere ver sus cursos de Bloque 1
        const docentesBloque1 = await asistenciaService.obtenerCursosPrimerBloque(diaSemana);
        const userEmail = (req.user && req.user.email) ? req.user.email.toLowerCase().trim() : '';
        const userNombreNorm = (req.user && req.user.nombre) ? (req.user.nombre.toUpperCase().trim()) : '';

        // Buscar si este docente tiene cursos en bloque 1
        let misCursosInfo = null;
        for (const doc of docentesBloque1) {
            if ((doc.profesor_email && doc.profesor_email.toLowerCase() === userEmail) ||
                (doc.profesor_nombre && doc.profesor_nombre.toUpperCase().includes(userNombreNorm))) {
                misCursosInfo = doc;
                break;
            }
        }

        let misCursosAsistencia = [];
        if (misCursosInfo && misCursosInfo.cursos) {
            const cursosMap = new Map();
            data.cursos.forEach(c => cursosMap.set(c.curso_normalizado, c));

            misCursosAsistencia = misCursosInfo.cursos.map(c => {
                const asist = cursosMap.get(c.curso_normalizado) || {
                    matricula_total: 0,
                    presentes: 0,
                    ausentes: 0,
                    porcentaje: 0,
                    alumnos_ausentes: []
                };
                return {
                    ...c,
                    ...asist
                };
            });
        }

        res.json({
            ...data,
            dia_semana: diaSemana,
            usuario_actual: {
                nombre: req.user.nombre,
                email: req.user.email,
                rol: req.user.rol,
                esAdmin: req.esAdminOCoordinacion
            },
            mis_cursos_bloque1: misCursosAsistencia
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 2. Obtener Asistencia por Fecha Específica
router.get('/fecha/:fecha', async (req, res) => {
    try {
        const data = await asistenciaService.obtenerAsistenciaFecha(req.params.fecha);
        res.json(data);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 3. Obtener Cursos y Docentes de Primer Bloque Hoy
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

// 4. Sincronizar en Vivo desde Google Sheets
router.post('/sincronizar', async (req, res) => {
    try {
        const { url, gid, fecha } = req.body || {};
        const resultado = await asistenciaService.descargarYProcesarGoogleSheet(url, gid, fecha, req.user);
        res.json(resultado);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 5. Carga Manual de Archivo Excel (.xlsx) o CSV de Asistencia
router.post('/subir', upload.single('archivo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se subió ningún archivo.' });
        }
        const fecha = req.body.fecha || null;
        const resultado = await asistenciaService.procesarArchivoLocal(req.file.buffer, req.file.originalname, fecha, req.user);
        res.json(resultado);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 6. Enviar Manualmente o Probar Envíos de Bloque 1 (12:00 PM)
router.post('/enviar-bloque1', async (req, res) => {
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

// 7. Historial de Envíos de Correo
router.get('/logs-envios', async (req, res) => {
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

// 8. Configuración del Módulo
router.get('/config', async (req, res) => {
    try {
        const config = await asistenciaService.obtenerConfiguracion();
        res.json(config);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.put('/config', async (req, res) => {
    try {
        if (!req.esAdminOCoordinacion) {
            return res.status(403).json({ error: 'Solo administradores o coordinación pueden modificar la configuración de asistencia.' });
        }
        const config = await asistenciaService.guardarConfiguracion(req.body, req.user);
        res.json({ success: true, config });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;
