const express = require('express');
const router = express.Router();
const mailer = require('../services/mailer');

// Verificación de rol administrativo o coordinación
function esAdminOCoordinacion(user) {
    if (!user) return false;
    const r = (user.rol || '').toLowerCase().trim();
    return r.includes('admin') || r.includes('directiv') || r.includes('coordinaci') || r.includes('convivencia');
}

const authMiddleware = (req, res, next) => {
    if (req.isAuthenticated && req.isAuthenticated()) {
        if (esAdminOCoordinacion(req.user)) return next();
        return res.status(403).json({ error: 'Acceso denegado: Este módulo es de uso exclusivo para Administración y Coordinación.' });
    }
    // En modo desarrollo local
    next();
};

router.use(authMiddleware);

// Datos simulados para previsualización y pruebas
const MOCK_DATA = {
    reserva_confirmada: {
        profesor_nombre: 'Prof. Carlos Mendoza',
        profesor_email: 'cmendoza@colegiocerrogrande.cl',
        recurso: 'Laboratorio de Ciencias',
        fecha: '2026-10-25',
        bloques: 'Bloque 3 (10:15 - 11:00), Bloque 4 (11:00 - 11:45)',
        motivo: 'Experimento de fotosíntesis con 8° Básico A'
    },
    reserva_peticion_especial: {
        profesor_email: 'cmendoza@colegiocerrogrande.cl',
        recurso: 'Laboratorio de Computación',
        fecha: '2026-10-27',
        bloques: 'Bloque 5, Bloque 6',
        motivo: 'Evaluación digital extraordinaria SIMCE',
        enlace_aprobar: '#aprobar-demo',
        enlace_rechazar: '#rechazar-demo'
    },
    reserva_resultado_especial: {
        profesor_nombre: 'Prof. Carlos Mendoza',
        profesor_email: 'cmendoza@colegiocerrogrande.cl',
        recurso: 'Laboratorio de Computación',
        fecha: '2026-10-27',
        bloques: 'Bloque 5, Bloque 6',
        motivo: 'Evaluación digital extraordinaria SIMCE',
        estado: 'Aprobada',
        color_estado: '#28a745'
    },
    reserva_cancelacion_tardia: {
        profesor_email: 'mrodriguez@colegiocerrogrande.cl',
        recurso: 'Cancha Techada',
        fecha: '2026-10-22',
        bloques: 'Bloque 1 y 2',
        motivo: 'Clase suspendida por salida pedagógica'
    },
    evaluacion_entrega: {
        coordinador_nombre: 'Coordinación Académica',
        profesor_nombre: 'Prof. Andrea Soto',
        curso: '1° Medio B',
        asignatura: 'Matemática',
        fecha: '2026-10-28',
        tipo: '📝 Prueba Escrita',
        instrucciones: 'Imprimir 38 copias a doble cara, corcheteadas en la esquina superior izquierda.',
        link_doc: 'https://docs.google.com/document/d/demo12345/edit',
        bloque_link_doc: '<p style="margin: 12px 0;"><b>Enlace Google Docs:</b> <a href="https://docs.google.com/document/d/demo12345/edit" style="color: #2563eb;">https://docs.google.com/document/d/demo12345/edit</a></p>'
    },
    libro_alertas_docentes: {
        profesor_nombre: 'Prof. Juan Pérez',
        profesor_email: 'jperez@colegiocerrogrande.cl',
        nombre_original: 'PEREZ GONZALEZ JUAN PABLO',
        aclaracion_nombre: '<p style="color: #64748b; font-size: 12px; margin-top: -8px; margin-bottom: 15px;">Registrado en el reporte como: <i>PEREZ GONZALEZ JUAN PABLO</i></p>',
        tabla_pendientes_html: '<table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 10px;"><tr style="background: #f1f5f9;"><th style="padding: 8px; border: 1px solid #cbd5e1; text-align: left;">Fecha</th><th style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Sin Clases</th><th style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Sin Firma</th></tr><tr><td style="padding: 8px; border: 1px solid #cbd5e1;">2026-10-18</td><td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; color: #dc2626; font-weight: bold;">🚨 Sí</td><td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; color: #d97706; font-weight: bold;">✍️ Sí</td></tr></table>'
    },
    libro_resumen_admin: {
        total_criticos: '14',
        total_pendientes: '28',
        tabla_resumen_html: '<table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 10px;"><tr style="background: #f1f5f9;"><th style="padding: 8px; border: 1px solid #cbd5e1; text-align: left;">Docente</th><th style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Sin Clases</th><th style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">Sin Firmas</th></tr><tr><td style="padding: 8px; border: 1px solid #cbd5e1;">Juan Pérez</td><td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; color: #dc2626; font-weight: bold;">3</td><td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; color: #d97706; font-weight: bold;">5</td></tr><tr><td style="padding: 8px; border: 1px solid #cbd5e1;">María Gómez</td><td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; color: #dc2626; font-weight: bold;">2</td><td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; color: #d97706; font-weight: bold;">4</td></tr></table>'
    },
    actividad_solicitud_autorizacion: {
        solicitante: 'Prof. Felipe Valenzuela',
        titulo: 'Feria de Ciencias y Tecnología 2026',
        fecha: '2026-11-12',
        bloques: 'Bloques 1 al 4 (08:00 - 11:45)',
        desc_recurso: 'Patio Central + 25 mesas y 50 sillas',
        enlace_aprobar: '#aprobar-demo',
        enlace_rechazar: '#rechazar-demo'
    },
    actividad_resultado_estado: {
        solicitante: 'Prof. Felipe Valenzuela',
        titulo: 'Feria de Ciencias y Tecnología 2026',
        fecha: '2026-11-12',
        estado: 'Aprobada',
        color_estado: '#28a745'
    },
    actividad_recordatorio_cron: {
        titulo: 'Feria de Ciencias y Tecnología 2026',
        fecha: '2026-11-12',
        bloques: 'Bloques 1 al 4 (08:00 - 11:45)'
    },
    evento_visitas_externas: {
        usuario_email: 'fvalenzuela@colegiocerrogrande.cl',
        evento_texto: 'Charla Vocacional Universidades Regionales',
        fecha: '2026-11-05',
        lista_externos_html: '<ul style="margin: 0; padding-left: 20px;"><li><b>Nombre:</b> Rodrigo Castillo | <b>RUT:</b> 15.342.112-9 | <b>Motivo:</b> Expositor UCN</li><li><b>Nombre:</b> Daniela Morales | <b>RUT:</b> 17.892.451-3 | <b>Motivo:</b> Coordinadora Admisión UST</li></ul>'
    }
};

// =============================================================
// RUTAS DE LA COLA DE CORREOS
// =============================================================

// 1. Métricas de la cola
router.get('/cola/metricas', async (req, res) => {
    try {
        const metricas = await mailer.obtenerMetricasCola();
        metricas.smtp_configurado = Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
        metricas.smtp_usuario = process.env.SMTP_USER || null;
        res.json(metricas);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Listado paginado de la cola con filtros
router.get('/cola', (req, res) => {
    const db = mailer.getDb();
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(10, parseInt(req.query.limit) || 25));
    const offset = (page - 1) * limit;

    const estado = req.query.estado || 'todos';
    const modulo = req.query.modulo || 'todos';
    const q = (req.query.q || '').trim();

    let whereClauses = [];
    let params = [];

    if (estado !== 'todos') {
        whereClauses.push('estado = ?');
        params.push(estado);
    }

    if (modulo !== 'todos') {
        whereClauses.push('modulo = ?');
        params.push(modulo);
    }

    if (q) {
        whereClauses.push('(destinatario LIKE ? OR asunto LIKE ?)');
        params.push(`%${q}%`, `%${q}%`);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(*) as total FROM cola_correos ${whereSql}`;
    db.get(countSql, params, (errCount, countRow) => {
        if (errCount) return res.status(500).json({ error: errCount.message });

        const total = countRow ? countRow.total : 0;
        const totalPages = Math.ceil(total / limit) || 1;

        const dataSql = `SELECT id, destinatario, asunto, modulo, tipo_plantilla, estado, intentos, max_intentos, ultimo_error, proximo_intento, creado_en, enviado_en, actualizado_en 
                         FROM cola_correos ${whereSql} 
                         ORDER BY id DESC LIMIT ? OFFSET ?`;

        db.all(dataSql, [...params, limit, offset], (errData, rows) => {
            if (errData) return res.status(500).json({ error: errData.message });
            res.json({
                total,
                page,
                limit,
                totalPages,
                items: rows || []
            });
        });
    });
});

// 3. Detalle completo de un correo en la cola
router.get('/cola/:id', (req, res) => {
    const db = mailer.getDb();
    db.get("SELECT * FROM cola_correos WHERE id = ?", [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Correo no encontrado en la cola.' });
        res.json(row);
    });
});

// 4. Disparar procesamiento del worker manualmente
router.post('/cola/procesar', async (req, res) => {
    try {
        const resultado = await mailer.procesarCola(30);
        res.json({ success: true, resultado });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. Reintentar un correo específico
router.post('/cola/:id/reintentar', async (req, res) => {
    try {
        const ok = await mailer.reintentarCorreo(req.params.id);
        if (!ok) return res.status(404).json({ error: 'Correo no encontrado en la cola.' });
        res.json({ success: true, message: 'Correo reprogramado para reintento inmediato.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 6. Eliminar un correo de la cola
router.delete('/cola/:id', async (req, res) => {
    try {
        const ok = await mailer.eliminarDeCola(req.params.id);
        if (!ok) return res.status(404).json({ error: 'Correo no encontrado.' });
        res.json({ success: true, message: 'Correo eliminado de la cola.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 7. Limpiar correos antiguos ya procesados o fallidos
router.post('/cola/limpiar', async (req, res) => {
    try {
        const dias = parseInt(req.body.dias) || 15;
        const eliminados = await mailer.limpiarCola(dias);
        res.json({ success: true, eliminados, message: `Se limpiaron ${eliminados} correos antiguos de más de ${dias} días.` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// =============================================================
// RUTAS DE PLANTILLAS ("MAIL TIPO")
// =============================================================

// 8. Listado de plantillas
router.get('/plantillas', (req, res) => {
    const db = mailer.getDb();
    db.all("SELECT * FROM plantillas_correo ORDER BY modulo ASC, nombre ASC", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows || []);
    });
});

// 9. Obtener una plantilla por su clave
router.get('/plantillas/:clave', async (req, res) => {
    try {
        const plantilla = await mailer.obtenerPlantilla(req.params.clave);
        if (!plantilla) return res.status(404).json({ error: 'Plantilla no encontrada.' });
        res.json(plantilla);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 10. Actualizar plantilla ("mail tipo")
router.put('/plantillas/:clave', (req, res) => {
    const { asunto, saludo_tipo, cuerpo_html, pie_tipo } = req.body;
    if (!asunto || !cuerpo_html) {
        return res.status(400).json({ error: 'El asunto y el cuerpo del correo son obligatorios.' });
    }

    const db = mailer.getDb();
    const sql = `UPDATE plantillas_correo 
                 SET asunto = ?, saludo_tipo = ?, cuerpo_html = ?, pie_tipo = ?, actualizado_en = CURRENT_TIMESTAMP 
                 WHERE clave = ?`;

    db.run(sql, [asunto, saludo_tipo || '', cuerpo_html, pie_tipo || '', req.params.clave], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Plantilla no encontrada.' });
        res.json({ success: true, message: 'Plantilla actualizada exitosamente.' });
    });
});

// 11. Restaurar plantilla a los valores predeterminados
router.post('/plantillas/:clave/restaurar', async (req, res) => {
    const clave = req.params.clave;
    const def = mailer.PLANTILLAS_DEFAULT[clave];
    if (!def) return res.status(404).json({ error: 'No existe una versión predeterminada para esta plantilla.' });

    const db = mailer.getDb();
    const sql = `UPDATE plantillas_correo 
                 SET asunto = ?, saludo_tipo = ?, cuerpo_html = ?, pie_tipo = ?, variables_disponibles = ?, actualizado_en = CURRENT_TIMESTAMP 
                 WHERE clave = ?`;

    db.run(sql, [def.asunto, def.saludo_tipo, def.cuerpo_html, def.pie_tipo, def.variables_disponibles, clave], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, plantilla: def, message: 'Plantilla restaurada a los valores predeterminados de fábrica.' });
    });
});

// 12. Previsualizar plantilla con datos de prueba
router.post('/plantillas/:clave/previsualizar', async (req, res) => {
    try {
        const clave = req.params.clave;
        let plantilla = await mailer.obtenerPlantilla(clave);
        if (!plantilla) {
            plantilla = mailer.PLANTILLAS_DEFAULT[clave];
        }
        if (!plantilla) return res.status(404).json({ error: 'Plantilla no encontrada.' });

        // Si el cliente envía modificaciones en tiempo real en el body, usarlas:
        const draft = {
            asunto: req.body.asunto || plantilla.asunto,
            saludo_tipo: req.body.saludo_tipo !== undefined ? req.body.saludo_tipo : plantilla.saludo_tipo,
            cuerpo_html: req.body.cuerpo_html || plantilla.cuerpo_html,
            pie_tipo: req.body.pie_tipo !== undefined ? req.body.pie_tipo : plantilla.pie_tipo
        };

        const mockVars = Object.assign({}, MOCK_DATA[clave] || {}, req.body.variables || {});
        const render = mailer.renderizarPlantilla(draft, mockVars);

        res.json({
            success: true,
            asunto: render.asunto,
            saludo: render.saludo,
            cuerpo: render.cuerpo,
            pie: render.pie,
            html: render.html
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 13. Enviar correo de prueba a la cuenta del usuario o destinatario indicado
router.post('/plantillas/:clave/prueba', async (req, res) => {
    try {
        const clave = req.params.clave;
        const destinatario = (req.body.destinatario || (req.user && req.user.email) || process.env.SMTP_USER || '').trim();
        if (!destinatario || !destinatario.includes('@')) {
            return res.status(400).json({ error: 'Debes indicar un correo de destino válido para la prueba.' });
        }

        let plantilla = await mailer.obtenerPlantilla(clave);
        if (!plantilla) plantilla = mailer.PLANTILLAS_DEFAULT[clave];
        if (!plantilla) return res.status(404).json({ error: 'Plantilla no encontrada.' });

        // Posibles cambios no guardados
        const draft = {
            asunto: req.body.asunto || plantilla.asunto,
            saludo_tipo: req.body.saludo_tipo !== undefined ? req.body.saludo_tipo : plantilla.saludo_tipo,
            cuerpo_html: req.body.cuerpo_html || plantilla.cuerpo_html,
            pie_tipo: req.body.pie_tipo !== undefined ? req.body.pie_tipo : plantilla.pie_tipo
        };

        const mockVars = Object.assign({}, MOCK_DATA[clave] || {}, req.body.variables || {});
        // Añadir prefijo [PRUEBA] al asunto
        const render = mailer.renderizarPlantilla(draft, mockVars);
        const asuntoPrueba = `[PRUEBA] ${render.asunto}`;

        const idCola = await mailer.encolarCorreo({
            destinatario,
            asunto: asuntoPrueba,
            cuerpo_html: render.html,
            modulo: plantilla.modulo || 'Prueba',
            tipo_plantilla: clave
        });

        res.json({
            success: true,
            idCola,
            destinatario,
            asunto: asuntoPrueba,
            message: `Correo de prueba encolado para ${destinatario}. Se procesará en segundo plano.`
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
