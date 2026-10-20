const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'colegio.db');
const db = new sqlite3.Database(dbPath);

const schemas = [
  `CREATE TABLE IF NOT EXISTS config_materiales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    responsable TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS actividades (
    id TEXT PRIMARY KEY,
    titulo TEXT NOT NULL,
    descripcion TEXT,
    fecha TEXT NOT NULL,
    bloques TEXT NOT NULL,
    solicitante_email TEXT NOT NULL,
    estado TEXT DEFAULT 'Pendiente',
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS actividades_req (
    id TEXT PRIMARY KEY,
    actividad_id TEXT,
    tipo TEXT,
    recurso_id INTEGER,
    cantidad INTEGER DEFAULT 1,
    responsable_email TEXT,
    estado TEXT DEFAULT 'Pendiente',
    token TEXT
  )`,

  `CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    nombre TEXT NOT NULL,
    rol TEXT NOT NULL DEFAULT 'Profesor',
    preferencias_mail TEXT DEFAULT '{"nueva_reserva": true, "edicion_admin": true, "nuevo_aviso": false, "recordatorio_eval": true}',
    pin TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS evaluaciones (
    id TEXT PRIMARY KEY,
    fecha TEXT NOT NULL,
    curso TEXT NOT NULL,
    asignatura TEXT NOT NULL,
    tipo TEXT NOT NULL,
    recurso TEXT,
    profesor_email TEXT,
    profesor_nombre TEXT,
    detalles TEXT,
    temario TEXT,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado_doc TEXT DEFAULT 'Pendiente',
    link_doc TEXT,
    archivo_doc TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS reservas (
    id TEXT PRIMARY KEY,
    id_evaluacion TEXT,
    fecha TEXT NOT NULL,
    bloques TEXT NOT NULL,
    recurso TEXT NOT NULL,
    curso TEXT,
    motivo TEXT,
    profesor_email TEXT,
    estado TEXT DEFAULT 'Aprobada',
    token_aprobacion TEXT,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS eventos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fecha TEXT NOT NULL,
    titulo TEXT NOT NULL,
    categoria TEXT NOT NULL,
    bloques TEXT,
    creador_email TEXT,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    cursos TEXT DEFAULT 'TODOS',
    externos TEXT DEFAULT '[]',
    recurso TEXT
  )`,
    `CREATE TABLE IF NOT EXISTS coordinadores_areas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    nombre TEXT NOT NULL,
    curso_regla TEXT NOT NULL,
    asignatura_regla TEXT NOT NULL
  )`,
    `CREATE TABLE IF NOT EXISTS config_global (
    clave TEXT PRIMARY KEY,
    valor TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS config_tipos_evaluacion (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT UNIQUE NOT NULL,
      es_prueba BOOLEAN NOT NULL DEFAULT 0
  );
  
  CREATE TABLE IF NOT EXISTS config_topes (
    curso TEXT PRIMARY KEY,
    max_dia_escritas INTEGER,
    max_dia_otras INTEGER,
    max_sem_escritas INTEGER,
    max_sem_total INTEGER
  )`,
  `CREATE TABLE IF NOT EXISTS horarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    curso TEXT,
    dia TEXT,
    bloque INTEGER,
    asignatura TEXT,
    profesor TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS recursos_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT UNIQUE NOT NULL,
    responsable TEXT,
    duracion_bloque INTEGER DEFAULT 45,
    horario_inicio TEXT DEFAULT '08:00',
    horario_fin TEXT DEFAULT '18:00',
    activo INTEGER DEFAULT 1,
    disponibilidad TEXT DEFAULT '{}',
    bloques_agrupados TEXT DEFAULT '[]',
    horarios_exactos TEXT DEFAULT '08:00,08:45,09:30,10:15,11:00,11:45,12:30,13:15,14:00,14:45,15:30,16:15',
    bloqueos_fechas TEXT DEFAULT '[]',
    reglas_reserva TEXT DEFAULT '{}'
  )`,
  `CREATE TABLE IF NOT EXISTS roles_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT UNIQUE,
    permisos TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS avisos_muro (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    mensaje TEXT NOT NULL,
    autor TEXT NOT NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    importancia TEXT DEFAULT 'Normal'
  )`,
  `CREATE TABLE IF NOT EXISTS libro_registros (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fecha TEXT NOT NULL,
    profesor TEXT NOT NULL,
    profesor_normalizado TEXT NOT NULL,
    creadas INTEGER DEFAULT 0,
    requeridas INTEGER DEFAULT 0,
    contenido INTEGER DEFAULT 0,
    asistencia INTEGER DEFAULT 0,
    firma INTEGER DEFAULT 0,
    critico INTEGER DEFAULT 0,
    archivo_origen TEXT,
    profesor_plataforma TEXT,
    profesor_email TEXT,
    usuario_id INTEGER,
    actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(fecha, profesor_normalizado) ON CONFLICT REPLACE
  )`,
  `CREATE INDEX IF NOT EXISTS idx_libro_fecha ON libro_registros(fecha)`,
  `CREATE INDEX IF NOT EXISTS idx_libro_prof ON libro_registros(profesor_normalizado)`,
  `CREATE TABLE IF NOT EXISTS libro_alias_docentes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre_reporte TEXT UNIQUE NOT NULL,
    nombre_normalizado TEXT NOT NULL,
    usuario_id INTEGER,
    nombre_plataforma TEXT NOT NULL,
    email TEXT,
    origen TEXT DEFAULT 'auto',
    actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS idx_alias_reporte ON libro_alias_docentes(nombre_normalizado)`,
  `CREATE TABLE IF NOT EXISTS libro_config (
    clave TEXT PRIMARY KEY,
    valor TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS cola_correos (
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
  )`,
  `CREATE INDEX IF NOT EXISTS idx_cola_estado ON cola_correos(estado, proximo_intento)`,
  `CREATE INDEX IF NOT EXISTS idx_cola_modulo ON cola_correos(modulo)`,
  `CREATE INDEX IF NOT EXISTS idx_cola_creado ON cola_correos(creado_en)`,
  `CREATE TABLE IF NOT EXISTS plantillas_correo (
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
  )`,
  `CREATE INDEX IF NOT EXISTS idx_plantillas_clave ON plantillas_correo(clave)`
];

db.serialize(() => {
    schemas.forEach(sql => {
        db.run(sql, (err) => {
            if (err) console.error("Error init table:", err);
        });
    });
    
    db.run("ALTER TABLE evaluaciones ADD COLUMN estado_doc TEXT DEFAULT 'Pendiente'", () => {});
    db.run("ALTER TABLE evaluaciones ADD COLUMN link_doc TEXT", () => {});
    db.run("ALTER TABLE evaluaciones ADD COLUMN archivo_doc TEXT", () => {});
    db.run("ALTER TABLE config_tipos_evaluacion ADD COLUMN orden INTEGER DEFAULT 0", () => {});
    db.run("ALTER TABLE recursos_config ADD COLUMN reglas_reserva TEXT DEFAULT '{}'", () => {});
    db.run("ALTER TABLE reservas ADD COLUMN token_aprobacion TEXT", () => {});
    db.run("ALTER TABLE libro_registros ADD COLUMN profesor_plataforma TEXT", () => {});
    db.run("ALTER TABLE libro_registros ADD COLUMN profesor_email TEXT", () => {});
    db.run("ALTER TABLE libro_registros ADD COLUMN usuario_id INTEGER", () => {});
    db.run("INSERT OR IGNORE INTO config_global (clave, valor) VALUES ('emails_activados', 'true')", () => {});

    db.run("INSERT OR IGNORE INTO config_tipos_evaluacion (nombre, es_prueba) VALUES ('📝 Prueba', 1)", () => {});
    db.run("INSERT OR IGNORE INTO config_tipos_evaluacion (nombre, es_prueba) VALUES ('🗣️ Exposición Oral', 1)", () => {});
    db.run("INSERT OR IGNORE INTO config_tipos_evaluacion (nombre, es_prueba) VALUES ('📂 Trabajo', 0)", () => {});
    db.run("INSERT OR IGNORE INTO config_tipos_evaluacion (nombre, es_prueba) VALUES ('🔄 Ev. de Proceso', 0)", () => {});
    db.run("INSERT OR IGNORE INTO config_tipos_evaluacion (nombre, es_prueba) VALUES ('⏱️ Quiz', 0)", () => {});

    db.run("INSERT OR IGNORE INTO libro_config (clave, valor) VALUES ('blacklist', '[]')", () => {});
    db.run("INSERT OR IGNORE INTO libro_config (clave, valor) VALUES ('dias_excluidos', '[]')", () => {});
    db.run("INSERT OR IGNORE INTO libro_config (clave, valor) VALUES ('destinatarios_admin', '[\"pabascal@colegiocerrogrande.cl\",\"jmera@colegiocerrogrande.cl\",\"paolapizarro@colegiocerrogrande.cl\",\"pgarciac@colegiocerrogrande.cl\",\"mdiaz@colegiocerrogrande.cl\",\"camilaaraya@colegiocerrogrande.cl\"]')", () => {});

    try {
        const mailer = require('../services/mailer');
        mailer.inicializarTablasCorreo(() => {
            console.log("Plantillas de correo y cola inicializadas correctamente.");
        });
    } catch(e) {
        console.error("Error al sembrar plantillas de correo:", e.message);
    }

    console.log("Base de datos colegio.db inicializada correctamente con el esquema final.");
});

db.close();
