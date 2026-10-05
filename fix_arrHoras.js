const fs = require('fs');
let html = fs.readFileSync('public/recursos.html', 'utf8');

const fixRegex = /const diaStr = diasSemana\[dayIdx - 1\];\s*for\(let b=1; b<=arrHoras2\.length; b\+\+\) \{/;
const fixReplacement = `const hrString2 = (r && r.horarios_exactos) ? r.horarios_exactos : '08:00,08:45,09:30,10:15,11:00,11:45,12:30,13:15,14:00,14:45,15:30,16:15';
         const arrHoras2 = hrString2.split(',');
         const diaStr = diasSemana[dayIdx - 1];
         for(let b=1; b<=arrHoras2.length; b++) {`;

html = html.replace(fixRegex, fixReplacement);
fs.writeFileSync('public/recursos.html', html, 'utf8');
console.log('Fixed arrHoras2 error');
