const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'server', 'db', 'colegio.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS annos_escolares (
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
  )`, (err) => {
    if (err) console.error('Error tabla annos_escolares:', err);
    else console.log('✔ Tabla annos_escolares creada o existente.');
  });

  db.run("ALTER TABLE horarios ADD COLUMN anno INTEGER DEFAULT 2026", (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.log('Aviso horarios.anno:', err.message);
    } else {
      console.log('✔ Columna anno en horarios lista.');
    }
  });

  db.run("ALTER TABLE usuarios ADD COLUMN activo INTEGER DEFAULT 1", (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.log('Aviso usuarios.activo:', err.message);
    } else {
      console.log('✔ Columna activo en usuarios lista.');
    }
  });

  db.run(`INSERT OR IGNORE INTO annos_escolares 
    (anno, nombre, estado, fecha_inicio, fecha_fin, fecha_termino_primer_semestre, fecha_inicio_segundo_semestre, descripcion)
    VALUES 
    (2026, 'Año Escolar 2026', 'Activo', '2026-03-02', '2026-12-18', '2026-07-03', '2026-07-27', 'Año escolar en curso')`, (err) => {
    if (err) console.error('Error sembrando 2026:', err);
    else console.log('✔ Año 2026 inicial registrado en annos_escolares.');
  });

  db.run("INSERT OR IGNORE INTO config_global (clave, valor) VALUES ('anno_activo_predeterminado', '2026')", (err) => {
    if (err) console.error('Error config_global:', err);
    else console.log('✔ Configuración global anno_activo_predeterminado lista.');
  });

  // Asegurar que todos los horarios existentes tengan anno = 2026 si eran NULL
  db.run("UPDATE horarios SET anno = 2026 WHERE anno IS NULL", (err) => {
    if (err) console.error('Error normalizando anno en horarios:', err);
    else console.log('✔ Horarios existentes normalizados a anno 2026.');
  });

  db.all("SELECT * FROM annos_escolares", (err, rows) => {
    console.log('Años escolares registrados:', rows);
    db.close();
  });
});
