const fs = require('fs');
let html = fs.readFileSync('public/recursos.html', 'utf8');

const regex = /if \(modoBloqueoActivo\) \{[\s\S]*?return;\s*\}/g;
html = html.replace(regex, "");

fs.writeFileSync('public/recursos.html', html, 'utf8');
console.log('Removido modoBloqueoActivo de recursos.html');
