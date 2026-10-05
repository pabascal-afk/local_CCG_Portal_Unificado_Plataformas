const fs = require('fs');
const polyfill = fs.readFileSync('public/polyfill.html', 'utf8');

['public/evaluaciones.html', 'public/calendario.html', 'public/horarios.html'].forEach(file => {
    let html = fs.readFileSync(file, 'utf8');
    // Remove old polyfill
    html = html.replace(/<script>\s*window\.google = \{\s*script: \{\s*run: \(\(\) => \{[\s\S]*?\}\)\(\)\s*\}\s*\};\s*<\/script>/, '');
    html = html.replace('<head>', '<head>\n' + polyfill);
    fs.writeFileSync(file, html, 'utf8');
});
console.log('Polyfill corregido.');
