const fs = require('fs');
let code = fs.readFileSync('server/api/rpc.js', 'utf8');

const regex1 = /const dias = \['lunes', 'martes', 'miercoles', 'jueves', 'viernes'\];/;
const replacement1 = `const dias = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'];`;
code = code.replace(regex1, replacement1);

const regex2 = /const d = h\.dia \? h\.dia\.trim\(\)\.toLowerCase\(\) : '';/;
const replacement2 = `const d = h.dia ? h.dia.trim().toUpperCase().normalize("NFD").replace(/[\\u0300-\\u036f]/g, "") : '';`;
code = code.replace(regex2, replacement2);

fs.writeFileSync('server/api/rpc.js', code, 'utf8');
console.log('Backend standardizes to uppercase LUNES');
