const fs = require('fs');
let code = fs.readFileSync('public/evaluaciones.html', 'utf8');

const regex = /if \(e\.extendedProps && e\.extendedProps\.esBloqueo\) return true;/;
const replacement = `if (e.extendedProps && e.extendedProps.esBloqueo) {
              if (!vCurso) return true; // Si no hay filtro de curso, muestra todos los bloqueos
              if (e.extendedProps.curso === 'TODOS') return true; // Bloqueo global se muestra siempre
              if (e.extendedProps.curso === vCurso) return true; // Coincide con el curso filtrado
              return false; // Es un bloqueo de otro curso
          }`;

code = code.replace(regex, replacement);
fs.writeFileSync('public/evaluaciones.html', code, 'utf8');
console.log('Filtro de bloqueos corregido en evaluaciones.html');
