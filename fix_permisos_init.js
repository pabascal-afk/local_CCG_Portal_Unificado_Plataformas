const fs = require('fs');
let code = fs.readFileSync('server/api/rpc.js', 'utf8');

const regex = /let permisosP = \{ categorias: '' \};/g;
const replacement = `let permisosP = {};`;

code = code.replace(regex, replacement);

fs.writeFileSync('server/api/rpc.js', code, 'utf8');
console.log('rpc.js inicialización de permisosP corregida');
