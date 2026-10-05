const fs = require('fs');
let html = fs.readFileSync('public/recursos.html', 'utf8');

// Add global shift tracker
const globalShift = `
    let isShiftPressed = false;
    document.addEventListener('keydown', e => { if(e.key === 'Shift') isShiftPressed = true; });
    document.addEventListener('keyup', e => { if(e.key === 'Shift') isShiftPressed = false; });
`;

html = html.replace("<script>", "<script>\n" + globalShift);

// Update agruparBloques to check isShiftPressed
const agruparRegex = /function agruparBloques\(\) \{\s*if \(_evitandoBucle\) return;/;
const agruparReplacement = `function agruparBloques() {
         if (isShiftPressed) return;
         if (_evitandoBucle) return;`;

html = html.replace(agruparRegex, agruparReplacement);

fs.writeFileSync('public/recursos.html', html, 'utf8');
console.log('Global Shift tracking inyectado');
