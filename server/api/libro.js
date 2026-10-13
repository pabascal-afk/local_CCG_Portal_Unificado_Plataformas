const express = require('express');
const router = express.Router();
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const xlsx = require('xlsx');
const nodemailer = require('nodemailer');

const dbPath = path.join(__dirname, '../db/colegio.db');
const db = new sqlite3.Database(dbPath);

// Promisified helpers
const run = (query, params = []) => new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
        if (err) reject(err);
        else resolve(this);
    });
});

const queryAll = (query, params = []) => new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
    });
});

// Multer memory storage (permite procesar archivos directamente en RAM)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 30 * 1024 * 1024 } // Máximo 30MB por archivo
});

// Verificación de rol administrativo o de coordinación
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
    // En modo desarrollo local sin OAuth configurado
    if (!process.env.GOOGLE_CLIENT_ID) {
        return next();
    }
    return res.status(401).json({ error: 'No autenticado' });
};

router.use(authMiddleware);

// ==========================================
// UTILIDADES DE PROCESAMIENTO Y FECHAS
// ==========================================

function formatearFechaTexto(val) {
    if (val === null || val === undefined) return '';
    if (typeof val === 'number') {
        try {
            const dateObj = xlsx.SSF.parse_date_code(val);
            if (dateObj) {
                const d = String(dateObj.d).padStart(2, '0');
                const m = String(dateObj.m).padStart(2, '0');
                const y = dateObj.y;
                return `${d}/${m}/${y}`;
            }
        } catch (e) {}
    }
    const str = String(val).trim();
    const matchDDMM = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (matchDDMM) {
        const d = String(matchDDMM[1]).padStart(2, '0');
        const m = String(matchDDMM[2]).padStart(2, '0');
        const y = matchDDMM[3];
        return `${d}/${m}/${y}`;
    }
    const matchISO = str.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
    if (matchISO) {
        const y = matchISO[1];
        const m = String(matchISO[2]).padStart(2, '0');
        const d = String(matchISO[3]).padStart(2, '0');
        return `${d}/${m}/${y}`;
    }
    return str;
}

// Extrae registros de un buffer Excel (.xlsx o .xls)
function parsearExcelLibro(buffer, nombreArchivo, blacklist = [], diasExcluidos = []) {
    const wb = xlsx.read(buffer, { type: 'buffer', cellDates: false, raw: false });
    const sheetName = wb.SheetNames[0];
    if (!sheetName) throw new Error('El archivo no contiene hojas de cálculo.');
    
    const sheet = wb.Sheets[sheetName];
    const rawData = xlsx.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: '' });
    
    if (!rawData || rawData.length < 3) {
        throw new Error('El archivo no cuenta con la estructura esperada del reporte de Libro Digital (mínimo 3 filas).');
    }
    
    const row0 = rawData[0] || [];
    const diasDetectados = [];
    
    // El reporte estándar posiciona fechas en la fila 0 cada 5 columnas iniciando en columna 1
    for (let col = 1; col < row0.length; col += 5) {
        const fechaRaw = row0[col];
        if (fechaRaw) {
            const fechaNorm = formatearFechaTexto(fechaRaw);
            if (fechaNorm) {
                diasDetectados.push({ colInicio: col, fecha: fechaNorm });
            }
        }
    }
    
    // Si no encontró por salto automático, probar saltos estándar de 5 columnas
    if (diasDetectados.length === 0) {
        for (let d = 0; d < 5; d++) {
            const col = 1 + (d * 5);
            if (col < row0.length && row0[col]) {
                const f = formatearFechaTexto(row0[col]);
                if (f) diasDetectados.push({ colInicio: col, fecha: f });
            }
        }
    }
    
    if (diasDetectados.length === 0) {
        throw new Error('No se detectaron cabeceras de fechas válidas en la primera fila del reporte.');
    }
    
    const blacklistNorm = (blacklist || []).map(b => String(b).trim().toLowerCase());
    const diasExcluidosNorm = (diasExcluidos || []).map(d => formatearFechaTexto(d));
    
    const filasExtraidas = [];
    
    for (let i = 2; i < rawData.length; i++) {
        const row = rawData[i];
        const nombreProfesor = (row[0] || '').toString().trim();
        if (!nombreProfesor) continue;
        
        const profNorm = nombreProfesor.toLowerCase();
        if (blacklistNorm.includes(profNorm)) continue; // Omitir docentes exentos
        
        for (const diaInfo of diasDetectados) {
            const col = diaInfo.colInicio;
            const fecha = diaInfo.fecha;
            
            if (diasExcluidosNorm.includes(fecha)) continue; // Omitir días feriados/excluidos
            
            const creadas = parseInt(row[col], 10) || 0;
            const requeridas = parseInt(row[col + 1], 10) || 0;
            const contenido = parseInt(row[col + 2], 10) || 0;
            const asistencia = parseInt(row[col + 3], 10) || 0;
            const firma = parseInt(row[col + 4], 10) || 0;
            
            // Solo registrar cuando había clases requeridas ese día
            if (requeridas > 0) {
                const critico = (creadas === 0) ? 1 : 0;
                filasExtraidas.push({
                    fecha,
                    profesor: nombreProfesor,
                    profesor_normalizado: profNorm,
                    creadas,
                    requeridas,
                    contenido,
                    asistencia,
                    firma,
                    critico,
                    archivo_origen: nombreArchivo
                });
            }
        }
    }
    
    return { diasDetectados, filasExtraidas };
}

// ==========================================
// ENDPOINTS DE CONFIGURACIÓN
// ==========================================

router.get('/config', async (req, res) => {
    try {
        const rows = await queryAll("SELECT clave, valor FROM libro_config");
        const config = {
            blacklist: [],
            dias_excluidos: [],
            destinatarios_admin: []
        };
        rows.forEach(r => {
            try { config[r.clave] = JSON.parse(r.valor); } catch (e) { config[r.clave] = []; }
        });
        res.json(config);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/config', async (req, res) => {
    try {
        const { blacklist, dias_excluidos, destinatarios_admin } = req.body;
        if (blacklist !== undefined) {
            await run("INSERT INTO libro_config (clave, valor) VALUES ('blacklist', ?) ON CONFLICT(clave) DO UPDATE SET valor=excluded.valor", [JSON.stringify(blacklist)]);
        }
        if (dias_excluidos !== undefined) {
            await run("INSERT INTO libro_config (clave, valor) VALUES ('dias_excluidos', ?) ON CONFLICT(clave) DO UPDATE SET valor=excluded.valor", [JSON.stringify(dias_excluidos)]);
        }
        if (destinatarios_admin !== undefined) {
            await run("INSERT INTO libro_config (clave, valor) VALUES ('destinatarios_admin', ?) ON CONFLICT(clave) DO UPDATE SET valor=excluded.valor", [JSON.stringify(destinatarios_admin)]);
        }
        res.json({ success: true, message: 'Configuración guardada correctamente.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// ENDPOINT: PROCESAMIENTO DE ARCHIVO INDIVIDUAL (COLA)
// ==========================================

router.post('/procesar-archivo', upload.single('archivo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se recibió ningún archivo.' });
        }
        
        const nombreArchivo = req.file.originalname || 'reporte.xlsx';
        
        // Obtener configuración de exclusión
        const configRows = await queryAll("SELECT clave, valor FROM libro_config");
        let blacklist = [];
        let diasExcluidos = [];
        configRows.forEach(r => {
            try {
                if (r.clave === 'blacklist') blacklist = JSON.parse(r.valor);
                if (r.clave === 'dias_excluidos') diasExcluidos = JSON.parse(r.valor);
            } catch (e) {}
        });
        
        const { diasDetectados, filasExtraidas } = parsearExcelLibro(req.file.buffer, nombreArchivo, blacklist, diasExcluidos);
        
        if (filasExtraidas.length === 0) {
            return res.json({
                success: true,
                filename: nombreArchivo,
                dias: diasDetectados.map(d => d.fecha),
                nuevos: 0,
                actualizados: 0,
                total: 0,
                mensaje: 'No se encontraron registros activos de clases en las fechas del archivo.'
            });
        }
        
        // Determinar cuáles ya existían para estadísticas precisas
        const fechasSet = Array.from(new Set(filasExtraidas.map(f => f.fecha)));
        const placeholders = fechasSet.map(() => '?').join(',');
        const existentes = await queryAll(
            `SELECT fecha || '|' || profesor_normalizado AS k FROM libro_registros WHERE fecha IN (${placeholders})`,
            fechasSet
        );
        const setExistentes = new Set(existentes.map(e => e.k));
        
        let nuevos = 0;
        let actualizados = 0;
        
        // Guardar cada registro con UPSERT atómico
        await run("BEGIN TRANSACTION");
        try {
            for (const f of filasExtraidas) {
                const key = f.fecha + '|' + f.profesor_normalizado;
                if (setExistentes.has(key)) {
                    actualizados++;
                } else {
                    nuevos++;
                    setExistentes.add(key);
                }
                
                await run(`
                    INSERT INTO libro_registros (
                        fecha, profesor, profesor_normalizado, creadas, requeridas,
                        contenido, asistencia, firma, critico, archivo_origen, actualizado_en
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                    ON CONFLICT(fecha, profesor_normalizado) DO UPDATE SET
                        profesor = excluded.profesor,
                        creadas = excluded.creadas,
                        requeridas = excluded.requeridas,
                        contenido = excluded.contenido,
                        asistencia = excluded.asistencia,
                        firma = excluded.firma,
                        critico = excluded.critico,
                        archivo_origen = excluded.archivo_origen,
                        actualizado_en = CURRENT_TIMESTAMP
                `, [
                    f.fecha, f.profesor, f.profesor_normalizado, f.creadas, f.requeridas,
                    f.contenido, f.asistencia, f.firma, f.critico, f.archivo_origen
                ]);
            }
            await run("COMMIT");
        } catch (e) {
            await run("ROLLBACK");
            throw e;
        }
        
        res.json({
            success: true,
            filename: nombreArchivo,
            dias: diasDetectados.map(d => d.fecha),
            nuevos,
            actualizados,
            total: filasExtraidas.length,
            mensaje: `Procesado: ${nuevos} nuevos registros y ${actualizados} actualizados.`
        });
    } catch (err) {
        console.error('Error procesando archivo de libro:', err);
        res.status(500).json({ error: err.message || 'Error procesando archivo Excel' });
    }
});

// ==========================================
// ENDPOINT: DASHBOARD Y CONSULTA DE REGISTROS
// ==========================================

router.get('/dashboard', async (req, res) => {
    try {
        // Cargar exclusiones
        const configRows = await queryAll("SELECT clave, valor FROM libro_config");
        let blacklist = [];
        let diasExcluidos = [];
        configRows.forEach(r => {
            try {
                if (r.clave === 'blacklist') blacklist = JSON.parse(r.valor);
                if (r.clave === 'dias_excluidos') diasExcluidos = JSON.parse(r.valor);
            } catch (e) {}
        });
        
        const blacklistNorm = blacklist.map(b => String(b).trim().toLowerCase());
        const diasExcluidosNorm = diasExcluidos.map(d => formatearFechaTexto(d));
        
        const todos = await queryAll(`
            SELECT id, fecha, profesor, profesor_normalizado, creadas, requeridas,
                   contenido, asistencia, firma, critico, archivo_origen, actualizado_en
            FROM libro_registros
            ORDER BY id ASC
        `);
        
        // Filtrar en memoria por si se agregaron nuevos exentos posteriormente
        const filtrados = todos.filter(item => {
            if (blacklistNorm.includes(item.profesor_normalizado)) return false;
            if (diasExcluidosNorm.includes(formatearFechaTexto(item.fecha))) return false;
            if (item.requeridas <= 0) return false;
            return true;
        });
        
        let countCriticos = 0;
        let countPendientes = 0;
        let countAlDia = 0;
        const profesoresSet = new Set();
        
        const registrosFormateados = filtrados.map(r => {
            profesoresSet.add(r.profesor);
            const esCrit = r.critico === 1 || (r.requeridas > 0 && r.creadas === 0);
            const esPend = !esCrit && (r.firma < r.requeridas);
            
            if (esCrit) countCriticos++;
            else if (esPend) countPendientes++;
            else countAlDia++;
            
            return {
                id: r.id,
                Fecha: r.fecha,
                Profesor: r.profesor,
                Creadas: r.creadas,
                Requeridas: r.requeridas,
                Contenido: r.contenido,
                Asistencia: r.asistencia,
                Firma: r.firma,
                Critico: esCrit,
                Pendiente: esPend,
                ArchivoOrigen: r.archivo_origen
            };
        });
        
        res.json({
            metricas: {
                totalRegistros: registrosFormateados.length,
                criticos: countCriticos,
                pendientes: countPendientes,
                alDia: countAlDia,
                totalProfesores: profesoresSet.size
            },
            registros: registrosFormateados
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// ENDPOINT: VACIAR REGISTROS
// ==========================================

router.delete('/registros', async (req, res) => {
    try {
        const { modo, fecha, archivo } = req.query;
        if (modo === 'todo') {
            await run("DELETE FROM libro_registros");
            return res.json({ success: true, message: 'Se eliminaron todos los registros del libro digital.' });
        }
        if (fecha) {
            await run("DELETE FROM libro_registros WHERE fecha = ?", [fecha]);
            return res.json({ success: true, message: `Registros de la fecha ${fecha} eliminados.` });
        }
        if (archivo) {
            await run("DELETE FROM libro_registros WHERE archivo_origen = ?", [archivo]);
            return res.json({ success: true, message: `Registros del archivo ${archivo} eliminados.` });
        }
        res.status(400).json({ error: 'Debe especificar el parámetro "modo=todo", "fecha" o "archivo".' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// ENDPOINTS DE CORREO (SMTP CENTRALIZADO)
// ==========================================

function crearTransporter() {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '465', 10),
        secure: (process.env.SMTP_SECURE === 'true' || !process.env.SMTP_SECURE),
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        },
        tls: { rejectUnauthorized: false }
    });
}

// 1. Envío de alertas individuales a docentes con pendientes
router.post('/enviar-alertas-docentes', async (req, res) => {
    try {
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            return res.status(400).json({ error: 'El servidor no tiene configuradas las credenciales SMTP en .env.' });
        }
        
        const transporter = crearTransporter();
        const registros = await queryAll("SELECT * FROM libro_registros WHERE critico = 1 OR firma < requeridas");
        const usuarios = await queryAll("SELECT email, nombre FROM usuarios");
        
        if (registros.length === 0) {
            return res.json({ success: true, enviados: 0, message: 'No hay docentes con pendientes para notificar.' });
        }
        
        // Mapear correo por nombre normalizado
        const normalize = (str) => (str || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
        const emailMap = new Map();
        usuarios.forEach(u => {
            if (u.email) {
                emailMap.set(normalize(u.nombre), u.email);
            }
        });
        
        // Agrupar faltas por docente
        const faltasPorDocente = new Map();
        registros.forEach(r => {
            const key = normalize(r.profesor);
            if (!faltasPorDocente.has(key)) {
                faltasPorDocente.set(key, {
                    nombre: r.profesor,
                    email: emailMap.get(key) || null,
                    faltas: []
                });
            }
            faltasPorDocente.get(key).faltas.push(r);
        });
        
        let enviados = 0;
        const noEncontrados = [];
        
        for (const [key, data] of faltasPorDocente.entries()) {
            if (!data.email) {
                noEncontrados.push(data.nombre);
                continue;
            }
            
            let tablaHtml = `
                <table border="1" cellpadding="6" style="border-collapse: collapse; width: 100%; font-family: sans-serif; font-size: 13px;">
                    <tr style="background-color: #f1f5f9; color: #1e293b;">
                        <th>Fecha</th>
                        <th>Clases (Creadas/Requeridas)</th>
                        <th>Estado</th>
                    </tr>
            `;
            
            data.faltas.forEach(f => {
                const esCrit = f.critico === 1 || f.creadas === 0;
                tablaHtml += `
                    <tr>
                        <td align="center">${f.fecha}</td>
                        <td align="center">${f.creadas}/${f.requeridas}</td>
                        <td style="color: ${esCrit ? '#dc2626' : '#d97706'}; font-weight: bold;">
                            ${esCrit ? '🚨 SIN CLASES CREADAS' : '✍️ FALTAN FIRMAS'}
                        </td>
                    </tr>
                `;
            });
            tablaHtml += `</table>`;
            
            const html = `
                <div style="font-family: Arial, sans-serif; color: #333; max-width: 650px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                    <h3 style="color: #1e293b;">Estimado/a ${data.nombre},</h3>
                    <p>Se han detectado las siguientes pendientes en el <b>Libro Digital</b> según el último reporte pedagógico:</p>
                    ${tablaHtml}
                    <p style="margin-top: 15px;">Por favor, regularizar en el sistema a la brevedad posible.</p>
                    <p style="color: #64748b; font-size: 12px; margin-top: 25px;">
                        Atentamente,<br>
                        <b>Coordinación Pedagógica - Colegio Cerro Grande</b>
                    </p>
                </div>
            `;
            
            await transporter.sendMail({
                from: `"Libro Digital - Colegio Cerro Grande" <${process.env.SMTP_USER}>`,
                to: data.email,
                subject: `Pendientes Libro Digital - ${data.nombre}`,
                html: html
            });
            enviados++;
        }
        
        res.json({
            success: true,
            enviados,
            sinCorreo: noEncontrados,
            message: `Se enviaron ${enviados} notificaciones por correo.`
        });
    } catch (err) {
        console.error('Error enviando alertas individuales:', err);
        res.status(500).json({ error: err.message });
    }
});

// 2. Envío de resumen consolidado a administradores / coordinación
router.post('/enviar-resumen-admin', async (req, res) => {
    try {
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            return res.status(400).json({ error: 'El servidor no tiene configuradas las credenciales SMTP en .env.' });
        }
        
        // Obtener destinatarios de la configuración
        const configRows = await queryAll("SELECT valor FROM libro_config WHERE clave = 'destinatarios_admin'");
        let destinatarios = [];
        if (configRows.length > 0) {
            try { destinatarios = JSON.parse(configRows[0].valor); } catch (e) {}
        }
        
        if (!destinatarios || destinatarios.length === 0) {
            destinatarios = ['pabascal@colegiocerrogrande.cl'];
        }
        
        const registros = await queryAll("SELECT * FROM libro_registros");
        
        const totalCriticos = registros.filter(f => f.critico === 1 || f.creadas === 0).length;
        const totalPendientes = registros.filter(f => f.critico === 0 && f.creadas > 0 && f.firma < f.requeridas).length;
        
        const resumenProfesores = {};
        registros.forEach(f => {
            if (!resumenProfesores[f.profesor]) {
                resumenProfesores[f.profesor] = { sinCrear: 0, sinFirmar: 0 };
            }
            if (f.critico === 1 || f.creadas === 0) {
                resumenProfesores[f.profesor].sinCrear++;
            } else if (f.firma < f.requeridas) {
                resumenProfesores[f.profesor].sinFirmar++;
            }
        });
        
        const profesConProblemas = Object.keys(resumenProfesores)
            .filter(p => resumenProfesores[p].sinCrear > 0 || resumenProfesores[p].sinFirmar > 0)
            .sort((a, b) => (resumenProfesores[b].sinCrear + resumenProfesores[b].sinFirmar) - (resumenProfesores[a].sinCrear + resumenProfesores[a].sinFirmar));
            
        let filasTabla = '';
        profesConProblemas.forEach(prof => {
            const sc = resumenProfesores[prof].sinCrear;
            const sf = resumenProfesores[prof].sinFirmar;
            filasTabla += `
                <tr>
                    <td style="padding: 8px;">${prof}</td>
                    <td style="padding: 8px; text-align: center; color: ${sc > 0 ? '#dc2626' : '#64748b'}; font-weight: ${sc > 0 ? 'bold' : 'normal'};">${sc}</td>
                    <td style="padding: 8px; text-align: center; color: ${sf > 0 ? '#d97706' : '#64748b'}; font-weight: ${sf > 0 ? 'bold' : 'normal'};">${sf}</td>
                </tr>
            `;
        });
        
        const tablaHtml = `
            <table border="1" cellpadding="6" style="border-collapse: collapse; width: 100%; margin-top: 15px; font-family: sans-serif; font-size: 13px;">
                <tr style="background-color: #f1f5f9; color: #1e293b;">
                    <th style="text-align: left;">Profesor</th>
                    <th>Días sin Crear Clases</th>
                    <th>Días sin Firmar</th>
                </tr>
                ${filasTabla}
            </table>
        `;
        
        const html = `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 700px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h2 style="color: #1e293b; margin-top: 0;">Resumen de Libro Digital - Coordinación</h2>
                <div style="display: flex; gap: 15px; margin-bottom: 20px;">
                    <p style="margin: 5px 0;">🚨 <b>Días totales sin clases creadas:</b> <span style="color: #dc2626;">${totalCriticos}</span></p>
                    <p style="margin: 5px 0;">✍️ <b>Días totales con firmas pendientes:</b> <span style="color: #d97706;">${totalPendientes}</span></p>
                </div>
                ${profesConProblemas.length > 0 ? tablaHtml : '<p style="color: #10b981; font-weight: bold;">✅ No hay pendientes registrados en el sistema.</p>'}
                <p style="color: #64748b; font-size: 12px; margin-top: 25px;">
                    Generado automáticamente desde el módulo de Libro Digital de la Plataforma Unificada.
                </p>
            </div>
        `;
        
        const transporter = crearTransporter();
        for (const dest of destinatarios) {
            if (!dest || !dest.includes('@')) continue;
            await transporter.sendMail({
                from: `"Libro Digital - Coordinación" <${process.env.SMTP_USER}>`,
                to: dest.trim(),
                subject: `Resumen de Libro Digital - Colegio Cerro Grande`,
                html: html
            });
        }
        
        res.json({
            success: true,
            destinatarios,
            totalCriticos,
            totalPendientes,
            message: `Resumen enviado a ${destinatarios.length} destinatarios de coordinación.`
        });
    } catch (err) {
        console.error('Error enviando resumen de coordinación:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
