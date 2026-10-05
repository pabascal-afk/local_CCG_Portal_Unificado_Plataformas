const fs = require('fs');
let html = fs.readFileSync('public/calendario.html', 'utf8');

const regex = /setValoresBloques\(ev\.bloquea, ev\.bloques\); \} \s*else \{/;
const replacement = "setValoresBloques(ev.bloquea, ev.bloques); document.getElementById('inputCursos').value = ev.cursos || 'TODOS'; } else { document.getElementById('inputCursos').value = 'TODOS'; ";

html = html.replace(regex, replacement);

fs.writeFileSync('public/calendario.html', html, 'utf8');
console.log('Calendario.html JS modificado');
