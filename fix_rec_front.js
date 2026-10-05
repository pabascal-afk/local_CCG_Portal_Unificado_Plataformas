const fs = require('fs');
let code = fs.readFileSync('public/recursos.html', 'utf8');

const regex = /\/\/ BLOQUEOS INSTITUCIONALES \(EVENTOS\)[\s\S]*?eventosInstitucionales\.forEach\(evInst => \{[\s\S]*?if \(evInst\.start === currFechaStr\) \{/g;
const replacement = `// BLOQUEOS INSTITUCIONALES (EVENTOS)
                eventosInstitucionales.forEach(evInst => {
                    // Si tiene un recurso especifico, y no es el recurso actual, ignoramos
                    if (evInst.extendedProps.recurso && evInst.extendedProps.recurso !== rActual.nombre) return;

                    if (evInst.start === currFechaStr) {`;

code = code.replace(regex, replacement);
fs.writeFileSync('public/recursos.html', code, 'utf8');
console.log('recursos.html updated');
