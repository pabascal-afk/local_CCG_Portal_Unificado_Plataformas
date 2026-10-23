const express = require('express');
const router = express.Router();
const auditoria = require('../services/auditoria');

// Verificación de perfil administrativo o coordinación
function esAdminOCoordinacion(user) {
    if (!user) return false;
    const r = (user.rol || '').toLowerCase().trim();
    return r.includes('admin') || r.includes('directiv') || r.includes('coordinaci');
}

const authMiddleware = (req, res, next) => {
    if (req.isAuthenticated && req.isAuthenticated()) {
        if (esAdminOCoordinacion(req.user)) return next();
        return res.status(403).json({ error: 'Acceso denegado: El módulo de Auditoría es de uso exclusivo para Administración y Coordinación.' });
    }
    // En modo desarrollo local sin Google OAuth
    if (!process.env.GOOGLE_CLIENT_ID) return next();
    res.status(401).json({ error: 'No autenticado' });
};

router.use(authMiddleware);

// 1. Listado paginado de logs con filtros
router.get('/', async (req, res) => {
    try {
        const resultado = await auditoria.consultarLogs(req.query);
        res.json(resultado);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 2. Tarjetas KPI de resumen
router.get('/kpis', async (req, res) => {
    try {
        const kpis = await auditoria.obtenerKpisAuditoria();
        res.json(kpis);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 3. Exportación a Excel (.xlsx) o CSV
router.get('/exportar', async (req, res) => {
    try {
        const formato = (req.query.formato || 'xlsx').toLowerCase();
        const exportado = await auditoria.exportarLogs({
            ...req.query,
            formato
        });

        res.setHeader('Content-Type', exportado.mimeType);
        res.setHeader('Content-Disposition', `attachment; filename="${exportado.filename}"`);
        res.setHeader('Content-Length', exportado.buffer.length);
        res.send(exportado.buffer);

        // Registrar en auditoría la acción de exportación
        auditoria.registrarAuditoria({
            req,
            modulo: 'Configuración',
            accion: 'Exportar Reporte',
            nivel: 'info',
            entidad: 'Logs de Auditoría',
            descripcion: `Exportó registros de auditoría en formato ${formato.toUpperCase()}`
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 4. Detalle completo de un registro por ID
router.get('/:id', (req, res) => {
    const db = auditoria.getDb();
    db.get("SELECT * FROM logs_auditoria WHERE id = ?", [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Registro no encontrado' });

        let detallesParsed = null;
        if (row.detalles) {
            try { detallesParsed = JSON.parse(row.detalles); } catch(e) { detallesParsed = row.detalles; }
        }

        res.json({
            ...row,
            detalles_parsed: detallesParsed
        });
    });
});

// 5. Purgado de logs antiguos (solo Administradores)
router.post('/limpiar', async (req, res) => {
    try {
        const dias = parseInt(req.body.dias) || 180;
        const eliminados = await auditoria.limpiarLogsAntiguos(dias);

        auditoria.registrarAuditoria({
            req,
            modulo: 'Configuración',
            accion: 'Limpieza Logs',
            nivel: 'danger',
            entidad: 'Logs de Auditoría',
            descripcion: `Limpieza de logs antiguos: se eliminaron ${eliminados} registros con más de ${dias} días de antigüedad.`
        });

        res.json({ success: true, eliminados, message: `Se eliminaron ${eliminados} registros antiguos de auditoría.` });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;
