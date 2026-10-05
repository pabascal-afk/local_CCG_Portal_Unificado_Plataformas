const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'colegio.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Tabla Usuarios
  db.run(`CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    nombre TEXT NOT NULL,
    rol TEXT NOT NULL DEFAULT 'Profesor'
  )`);

  // Usuario Admin por defecto
  db.run(`INSERT OR IGNORE INTO usuarios (email, nombre, rol) VALUES ('admin@colegio.edu', 'Administrador', 'Administrador')`);

  // Tabla Evaluaciones
  db.run(`CREATE TABLE IF NOT EXISTS evaluaciones (
    id TEXT PRIMARY KEY,
    fecha TEXT NOT NULL,
    curso TEXT NOT NULL,
    asignatura TEXT NOT NULL,
    tipo TEXT NOT NULL,
    recurso TEXT,
    profesor_email TEXT,
    profesor_nombre TEXT,
    detalles TEXT,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Tabla Reservas
  db.run(`CREATE TABLE IF NOT EXISTS reservas (
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
  )`);

  // Tabla Eventos Calendario Anual
  db.run(`CREATE TABLE IF NOT EXISTS eventos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fecha TEXT NOT NULL,
    titulo TEXT NOT NULL,
    categoria TEXT NOT NULL,
    bloques TEXT,
    creador_email TEXT,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  console.log('Base de datos inicializada correctamente.');
});

db.close();
