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
  `CREATE INDEX IF NOT EXISTS idx_plantillas_clave ON plantillas_correo(clave)`,

  `CREATE TABLE IF NOT EXISTS curriculo_planes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    anio INTEGER NOT NULL,
    tipo TEXT NOT NULL DEFAULT 'MINEDUC',
    nivel TEXT NOT NULL,
    asignatura TEXT NOT NULL,
    descripcion TEXT,
    activo INTEGER DEFAULT 1,
    actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(anio, nivel, asignatura, tipo)
  )`,
  `CREATE INDEX IF NOT EXISTS idx_curr_nivel_asig ON curriculo_planes(anio, nivel, asignatura)`,
  `CREATE TABLE IF NOT EXISTS curriculo_objetivos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plan_id INTEGER NOT NULL,
    tipo_objetivo TEXT DEFAULT 'OA',
    eje_unidad TEXT,
    codigo TEXT NOT NULL,
    descripcion TEXT NOT NULL,
    indicadores_sugeridos TEXT,
    categoria TEXT DEFAULT 'Basal',
    orden INTEGER DEFAULT 0,
    activo INTEGER DEFAULT 1,
    FOREIGN KEY (plan_id) REFERENCES curriculo_planes(id) ON DELETE CASCADE
  )`,
  `CREATE INDEX IF NOT EXISTS idx_curr_obj_plan ON curriculo_objetivos(plan_id, codigo)`,
  `CREATE TABLE IF NOT EXISTS planificaciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    anio INTEGER NOT NULL,
    curso TEXT NOT NULL,
    asignatura TEXT NOT NULL,
    plan_curricular_id INTEGER,
    titulo TEXT NOT NULL,
    docente_responsable TEXT,
    docentes_colaboradores TEXT DEFAULT '[]',
    estado TEXT DEFAULT 'En edición',
    visado_por TEXT,
    visado_fecha DATETIME,
    visado_comentario TEXT,
    metas_anuales TEXT,
    horas_anuales INTEGER DEFAULT 0,
    creado_por TEXT,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    hitos_completados TEXT DEFAULT '[]',
    UNIQUE(anio, curso, asignatura)
  )`,
  `CREATE INDEX IF NOT EXISTS idx_plan_curso_asig ON planificaciones(anio, curso, asignatura)`,
  `CREATE TABLE IF NOT EXISTS planificaciones_unidades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    planificacion_id INTEGER NOT NULL,
    numero_unidad INTEGER NOT NULL,
    nombre_unidad TEXT NOT NULL,
    semestre INTEGER DEFAULT 1,
    fecha_inicio TEXT,
    fecha_fin TEXT,
    horas_estimadas INTEGER DEFAULT 0,
    oas_seleccionados TEXT DEFAULT '[]',
    oats_seleccionados TEXT DEFAULT '[]',
    habilidades TEXT,
    actitudes TEXT,
    indicadores_evaluacion TEXT,
    instrumentos_evaluacion TEXT,
    desglose_semanal TEXT DEFAULT '[]',
    orden INTEGER DEFAULT 0,
    FOREIGN KEY (planificacion_id) REFERENCES planificaciones(id) ON DELETE CASCADE
  )`,
  `CREATE INDEX IF NOT EXISTS idx_plan_unid ON planificaciones_unidades(planificacion_id, numero_unidad)`,
  `CREATE TABLE IF NOT EXISTS planificaciones_versiones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    planificacion_id INTEGER NOT NULL,
    version_numero TEXT NOT NULL,
    mensaje TEXT NOT NULL,
    autor_email TEXT NOT NULL,
    autor_nombre TEXT NOT NULL,
    contenido_completo TEXT NOT NULL,
    tipo_snapshot TEXT DEFAULT 'checkpoint',
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (planificacion_id) REFERENCES planificaciones(id) ON DELETE CASCADE
  )`,
  `CREATE INDEX IF NOT EXISTS idx_plan_vers ON planificaciones_versiones(planificacion_id, creado_en)`,
  `CREATE TABLE IF NOT EXISTS planificaciones_observaciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    planificacion_id INTEGER NOT NULL,
    seccion TEXT DEFAULT 'general',
    autor_email TEXT NOT NULL,
    autor_nombre TEXT NOT NULL,
    autor_rol TEXT NOT NULL,
    comentario TEXT NOT NULL,
    resuelto INTEGER DEFAULT 0,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (planificacion_id) REFERENCES planificaciones(id) ON DELETE CASCADE
  )`,
  `CREATE INDEX IF NOT EXISTS idx_plan_obs ON planificaciones_observaciones(planificacion_id)`,
  `CREATE TABLE IF NOT EXISTS annos_escolares (
      anno INTEGER PRIMARY KEY,
      nombre TEXT NOT NULL,
      estado TEXT NOT NULL DEFAULT 'Activo',
      fecha_inicio TEXT NOT NULL,
      fecha_fin TEXT NOT NULL,
      fecha_termino_primer_semestre TEXT,
      fecha_inicio_segundo_semestre TEXT,
      dias_habiles_estimados INTEGER DEFAULT 180,
      descripcion TEXT,
      creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
      actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
  `CREATE TABLE IF NOT EXISTS planificaciones_hitos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      anio INTEGER NOT NULL DEFAULT 2026,
      titulo TEXT NOT NULL,
      tipo TEXT NOT NULL DEFAULT 'Hito Pedagógico',
      icono TEXT DEFAULT '🎭',
      color TEXT DEFAULT '#2563eb',
      fecha_inicio TEXT NOT NULL,
      fecha_fin TEXT NOT NULL,
      todas_asignaturas INTEGER DEFAULT 0,
      asignaturas TEXT DEFAULT '[]',
      todos_cursos INTEGER DEFAULT 0,
      cursos TEXT DEFAULT '[]',
      cursos_excluidos TEXT DEFAULT '[]',
      lineamientos TEXT,
      oas_sugeridos TEXT DEFAULT '[]',
      metodologias_sugeridas TEXT DEFAULT '[]',
      recursos_enlaces TEXT DEFAULT '[]',
      bloquear_edicion INTEGER DEFAULT 0,
      activo INTEGER DEFAULT 1,
      creado_por TEXT,
      creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
      actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS idx_hitos_anio ON planificaciones_hitos(anio, fecha_inicio, fecha_fin)`
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
    db.run("ALTER TABLE curriculo_planes ADD COLUMN habilidades_sugeridas TEXT DEFAULT '[]'", () => {});
    db.run("ALTER TABLE curriculo_objetivos ADD COLUMN unidad_sugerida TEXT DEFAULT 'Unidad 1'", () => {});
    db.run("ALTER TABLE planificaciones ADD COLUMN cursos_vinculados TEXT DEFAULT '[]'", () => {});
    db.run("ALTER TABLE planificaciones ADD COLUMN solicitud_eliminacion INTEGER DEFAULT 0", () => {});
    db.run("ALTER TABLE planificaciones ADD COLUMN solicitud_eliminacion_motivo TEXT", () => {});
    db.run("ALTER TABLE planificaciones ADD COLUMN solicitud_eliminacion_por TEXT", () => {});
    db.run("ALTER TABLE planificaciones ADD COLUMN solicitud_eliminacion_fecha DATETIME", () => {});
    db.run("ALTER TABLE planificaciones_unidades ADD COLUMN tags TEXT DEFAULT '[]'", () => {});
    db.run("ALTER TABLE horarios ADD COLUMN anno INTEGER DEFAULT 2026", () => {});
    db.run("ALTER TABLE usuarios ADD COLUMN activo INTEGER DEFAULT 1", () => {});
    db.run("INSERT OR IGNORE INTO config_global (clave, valor) VALUES ('emails_activados', 'true')", () => {});
    db.run("INSERT OR IGNORE INTO config_global (clave, valor) VALUES ('anno_activo_predeterminado', '2026')", () => {});
    db.run(`INSERT OR IGNORE INTO annos_escolares 
      (anno, nombre, estado, fecha_inicio, fecha_fin, fecha_termino_primer_semestre, fecha_inicio_segundo_semestre, descripcion)
      VALUES 
      (2026, 'Año Escolar 2026', 'Activo', '2026-03-02', '2026-12-18', '2026-07-03', '2026-07-27', 'Año escolar en curso')`, () => {});

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

    try {
        const auditoria = require('../services/auditoria');
        auditoria.inicializarTablaAuditoria(() => {
            console.log("Tabla e índices de auditoría inicializados correctamente.");
        });
    } catch(e) {
        console.error("Error al inicializar tabla de auditoría:", e.message);
    }

    try {
        const curriculoSeed = require('../services/curriculo_seed');
        curriculoSeed.inicializarCurriculo(db, () => {
            console.log("Catálogo curricular MINEDUC inicializado correctamente.");
            console.log("Base de datos colegio.db inicializada correctamente con el esquema final.");
            db.close();
        });
    } catch(e) {
        console.error("Error al inicializar currículo:", e.message);
        db.close();
    }
});
