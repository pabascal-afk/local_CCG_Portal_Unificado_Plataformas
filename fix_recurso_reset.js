const fs = require('fs');
let html = fs.readFileSync('public/recursos.html', 'utf8');

const regex = /if \(recursosCache\.length > 0\) \{[\s\S]*?recursoActual = recursosCache\[0\]\.nombre;[\s\S]*?document\.getElementById\('btnConfigDisp'\)\.disabled = false;[\s\S]*?\} else \{/g;
const replacement = `if (recursosCache.length > 0) {
            // Preservar recursoActual si existe, o usar el primero
            if (!recursoActual || !recursosCache.find(r => r.nombre === recursoActual)) {
                recursoActual = recursosCache[0].nombre;
            }
            sel.value = recursoActual; // Update UI dropdown to match
            document.getElementById('btnConfigDisp').disabled = false;
        } else {`;

html = html.replace(regex, replacement);

fs.writeFileSync('public/recursos.html', html, 'utf8');
console.log('Fixed recursoActual reset issue');
