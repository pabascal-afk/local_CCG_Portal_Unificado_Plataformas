const fs = require('fs');
let html = fs.readFileSync('public/recursos.html', 'utf8');

html = html.replace('function guardarDisponibilidad() {', 'async function guardarDisponibilidad() {');
html = html.replace('function guardarNuevoRecurso() {', 'async function guardarNuevoRecurso() {');

fs.writeFileSync('public/recursos.html', html, 'utf8');
console.log('Fixed async functions in recursos.html');
