const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, 'server/db/colegio.db'));

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS recursos_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT UNIQUE NOT NULL,
    responsable TEXT,
    duracion_bloque INTEGER DEFAULT 45,
    horario_inicio TEXT DEFAULT '08:00',
    horario_fin TEXT DEFAULT '18:00',
    activo INTEGER DEFAULT 1
  )`);
  
  // Recursos por defecto
  const recursos = [
    'Laboratorio de Computación',
    'Laboratorio Móvil 1',
    'Laboratorio Móvil 2',
    'Laboratorio de Ciencias',
    'Auditorio'
  ];
  recursos.forEach(r => {
    db.run(`INSERT OR IGNORE INTO recursos_config (nombre, responsable) VALUES (?, ?)`, [r, 'coordinacion@colegio.edu']);
  });
});
db.close();
console.log('Tabla recursos_config creada.');
