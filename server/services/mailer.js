const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const nodemailer = require('nodemailer');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', 'db', 'colegio.db');
let db = null;

function getDb() {
    if (!db) {
        db = new sqlite3.Database(dbPath);
    }
    return db;
}

// -------------------------------------------------------------
// Catálogo de Plantillas Predeterminadas (Fallback siempre activo)
// -------------------------------------------------------------
const PLANTILLAS_DEFAULT = {
    reserva_confirmada: {
        clave: 'reserva_confirmada',
        modulo: 'Recursos',
        nombre: 'Confirmación de Reserva de Recurso',
        descripcion: 'Notificación enviada al docente cuando agenda exitosamente un recurso institucional.',
        asunto: 'Confirmación de Reserva - {{recurso}}',
        saludo_tipo: 'Buen día {{profesor_nombre}},',
        cuerpo_html: `<p>Tu reserva se ha ingresado exitosamente en el sistema.</p>
<div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 15px; margin: 15px 0;">
  <p style="margin: 4px 0;"><b>Recurso:</b> {{recurso}}</p>
  <p style="margin: 4px 0;"><b>Fecha:</b> {{fecha}}</p>
  <p style="margin: 4px 0;"><b>Bloques:</b> {{bloques}}</p>
  <p style="margin: 4px 0;"><b>Motivo:</b> {{motivo}}</p>
</div>
<p>Gracias por utilizar la plataforma institucional.</p>`,
        pie_tipo: 'Colegio Cerro Grande - Sistema de Gestión de Recursos',
        variables_disponibles: JSON.stringify([
            { var: 'profesor_nombre', desc: 'Nombre del docente solicitante' },
            { var: 'profesor_email', desc: 'Correo electrónico del docente' },
            { var: 'recurso', desc: 'Nombre del recurso o espacio reservado' },
            { var: 'fecha', desc: 'Fecha de la reserva (AAAA-MM-DD)' },
            { var: 'bloques', desc: 'Bloques horarios reservados' },
            { var: 'motivo', desc: 'Motivo o uso pedagógico declarado' }
        ])
    },

    reserva_peticion_especial: {
        clave: 'reserva_peticion_especial',
        modulo: 'Recursos',
        nombre: 'Petición Especial de Reserva (Sobrecupo)',
        descripcion: 'Enviado al encargado del recurso cuando un docente solicita bloques que exceden el cupo semanal.',
        asunto: '⚠️ Petición Especial de Reserva: {{recurso}} ({{fecha}})',
        saludo_tipo: 'Estimado/a Encargado/a de Recurso,',
        cuerpo_html: `<p>El docente <b>{{profesor_email}}</b> ha solicitado bloques que superan el cupo semanal configurado para este recurso.</p>
<div style="background: #fdfbf7; border: 1px solid #f3e5ab; border-radius: 6px; padding: 15px; margin: 15px 0;">
  <p style="margin: 4px 0;"><b>Recurso:</b> {{recurso}}</p>
  <p style="margin: 4px 0;"><b>Fecha:</b> {{fecha}}</p>
  <p style="margin: 4px 0;"><b>Bloques Solicitados:</b> {{bloques}}</p>
  <p style="margin: 4px 0;"><b>Motivo:</b> {{motivo}}</p>
</div>
<p>Para autorizar o rechazar esta solicitud, utiliza los siguientes botones:</p>
<div style="margin-top: 25px; text-align: center;">
  <a href="{{enlace_aprobar}}" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-right: 15px; display: inline-block;">Aprobar Reserva</a>
  <a href="{{enlace_rechazar}}" style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Rechazar</a>
</div>`,
        pie_tipo: 'Colegio Cerro Grande - Plataforma Unificada',
        variables_disponibles: JSON.stringify([
            { var: 'profesor_email', desc: 'Correo del docente solicitante' },
            { var: 'recurso', desc: 'Nombre del recurso' },
            { var: 'fecha', desc: 'Fecha programada' },
            { var: 'bloques', desc: 'Bloques horarios' },
            { var: 'motivo', desc: 'Motivo de la excepción' },
            { var: 'enlace_aprobar', desc: 'Enlace para aprobar directamente' },
            { var: 'enlace_rechazar', desc: 'Enlace para rechazar directamente' }
        ])
    },

    reserva_resultado_especial: {
        clave: 'reserva_resultado_especial',
        modulo: 'Recursos',
        nombre: 'Resultado de Petición Especial de Reserva',
        descripcion: 'Enviado al docente solicitante cuando el encargado aprueba o rechaza su solicitud excepcional.',
        asunto: 'Resultado Petición Especial: {{estado}} - {{recurso}}',
        saludo_tipo: 'Buen día {{profesor_nombre}},',
        cuerpo_html: `<p>Te informamos que tu petición especial de reserva ha sido <b>{{estado}}</b>.</p>
<div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 15px; margin: 15px 0;">
  <p style="margin: 4px 0;"><b>Recurso:</b> {{recurso}}</p>
  <p style="margin: 4px 0;"><b>Fecha:</b> {{fecha}}</p>
  <p style="margin: 4px 0;"><b>Bloques:</b> {{bloques}}</p>
  <p style="margin: 4px 0;"><b>Motivo:</b> {{motivo}}</p>
  <p style="margin: 4px 0;"><b>Resolución:</b> <span style="font-weight: bold; color: {{color_estado}};">{{estado}}</span></p>
</div>`,
        pie_tipo: 'Colegio Cerro Grande - Sistema de Gestión de Recursos',
        variables_disponibles: JSON.stringify([
            { var: 'profesor_nombre', desc: 'Nombre del docente' },
            { var: 'profesor_email', desc: 'Correo del docente' },
            { var: 'recurso', desc: 'Nombre del recurso' },
            { var: 'fecha', desc: 'Fecha' },
            { var: 'bloques', desc: 'Bloques' },
            { var: 'motivo', desc: 'Motivo de la solicitud' },
            { var: 'estado', desc: 'Aprobada o Rechazada' },
            { var: 'color_estado', desc: 'Color representativo (#28a745 o #dc3545)' }
        ])
    },

    reserva_cancelacion_tardia: {
        clave: 'reserva_cancelacion_tardia',
        modulo: 'Recursos',
        nombre: 'Cancelación Tardía de Reserva',
        descripcion: 'Enviado al administrador y al docente cuando se cancela una reserva con 3 días o menos de anticipación.',
        asunto: 'Cancelación de Reserva Tardía: {{recurso}}',
        saludo_tipo: 'Estimado/a Administrador/a y Docente,',
        cuerpo_html: `<p>Se ha cancelado una reserva faltando 3 días o menos para su fecha programada.</p>
<div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 15px; margin: 15px 0;">
  <p style="margin: 4px 0;"><b>Recurso:</b> {{recurso}}</p>
  <p style="margin: 4px 0;"><b>Fecha Original:</b> {{fecha}}</p>
  <p style="margin: 4px 0;"><b>Bloques:</b> {{bloques}}</p>
  <p style="margin: 4px 0;"><b>Docente:</b> {{profesor_email}}</p>
  <p style="margin: 4px 0;"><b>Motivo/Uso:</b> {{motivo}}</p>
</div>
<p style="font-size: 13px; color: #64748b;">Este es un aviso automático del sistema para fines de registro administrativo y liberación de turnos.</p>`,
        pie_tipo: 'Colegio Cerro Grande - Gestión de Espacios y Recursos',
        variables_disponibles: JSON.stringify([
            { var: 'profesor_email', desc: 'Correo del docente' },
            { var: 'recurso', desc: 'Nombre del recurso' },
            { var: 'fecha', desc: 'Fecha original' },
            { var: 'bloques', desc: 'Bloques reservados' },
            { var: 'motivo', desc: 'Motivo' }
        ])
    },

    evaluacion_entrega: {
        clave: 'evaluacion_entrega',
        modulo: 'Evaluaciones',
        nombre: 'Entrega de Evaluación para Revisión / Impresión',
        descripcion: 'Enviado al coordinador de área cuando un profesor envía una prueba o instrumento para su impresión.',
        asunto: 'Entrega Evaluación: {{curso}} - {{asignatura}}',
        saludo_tipo: 'Buen día {{coordinador_nombre}},',
        cuerpo_html: `<p>El profesor <b>{{profesor_nombre}}</b> ha enviado una evaluación para su revisión y/o impresión.</p>
<div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 15px; margin: 15px 0;">
  <p style="margin: 4px 0;"><b>Curso:</b> {{curso}}</p>
  <p style="margin: 4px 0;"><b>Asignatura:</b> {{asignatura}}</p>
  <p style="margin: 4px 0;"><b>Fecha Programada:</b> {{fecha}}</p>
  <p style="margin: 4px 0;"><b>Tipo de Evaluación:</b> {{tipo}}</p>
</div>
<p><b>Instrucciones del profesor:</b><br/>{{instrucciones}}</p>
{{bloque_link_doc}}`,
        pie_tipo: 'Colegio Cerro Grande - Coordinación Académica',
        variables_disponibles: JSON.stringify([
            { var: 'coordinador_nombre', desc: 'Nombre del coordinador destinatario' },
            { var: 'profesor_nombre', desc: 'Nombre del docente que entrega' },
            { var: 'curso', desc: 'Curso de la evaluación' },
            { var: 'asignatura', desc: 'Asignatura' },
            { var: 'fecha', desc: 'Fecha programada' },
            { var: 'tipo', desc: 'Tipo (Prueba, Trabajo, etc.)' },
            { var: 'instrucciones', desc: 'Instrucciones de impresión / copias' },
            { var: 'link_doc', desc: 'Enlace a Google Docs (si aplica)' },
            { var: 'bloque_link_doc', desc: 'Bloque HTML formateado con el enlace' }
        ])
    },

    libro_alertas_docentes: {
        clave: 'libro_alertas_docentes',
        modulo: 'Libro Digital',
        nombre: 'Alerta Individual de Pendientes en Libro Digital',
        descripcion: 'Enviado a cada docente que presenta clases o firmas pendientes según el reporte de Leccionario.',
        asunto: '⚠️ Pendientes Libro Digital - {{profesor_nombre}}',
        saludo_tipo: 'Buen día {{profesor_nombre}},',
        cuerpo_html: `{{aclaracion_nombre}}
<p>Se han detectado las siguientes pendientes en el <b>Libro Digital</b> según el último reporte pedagógico cargado:</p>
{{tabla_pendientes_html}}
<p style="margin-top: 15px;">Por favor, regularizar en el sistema a la brevedad posible.</p>`,
        pie_tipo: 'Coordinación Pedagógica - Colegio Cerro Grande',
        variables_disponibles: JSON.stringify([
            { var: 'profesor_nombre', desc: 'Nombre del docente' },
            { var: 'profesor_email', desc: 'Correo del docente' },
            { var: 'nombre_original', desc: 'Nombre original en el reporte del libro' },
            { var: 'aclaracion_nombre', desc: 'Aviso si el nombre en el reporte difiere del perfil' },
            { var: 'tabla_pendientes_html', desc: 'Tabla HTML con fechas y pendientes' }
        ])
    },

    libro_resumen_admin: {
        clave: 'libro_resumen_admin',
        modulo: 'Libro Digital',
        nombre: 'Resumen Consolidado de Libro Digital (Coordinación)',
        descripcion: 'Enviado a la coordinación académica con el consolidado semanal de clases sin crear y firmas faltantes.',
        asunto: 'Resumen de Libro Digital - Colegio Cerro Grande',
        saludo_tipo: 'Estimado Equipo de Coordinación Académica,',
        cuerpo_html: `<div style="display: flex; gap: 15px; margin-bottom: 20px;">
  <p style="margin: 5px 0;">🚨 <b>Días totales sin clases creadas:</b> <span style="color: #dc2626; font-weight: bold;">{{total_criticos}}</span></p>
  <p style="margin: 5px 0;">✍️ <b>Días totales con firmas pendientes:</b> <span style="color: #d97706; font-weight: bold;">{{total_pendientes}}</span></p>
</div>
{{tabla_resumen_html}}`,
        pie_tipo: 'Colegio Cerro Grande - Módulo de Libro Digital',
        variables_disponibles: JSON.stringify([
            { var: 'total_criticos', desc: 'Número total de clases críticas sin registrar' },
            { var: 'total_pendientes', desc: 'Número total de firmas pendientes' },
            { var: 'tabla_resumen_html', desc: 'Tabla HTML consolidada por docente' }
        ])
    },

    actividad_solicitud_autorizacion: {
        clave: 'actividad_solicitud_autorizacion',
        modulo: 'Actividades',
        nombre: 'Solicitud de Autorización de Recursos para Actividad',
        descripcion: 'Enviado al responsable de un recurso cuando un docente planifica una actividad institucional.',
        asunto: 'Requerimiento de Autorización: {{titulo}}',
        saludo_tipo: 'Estimado/a colega,',
        cuerpo_html: `<p>Se ha registrado una nueva actividad institucional y se requiere tu autorización para el uso de recursos:</p>
<div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 15px; margin: 15px 0;">
  <p style="margin: 4px 0;"><b>Solicitante:</b> {{solicitante}}</p>
  <p style="margin: 4px 0;"><b>Actividad:</b> {{titulo}}</p>
  <p style="margin: 4px 0;"><b>Fecha:</b> {{fecha}} (Bloques: {{bloques}})</p>
  <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 10px 0;">
  <p style="margin: 4px 0;"><b>Recurso Solicitado:</b> {{desc_recurso}}</p>
</div>
<div style="margin-top: 25px; text-align: center;">
  <a href="{{enlace_aprobar}}" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-right: 15px; display: inline-block;">Aprobar Uso</a>
  <a href="{{enlace_rechazar}}" style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Rechazar</a>
</div>`,
        pie_tipo: 'Colegio Cerro Grande - Planificación de Actividades',
        variables_disponibles: JSON.stringify([
            { var: 'solicitante', desc: 'Nombre o correo del docente solicitante' },
            { var: 'titulo', desc: 'Título de la actividad' },
            { var: 'fecha', desc: 'Fecha de la actividad' },
            { var: 'bloques', desc: 'Bloques horarios' },
            { var: 'desc_recurso', desc: 'Descripción y cantidad del recurso' },
            { var: 'enlace_aprobar', desc: 'Enlace para autorizar directamente' },
            { var: 'enlace_rechazar', desc: 'Enlace para rechazar directamente' }
        ])
    },

    actividad_resultado_estado: {
        clave: 'actividad_resultado_estado',
        modulo: 'Actividades',
        nombre: 'Resultado de Solicitud de Actividad',
        descripcion: 'Enviado al docente solicitante cuando su actividad es aprobada o rechazada.',
        asunto: 'Solicitud de Actividad: {{estado}}',
        saludo_tipo: 'Buen día {{solicitante}},',
        cuerpo_html: `<p>Te informamos sobre el estado de tu solicitud de actividad institucional:</p>
<div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 15px; margin: 15px 0;">
  <p style="margin: 4px 0;"><b>Actividad:</b> {{titulo}}</p>
  <p style="margin: 4px 0;"><b>Fecha:</b> {{fecha}}</p>
  <p style="margin: 4px 0;"><b>Estado:</b> <span style="font-weight: bold; color: {{color_estado}};">{{estado}}</span></p>
</div>`,
        pie_tipo: 'Colegio Cerro Grande - Coordinación de Actividades',
        variables_disponibles: JSON.stringify([
            { var: 'solicitante', desc: 'Nombre o correo del solicitante' },
            { var: 'titulo', desc: 'Título de la actividad' },
            { var: 'fecha', desc: 'Fecha' },
            { var: 'estado', desc: 'Aprobada o Rechazada' },
            { var: 'color_estado', desc: 'Color representativo (#28a745 o #dc3545)' }
        ])
    },

    actividad_recordatorio_cron: {
        clave: 'actividad_recordatorio_cron',
        modulo: 'Actividades',
        nombre: 'Recordatorio 24h Previas a Actividad Institucional',
        descripcion: 'Enviado automáticamente cada mañana a las 08:00 a los responsables de recursos de actividades programadas para el día siguiente.',
        asunto: 'Recordatorio: Actividad MAÑANA ({{titulo}})',
        saludo_tipo: 'Recordatorio Institucional:',
        cuerpo_html: `<p>Mañana (<b>{{fecha}}</b>) se llevará a cabo la actividad "<b>{{titulo}}</b>" durante los bloques <b>{{bloques}}</b>.</p>
<div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 15px; margin: 15px 0;">
  <p style="margin: 0; color: #1e40af;">Recuerde tener listo con anticipación el recurso solicitado bajo su administración.</p>
</div>`,
        pie_tipo: 'Colegio Cerro Grande - Sistema de Alertas Automáticas',
        variables_disponibles: JSON.stringify([
            { var: 'titulo', desc: 'Título de la actividad' },
            { var: 'fecha', desc: 'Fecha programada' },
            { var: 'bloques', desc: 'Bloques horarios' }
        ])
    },

    evento_visitas_externas: {
        clave: 'evento_visitas_externas',
        modulo: 'Calendario',
        nombre: 'Alerta de Visación para Visitas Externas',
        descripcion: 'Enviado a Dirección Escolar cuando se agenda un evento con personas o invitados ajenos al establecimiento.',
        asunto: 'Alerta de Visitas Externas (Visación) - {{evento_texto}}',
        saludo_tipo: 'Estimado Equipo Directivo,',
        cuerpo_html: `<p>El usuario <b>{{usuario_email}}</b> ha programado el evento <b>{{evento_texto}}</b> para el día <b>{{fecha}}</b> y ha registrado el ingreso de las siguientes personas ajenas al establecimiento, las cuales requieren visación de Dirección:</p>
<div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 15px; margin: 15px 0;">
  {{lista_externos_html}}
</div>
<p style="font-size: 13px; color: #64748b;">Este reporte ha sido emitido de acuerdo al protocolo de seguridad e ingreso de visitas escolares.</p>`,
        pie_tipo: 'Colegio Cerro Grande - Protocolo de Seguridad Escolar',
        variables_disponibles: JSON.stringify([
            { var: 'usuario_email', desc: 'Correo del usuario que registró el evento' },
            { var: 'evento_texto', desc: 'Nombre o título del evento' },
            { var: 'fecha', desc: 'Fecha del evento' },
            { var: 'lista_externos_html', desc: 'Lista HTML con los datos de las visitas' }
        ])
    }
};

// -------------------------------------------------------------
// Inicialización y Auto-Healing de Tablas en DB
// -------------------------------------------------------------
function inicializarTablasCorreo(callback) {
    const database = getDb();
    database.serialize(() => {
        // 1. Tabla de Cola
        database.run(`CREATE TABLE IF NOT EXISTS cola_correos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            destinatario TEXT NOT NULL,
            asunto TEXT NOT NULL,
            cuerpo_html TEXT NOT NULL,
            cuerpo_texto TEXT,
            adjuntos TEXT DEFAULT '[]',
            modulo TEXT NOT NULL,
            tipo_plantilla TEXT,
            estado TEXT DEFAULT 'pendiente',
            intentos INTEGER DEFAULT 0,
            max_intentos INTEGER DEFAULT 5,
            ultimo_error TEXT,
            proximo_intento DATETIME DEFAULT CURRENT_TIMESTAMP,
            creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
            enviado_en DATETIME,
            actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        database.run(`CREATE INDEX IF NOT EXISTS idx_cola_estado ON cola_correos(estado, proximo_intento)`);
        database.run(`CREATE INDEX IF NOT EXISTS idx_cola_modulo ON cola_correos(modulo)`);
        database.run(`CREATE INDEX IF NOT EXISTS idx_cola_creado ON cola_correos(creado_en)`);

        // 2. Tabla de Plantillas
        database.run(`CREATE TABLE IF NOT EXISTS plantillas_correo (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            clave TEXT UNIQUE NOT NULL,
            modulo TEXT NOT NULL,
            nombre TEXT NOT NULL,
            descripcion TEXT,
            asunto TEXT NOT NULL,
            saludo_tipo TEXT DEFAULT 'Buen día {{profesor_nombre}},',
            cuerpo_html TEXT NOT NULL,
            pie_tipo TEXT DEFAULT 'Colegio Cerro Grande - Plataforma Unificada',
            variables_disponibles TEXT,
            activo INTEGER DEFAULT 1,
            actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        database.run(`CREATE INDEX IF NOT EXISTS idx_plantillas_clave ON plantillas_correo(clave)`);

        // Sembrar plantillas por defecto si no existen
        const stmt = database.prepare(`INSERT OR IGNORE INTO plantillas_correo 
            (clave, modulo, nombre, descripcion, asunto, saludo_tipo, cuerpo_html, pie_tipo, variables_disponibles)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);

        Object.values(PLANTILLAS_DEFAULT).forEach(p => {
            stmt.run([p.clave, p.modulo, p.nombre, p.descripcion, p.asunto, p.saludo_tipo, p.cuerpo_html, p.pie_tipo, p.variables_disponibles]);
        });
        stmt.finalize();

        if (typeof callback === 'function') callback();
    });
}

// -------------------------------------------------------------
// Transporter Nodemailer Configurable
// -------------------------------------------------------------
function crearTransporter() {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '465'),
        secure: (process.env.SMTP_SECURE === 'true' || !process.env.SMTP_SECURE),
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        },
        tls: { rejectUnauthorized: false }
    });
}

// -------------------------------------------------------------
// Reemplazo de Variables e Interpolación de Plantilla
// -------------------------------------------------------------
function interpolarTexto(texto, variables = {}) {
    if (!texto) return '';
    return texto.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, clave) => {
        if (variables[clave] !== undefined && variables[clave] !== null) {
            return String(variables[clave]);
        }
        return ''; // Si no viene la variable, dejamos limpio
    });
}

/**
 * Envoltorio HTML corporativo uniforme para todos los correos del colegio
 */
function armarDocumentoHtml({ saludo, cuerpo, pie }) {
    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Colegio Cerro Grande</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 25px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 620px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);" cellspacing="0" cellpadding="0">
          <!-- Cabecera -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 22px 28px; color: #ffffff;">
              <h1 style="margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.3px; color: #ffffff;">Colegio Cerro Grande</h1>
              <p style="margin: 4px 0 0; font-size: 13px; color: #e0e7ff; font-weight: 500;">Plataforma Escolar Unificada</p>
            </td>
          </tr>
          <!-- Contenido -->
          <tr>
            <td style="padding: 28px 28px 24px;">
              ${saludo ? `<div style="font-size: 16px; font-weight: 600; color: #1e293b; margin-bottom: 18px;">${saludo}</div>` : ''}
              <div style="font-size: 14px; line-height: 1.65; color: #334155;">
                ${cuerpo}
              </div>
            </td>
          </tr>
          <!-- Pie -->
          <tr>
            <td style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 28px; font-size: 12px; color: #64748b; text-align: center;">
              ${pie || 'Colegio Cerro Grande - Plataforma Unificada'}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Renderiza una plantilla (desde DB o fallback) con las variables entregadas
 */
function renderizarPlantilla(plantilla, variables = {}) {
    const saludo = interpolarTexto(plantilla.saludo_tipo || '', variables);
    const cuerpo = interpolarTexto(plantilla.cuerpo_html || '', variables);
    const pie = interpolarTexto(plantilla.pie_tipo || '', variables);
    const asunto = interpolarTexto(plantilla.asunto || '', variables);

    const htmlCompleto = armarDocumentoHtml({ saludo, cuerpo, pie });
    return {
        asunto,
        saludo,
        cuerpo,
        pie,
        html: htmlCompleto
    };
}

// -------------------------------------------------------------
// Obtener plantilla (DB con fallback a memoria)
// -------------------------------------------------------------
function obtenerPlantilla(clave) {
    return new Promise((resolve) => {
        const database = getDb();
        database.get("SELECT * FROM plantillas_correo WHERE clave = ?", [clave], (err, row) => {
            if (!err && row) {
                resolve(row);
            } else {
                resolve(PLANTILLAS_DEFAULT[clave] || null);
            }
        });
    });
}

// -------------------------------------------------------------
// Inserción en Cola de Correos (Asíncrona y no bloqueante)
// -------------------------------------------------------------
function encolarCorreo({ destinatario, asunto, cuerpo_html, cuerpo_texto, adjuntos = [], modulo = 'General', tipo_plantilla = null }) {
    return new Promise((resolve, reject) => {
        if (!destinatario) {
            return reject(new Error("Destinatario de correo requerido."));
        }

        const database = getDb();
        const adjuntosStr = typeof adjuntos === 'string' ? adjuntos : JSON.stringify(adjuntos);

        const sql = `INSERT INTO cola_correos 
            (destinatario, asunto, cuerpo_html, cuerpo_texto, adjuntos, modulo, tipo_plantilla, estado, proximo_intento)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'pendiente', CURRENT_TIMESTAMP)`;

        database.run(sql, [destinatario, asunto, cuerpo_html, cuerpo_texto || null, adjuntosStr, modulo, tipo_plantilla], function(err) {
            if (err) return reject(err);
            const insertId = this.lastID;

            // Disparar procesamiento inmediato en background (sin bloquear respuesta HTTP)
            setImmediate(() => {
                procesarCola().catch(e => console.error("[MAILER WORKER ERROR]", e.message));
            });

            resolve(insertId);
        });
    });
}

/**
 * Método de alto nivel: Carga la plantilla configurada en DB (o fallback),
 * interpola sus variables, y la encola de inmediato.
 */
async function enviarConPlantilla({ clave, variables = {}, destinatario, adjuntos = [], modulo = null }) {
    let plantilla = await obtenerPlantilla(clave);
    if (!plantilla) {
        throw new Error(`Plantilla de correo '${clave}' no encontrada.`);
    }

    const render = renderizarPlantilla(plantilla, variables);
    const idCola = await encolarCorreo({
        destinatario,
        asunto: render.asunto,
        cuerpo_html: render.html,
        adjuntos,
        modulo: modulo || plantilla.modulo || 'General',
        tipo_plantilla: clave
    });

    return {
        idCola,
        asunto: render.asunto,
        destinatario
    };
}

// -------------------------------------------------------------
// Worker de Procesamiento y Reintentos Automáticos
// -------------------------------------------------------------
let estaProcesando = false;

// Tiempos de reintento según intentos fallidos (retroceso exponencial):
// 1 fallo -> +1 minuto
// 2 fallos -> +5 minutos
// 3 fallos -> +15 minutos
// 4 fallos -> +60 minutos
// 5 fallos -> Fallido definitivo
const DELAYS_MINUTOS = [1, 5, 15, 60];

function calcularProximoIntento(intentos) {
    const minutos = DELAYS_MINUTOS[Math.min(intentos - 1, DELAYS_MINUTOS.length - 1)] || 60;
    const proximo = new Date(Date.now() + minutos * 60 * 1000);
    return proximo.toISOString().replace('T', ' ').substring(0, 19);
}

async function procesarCola(limitePorLote = 15) {
    if (estaProcesando) return { procesados: 0, mensaje: 'Worker ya en ejecución' };
    estaProcesando = true;

    const database = getDb();

    try {
        // Verificar si hay configuración SMTP básica
        const tieneSmtp = Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
        
        // Obtener correos pendientes cuyo proximo_intento sea menor o igual al momento actual
        const pendientes = await new Promise((resolve, reject) => {
            database.all(
                `SELECT * FROM cola_correos 
                 WHERE estado = 'pendiente' AND datetime(proximo_intento) <= datetime('now', 'localtime')
                 ORDER BY id ASC LIMIT ?`,
                [limitePorLote],
                (err, rows) => err ? reject(err) : resolve(rows || [])
            );
        });

        if (pendientes.length === 0) {
            estaProcesando = false;
            return { procesados: 0 };
        }

        const transporter = tieneSmtp ? crearTransporter() : null;
        let enviados = 0;
        let fallidos = 0;

        for (const item of pendientes) {
            const nuevoIntento = (item.intentos || 0) + 1;
            const maxIntentos = item.max_intentos || 5;

            if (!tieneSmtp) {
                // Si no hay SMTP configurado en el servidor, registrar advertencia y postergar
                const errDesc = 'Credenciales SMTP_USER / SMTP_PASS no configuradas en variables de entorno';
                const estadoFinal = nuevoIntento >= maxIntentos ? 'fallido' : 'pendiente';
                const prox = calcularProximoIntento(nuevoIntento);

                await new Promise(r => {
                    database.run(
                        `UPDATE cola_correos SET intentos = ?, ultimo_error = ?, estado = ?, proximo_intento = ?, actualizado_en = CURRENT_TIMESTAMP WHERE id = ?`,
                        [nuevoIntento, errDesc, estadoFinal, prox, item.id],
                        r
                    );
                });
                fallidos++;
                continue;
            }

            try {
                let adjuntosArr = [];
                try {
                    adjuntosArr = JSON.parse(item.adjuntos || '[]');
                } catch(e) {
                    adjuntosArr = [];
                }

                // Filtrar adjuntos válidos cuyos archivos existan si tienen propiedad path
                const adjuntosValidos = adjuntosArr.filter(adj => {
                    if (adj && adj.path) {
                        return fs.existsSync(adj.path);
                    }
                    return Boolean(adj && adj.content);
                });

                await transporter.sendMail({
                    from: `"Colegio Cerro Grande" <${process.env.SMTP_USER}>`,
                    to: item.destinatario,
                    subject: item.asunto,
                    html: item.cuerpo_html,
                    attachments: adjuntosValidos
                });

                // Éxito: marcar como enviado
                await new Promise(r => {
                    database.run(
                        `UPDATE cola_correos 
                         SET estado = 'enviado', enviado_en = CURRENT_TIMESTAMP, actualizado_en = CURRENT_TIMESTAMP, ultimo_error = NULL 
                         WHERE id = ?`,
                        [item.id],
                        r
                    );
                });
                enviados++;

            } catch (errEnvio) {
                console.error(`[MAILER] Error enviando correo ID ${item.id} a ${item.destinatario}:`, errEnvio.message);
                const estadoFinal = nuevoIntento >= maxIntentos ? 'fallido' : 'pendiente';
                const prox = calcularProximoIntento(nuevoIntento);

                await new Promise(r => {
                    database.run(
                        `UPDATE cola_correos 
                         SET intentos = ?, ultimo_error = ?, estado = ?, proximo_intento = ?, actualizado_en = CURRENT_TIMESTAMP 
                         WHERE id = ?`,
                        [nuevoIntento, errEnvio.message || String(errEnvio), estadoFinal, prox, item.id],
                        r
                    );
                });
                fallidos++;
            }
        }

        estaProcesando = false;
        return { procesados: pendientes.length, enviados, fallidos };
    } catch (errGlobal) {
        estaProcesando = false;
        console.error("[MAILER] Error en ciclo de worker:", errGlobal);
        throw errGlobal;
    }
}

// -------------------------------------------------------------
// Operaciones Manuales sobre la Cola
// -------------------------------------------------------------
function reintentarCorreo(id) {
    return new Promise((resolve, reject) => {
        const database = getDb();
        database.run(
            `UPDATE cola_correos 
             SET estado = 'pendiente', intentos = 0, proximo_intento = CURRENT_TIMESTAMP, actualizado_en = CURRENT_TIMESTAMP 
             WHERE id = ?`,
            [id],
            function(err) {
                if (err) return reject(err);
                if (this.changes === 0) return resolve(false);

                // Disparar worker inmediatamente
                setImmediate(() => {
                    procesarCola().catch(console.error);
                });
                resolve(true);
            }
        );
    });
}

function eliminarDeCola(id) {
    return new Promise((resolve, reject) => {
        const database = getDb();
        database.run("DELETE FROM cola_correos WHERE id = ?", [id], function(err) {
            if (err) return reject(err);
            resolve(this.changes > 0);
        });
    });
}

function limpiarCola(diasAntiguedad = 30) {
    return new Promise((resolve, reject) => {
        const database = getDb();
        database.run(
            `DELETE FROM cola_correos 
             WHERE estado IN ('enviado', 'fallido') 
             AND datetime(actualizado_en) < datetime('now', '-' || ? || ' days')`,
            [diasAntiguedad],
            function(err) {
                if (err) return reject(err);
                resolve(this.changes);
            }
        );
    });
}

function obtenerMetricasCola() {
    return new Promise((resolve, reject) => {
        const database = getDb();
        const sql = `SELECT 
            SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) as pendientes,
            SUM(CASE WHEN estado = 'enviado' AND date(enviado_en) = date('now', 'localtime') THEN 1 ELSE 0 END) as enviados_hoy,
            SUM(CASE WHEN estado = 'fallido' THEN 1 ELSE 0 END) as fallidos,
            COUNT(*) as total
            FROM cola_correos`;

        database.get(sql, [], (err, row) => {
            if (err) return reject(err);
            resolve({
                pendientes: (row && row.pendientes) || 0,
                enviados_hoy: (row && row.enviados_hoy) || 0,
                fallidos: (row && row.fallidos) || 0,
                total: (row && row.total) || 0
            });
        });
    });
}

module.exports = {
    PLANTILLAS_DEFAULT,
    getDb,
    inicializarTablasCorreo,
    crearTransporter,
    interpolarTexto,
    armarDocumentoHtml,
    renderizarPlantilla,
    obtenerPlantilla,
    encolarCorreo,
    enviarConPlantilla,
    procesarCola,
    reintentarCorreo,
    eliminarDeCola,
    limpiarCola,
    obtenerMetricasCola
};
