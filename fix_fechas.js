const fs = require('fs');
let code = fs.readFileSync('server/api/rpc.js', 'utf8');

const regex = /dia: parseInt\(e\.fecha\.split\('-'\)\[2\]\),\n\s*mes: parseInt\(e\.fecha\.split\('-'\)\[1\]\) - 1,\n\s*anio: parseInt\(e\.fecha\.split\('-'\)\[0\]\),/;

const replacement = `dia: new Date(e.fecha).getDate(),
                 mes: new Date(e.fecha).getMonth(),
                 anio: new Date(e.fecha).getFullYear(),`;

code = code.replace(regex, replacement);
fs.writeFileSync('server/api/rpc.js', code, 'utf8');
console.log('Fechas fixeadas en obtenerDatosCompletos.');
