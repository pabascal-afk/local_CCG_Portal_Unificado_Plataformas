const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'colegio.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Topes Config
  db.run(`CREATE TABLE IF NOT EXISTS config_topes (
    curso TEXT PRIMARY KEY,
    max_dia_escritas INTEGER,
    max_dia_otras INTEGER,
    max_sem_escritas INTEGER,
    max_sem_total INTEGER
  )`);
  
  // Insertar un par de cursos de ejemplo
  db.run(`INSERT OR IGNORE INTO config_topes (curso, max_dia_escritas, max_dia_otras, max_sem_escritas, max_sem_total) VALUES ('1A', 2, 2, 2, 4)`);

  // Horarios de Profesores
  db.run(`CREATE TABLE IF NOT EXISTS horarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    curso TEXT,
    dia TEXT,
    bloque INTEGER,
    asignatura TEXT,
    profesor TEXT
  )`);
});

db.close();
