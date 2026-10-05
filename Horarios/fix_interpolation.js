const fs = require('fs');

let codeHtml = fs.readFileSync('c:/Users/TI/Documents/Horarios/Asignador_Index.html.txt', 'utf8');

codeHtml = codeHtml.replace(/\\\${prof}/g, '${prof}');
codeHtml = codeHtml.replace(/\\\${max}/g, '${max}');
codeHtml = codeHtml.replace(/\\\${cursos}/g, '${cursos}');
codeHtml = codeHtml.replace(/\\\${asig}/g, '${asig}');

fs.writeFileSync('c:/Users/TI/Documents/Horarios/Asignador_Index.html.txt', codeHtml);
console.log('Fixed interpolation strings.');
