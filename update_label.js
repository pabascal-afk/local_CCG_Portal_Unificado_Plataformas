const fs = require('fs');
let html = fs.readFileSync('public/recursos.html', 'utf8');

const regex = /<label class="fw-medium">Bloques \(Presiona Ctrl para m.*?ltiples\)<\/label>/g;
const replacement = '<label class="fw-medium">Bloques (Presiona Ctrl para múltiples y Shift para aislar un bloque de 45 mins)</label>';

html = html.replace(regex, replacement);

fs.writeFileSync('public/recursos.html', html, 'utf8');
console.log('Etiqueta actualizada exitosamente');
