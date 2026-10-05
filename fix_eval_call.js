const fs = require('fs');
let html = fs.readFileSync('public/evaluaciones.html', 'utf8');

html = html.replace(/editarEvaluacionBackend/g, 'editarEvaluacion');

fs.writeFileSync('public/evaluaciones.html', html, 'utf8');
console.log('Fixed editarEvaluacion call in evaluaciones.html');
