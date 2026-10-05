const fs = require('fs');
let html = fs.readFileSync('public/recursos.html', 'utf8');

const regex = /if \(permitido && yaTomado\) \{[\s\S]*?selectBloques\.innerHTML \+= `<option value="\$\{b\}" disabled>B\$\{b\} \(\$\{startHM\}\) - Ocupado<\/option>`;\s*\} else if \(permitido\) \{/g;
const replacement = `if (permitido && !yaTomado) {`;

html = html.replace(regex, replacement);
fs.writeFileSync('public/recursos.html', html, 'utf8');
console.log('Bloques ocupados removidos del select');
