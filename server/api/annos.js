/**
 * Router API de Gestión de Años Escolares (annos)
 */

const express = require('express');
const router = express.Router();
const annosService = require('../services/annos');

// Middleware de autenticación y permisos
function authMiddleware(req, res, next) {
    if (req.isAuthenticated && req.isAuthenticated()) {
        const rolNorm = (req.user.rol || '').toLowerCase();
        req.esAdmin = rolNorm.includes('admin') || rolNorm.includes('directiv');
        req.esCoordinacion = rolNorm.includes('coordinaci');
        req.esAdminOCoordinacion = req.esAdmin || req.esCoordinacion;
        return next();
    }
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

// 1. Listar todos los años escolares con estadísticas
router.get('/', async (req, res) => {
    try {
        const data = await annosService.listarAnnos();
        res.json(data);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 2. Obtener año activo predeterminado
router.get('/activo', async (req, res) => {
    try {
        const data = await annosService.obtenerAnnoActivo();
        res.json(data);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 3. Crear nuevo año escolar (ej. 2027)
router.post('/', async (req, res) => {
    if (!req.esAdminOCoordinacion) {
        return res.status(403).json({ error: 'Acceso denegado: Solo Administración o Coordinación pueden crear nuevos años escolares.' });
    }
    try {
        const resultado = await annosService.crearAnno(req.body, req.user);
        res.json(resultado);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// 4. Actualizar fechas y estado del año
router.put('/:anno', async (req, res) => {
    if (!req.esAdminOCoordinacion) {
        return res.status(403).json({ error: 'Acceso denegado: Solo Administración o Coordinación pueden modificar años escolares.' });
    }
    try {
        const resultado = await annosService.actualizarAnno(req.params.anno, req.body, req.user);
        res.json(resultado);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// 5. Establecer año como activo predeterminado
router.post('/:anno/activar', async (req, res) => {
    if (!req.esAdminOCoordinacion) {
        return res.status(403).json({ error: 'Acceso denegado: Solo Administración o Coordinación pueden cambiar el año predeterminado.' });
    }
    try {
        const resultado = await annosService.establecerAnnoActivo(req.params.anno, req.user);
        res.json(resultado);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// 6. Clonar horarios interanuales
router.post('/:anno/clonar-horarios', async (req, res) => {
    if (!req.esAdminOCoordinacion) {
        return res.status(403).json({ error: 'Acceso denegado: Solo Administración o Coordinación pueden clonar mallas horarias.' });
    }
    try {
        const { anno_origen } = req.body;
        if (!anno_origen) return res.status(400).json({ error: 'Debe especificar el año de origen.' });
        const resultado = await annosService.clonarHorariosInteranual(anno_origen, req.params.anno, req.user);
        res.json(resultado);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// 7. Promover planificaciones aprobadas
router.post('/:anno/promover-planificaciones', async (req, res) => {
    if (!req.esAdminOCoordinacion) {
        return res.status(403).json({ error: 'Acceso denegado: Solo Administración o Coordinación pueden promover planificaciones.' });
    }
    try {
        const { anno_origen, plan_ids, solo_visadas } = req.body;
        if (!anno_origen) return res.status(400).json({ error: 'Debe especificar el año de origen.' });
        const resultado = await annosService.promoverPlanificacionesInteranual(
            anno_origen,
            req.params.anno,
            { planIds: plan_ids, soloVisadas: solo_visadas !== false },
            req.user
        );
        res.json(resultado);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// 8. Cerrar año escolar (Modo Histórico Solo Lectura)
router.post('/:anno/cerrar', async (req, res) => {
    if (!req.esAdminOCoordinacion) {
        return res.status(403).json({ error: 'Acceso denegado: Solo Administración o Coordinación pueden cerrar un año escolar.' });
    }
    try {
        const resultado = await annosService.cerrarAnno(req.params.anno, req.user);
        res.json(resultado);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

module.exports = router;
