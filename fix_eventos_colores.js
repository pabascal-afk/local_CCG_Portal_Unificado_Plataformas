const fs = require('fs');
let code = fs.readFileSync('server/api/rpc.js', 'utf8');

// I will just use a node script to parse the map, then assign.
const regex = /const eventos = data\.map\(e => \(\{\s*id: e\.id,\s*dia: new Date\(e\.fecha\)\.getDate\(\),\s*mes: new Date\(e\.fecha\)\.getMonth\(\),\s*anio: new Date\(e\.fecha\)\.getFullYear\(\),\s*texto: e\.titulo,\s*tipo: e\.categoria,\s*bloquea: e\.bloques === 'TODOS' \? 'si' : '',\s*bloques: e\.bloques,\s*cursos: e\.cursos \|\| 'TODOS',\s*color: e\.categoria\.toLowerCase\(\)\.includes\('convivencia'\) \? '#2ecc71' : '#e74c3c'\s*\}\)\);/;

const replacement = `
             const coloresUnicos = {};
             const paleta = ['#e74c3c', '#2ecc71', '#3498db', '#f1c40f', '#9b59b6', '#34495e', '#e67e22', '#1abc9c', '#95a5a6'];
             let cIdx = 0;
             data.forEach(e => {
                 if (!coloresUnicos[e.categoria]) {
                     coloresUnicos[e.categoria] = paleta[cIdx % paleta.length];
                     cIdx++;
                 }
             });

             const eventos = data.map(e => ({
                 id: e.id,
                 dia: new Date(e.fecha).getDate(),
                 mes: new Date(e.fecha).getMonth(),
                 anio: new Date(e.fecha).getFullYear(),
                 texto: e.titulo,
                 tipo: e.categoria,
                 bloquea: e.bloques === 'TODOS' ? 'si' : '',
                 bloques: e.bloques,
                 cursos: e.cursos || 'TODOS',
                 color: coloresUnicos[e.categoria] || '#e74c3c'
             }));
`;

code = code.replace(regex, replacement);
// We also need to remove the old generation of coloresUnicos lower down.
const removeRegex = /\s*const coloresUnicos = \{\};\s*const paleta = \['#e74c3c', '#2ecc71', '#3498db', '#f1c40f', '#9b59b6', '#34495e', '#e67e22', '#1abc9c', '#95a5a6'\];\s*let cIdx = 0;\s*data\.forEach\(e => \{\s*if \(!coloresUnicos\[e\.categoria\]\) \{\s*coloresUnicos\[e\.categoria\] = paleta\[cIdx % paleta\.length\];\s*cIdx\+\+;\s*\}\s*\}\);/;

code = code.replace(removeRegex, "");

fs.writeFileSync('server/api/rpc.js', code, 'utf8');
console.log('Fixed Calendario Online colores in events');
