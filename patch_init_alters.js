const fs = require('fs');
let code = fs.readFileSync('server/db/init_db.js', 'utf8');

const alters = `
  db.run("ALTER TABLE evaluaciones ADD COLUMN estado_doc TEXT DEFAULT 'Pendiente'", (err) => {
      // Ignorar error si ya existe
  });
  db.run("ALTER TABLE evaluaciones ADD COLUMN link_doc TEXT", (err) => {});
  db.run("ALTER TABLE evaluaciones ADD COLUMN archivo_doc TEXT", (err) => {});
`;

if (!code.includes("ALTER TABLE evaluaciones ADD COLUMN estado_doc")) {
    code = code.replace("console.log('Base de datos inicializada');", alters + "\n    console.log('Base de datos inicializada');");
    fs.writeFileSync('server/db/init_db.js', code, 'utf8');
    console.log("init_db.js ahora usa ALTER TABLE");
}
