const fs = require('fs');
let html = fs.readFileSync('public/recursos.html', 'utf8');

html = html.replace(/async\s*\n\s*function eliminarRecursoDefinitivo\(\)/g, "function eliminarRecursoDefinitivo()");

fs.writeFileSync('public/recursos.html', html, 'utf8');
console.log('Fixed eliminarRecursoDefinitivo formatting');
