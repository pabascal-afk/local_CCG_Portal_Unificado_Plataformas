const fs = require('fs');
let html = fs.readFileSync('public/calendario.html', 'utf8');

const regex = /function procesarDatos\(respuesta\) \{/g;
const replacement = `function procesarDatos(respuesta) {
          // Extraer cursos dinamicamente
          fetch('/api/rpc/getConfigFrontend', {method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({args:[]})})
             .then(r=>r.json()).then(data => {
                 if(data.result && data.result.cursos) {
                     renderizarCheckboxesCursos(data.result.cursos);
                 }
             }).catch(e => console.log(e));
`;

html = html.replace(regex, replacement);
fs.writeFileSync('public/calendario.html', html, 'utf8');
console.log('Fetch de cursos inyectado en procesarDatos');
