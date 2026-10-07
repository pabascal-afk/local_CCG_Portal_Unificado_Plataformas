const fs = require('fs');
let code = fs.readFileSync('server/db/init_db.js', 'utf8');

const alters = `
    db.run("ALTER TABLE evaluaciones ADD COLUMN estado_doc TEXT DEFAULT 'Pendiente'", () => {});
    db.run("ALTER TABLE evaluaciones ADD COLUMN link_doc TEXT", () => {});
    db.run("ALTER TABLE evaluaciones ADD COLUMN archivo_doc TEXT", () => {});
    db.run("INSERT OR IGNORE INTO config_global (clave, valor) VALUES ('emails_activados', 'true')", () => {});
`;

code = code.replace('console.log("Base de datos colegio.db inicializada correctamente con el esquema final.");', alters + '\n    console.log("Base de datos colegio.db inicializada correctamente con el esquema final.");');

fs.writeFileSync('server/db/init_db.js', code, 'utf8');
console.log("init_db.js alterado");
