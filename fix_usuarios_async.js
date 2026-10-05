const fs = require('fs');
let html = fs.readFileSync('public/usuarios.html', 'utf8');

const regex = /document\.addEventListener\('DOMContentLoaded', \(\) => \{/g;
const replacement = `document.addEventListener('DOMContentLoaded', async () => {`;

html = html.replace(regex, replacement);
fs.writeFileSync('public/usuarios.html', html, 'utf8');
console.log('Fixed async DOMContentLoaded');
