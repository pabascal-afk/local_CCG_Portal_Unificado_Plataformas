const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'colegio.db');
const db = new sqlite3.Database(dbPath);

const schemas = [
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
    bloqueos_fechas TEXT DEFAULT '[]'
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
  )`
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
    db.run("INSERT OR IGNORE INTO config_global (clave, valor) VALUES ('emails_activados', 'true')", () => {});

    console.log("Base de datos colegio.db inicializada correctamente con el esquema final.");
});

db.close();
