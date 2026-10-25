const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { inicializarCurriculo } = require('../server/services/curriculo_seed');

const dbPath = path.join(__dirname, '..', 'server', 'db', 'colegio.db');
const db = new sqlite3.Database(dbPath);

console.log("Iniciando reseeding curricular...");
inicializarCurriculo(db, (err) => {
  if (err) {
    console.error("Error durante inicialización:", err);
    process.exit(1);
  }

  db.serialize(() => {
    db.get("SELECT COUNT(*) as planes FROM curriculo_planes", (err, r1) => {
      console.log("Total planes:", r1.planes);
    });
    db.get("SELECT COUNT(*) as objetivos FROM curriculo_objetivos", (err, r2) => {
      console.log("Total objetivos:", r2.objetivos);
    });
    db.get("SELECT COUNT(*) as sin_ind FROM curriculo_objetivos WHERE indicadores_sugeridos IS NULL OR indicadores_sugeridos = '' OR indicadores_sugeridos = '[]'", (err, r3) => {
      console.log("Objetivos sin indicadores:", r3.sin_ind);
    });
    db.get("SELECT COUNT(*) as sin_uni FROM curriculo_objetivos WHERE unidad_sugerida IS NULL OR unidad_sugerida = ''", (err, r4) => {
      console.log("Objetivos sin unidad:", r4.sin_uni);
    });
    db.all("SELECT DISTINCT unidad_sugerida FROM curriculo_objetivos ORDER BY unidad_sugerida", (err, r5) => {
      console.log("Unidades:", r5.map(x => x.unidad_sugerida));
      db.close();
      console.log("Verificación exitosa.");
    });
  });
}, { forzarActualizacion: true });
