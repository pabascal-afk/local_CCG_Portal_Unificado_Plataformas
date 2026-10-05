const fs = require('fs');
let code = fs.readFileSync('server/api/rpc.js', 'utf8');

const regex = /return res\.json\(\{ result: \{ eventos, esAdmin: isAdmin, colores: \{.*?\}, usuario: user\.email \} \}\);/s;

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
             
             return res.json({ result: { eventos, esAdmin: isAdmin, colores: coloresUnicos, usuario: user.email } });
`;

code = code.replace(regex, replacement);
fs.writeFileSync('server/api/rpc.js', code, 'utf8');
console.log('Fixed Calendario Online colores');
