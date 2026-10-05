const fs = require('fs');
let code = fs.readFileSync('server/api/rpc.js', 'utf8');

const regex = /cursos: e\.cursos \|\| 'TODOS',\s*color: coloresUnicos\[e\.categoria\] \|\| '#e74c3c'\s*\}\)\);/;
const replace = `cursos: e.cursos || 'TODOS',
                   externos: e.externos || '[]',
                   recurso: e.recurso || '',
                   color: coloresUnicos[e.categoria] || '#e74c3c'
               }));`;
code = code.replace(regex, replace);

fs.writeFileSync('server/api/rpc.js', code, 'utf8');
console.log('obtenerDatosCompletos mapped with externos and recurso');
