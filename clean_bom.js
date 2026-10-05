const fs = require('fs');
['public/evaluaciones.html', 'public/calendario.html', 'public/horarios.html'].forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/\uFFFD/g, ''); 
    content = content.replace(/\uFEFF/g, ''); 
    content = content.replace(/\xEF\xBB\xBF/g, ''); 
    fs.writeFileSync(file, content, 'utf8');
});
console.log('BOM limpiado');
