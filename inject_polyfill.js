const fs = require('fs');
const polyfill = fs.readFileSync('public/polyfill.html', 'utf8');

function injectPolyfill(file) {
    let html = fs.readFileSync(file, 'utf8');
    if (!html.includes('window.google = {')) {
        html = html.replace('<head>', '<head>\n' + polyfill);
        fs.writeFileSync(file, html, 'utf8');
        console.log('Polyfill inyectado en ' + file);
    }
}

injectPolyfill('public/evaluaciones.html');
injectPolyfill('public/calendario.html');
injectPolyfill('public/horarios.html');
