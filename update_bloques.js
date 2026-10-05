const fs = require('fs');
let html = fs.readFileSync('public/recursos.html', 'utf8');

// 1. Text description
html = html.replace(/cada uno de los 12 bloques/g, 'cada bloque');
html = html.replace(/El bloque siempre durar.*? en el dibujo\./, 'El número de horas que ingreses definirá la cantidad total de bloques por día (ej. si ingresas 6 horas, habrán 6 bloques).');

// 2. generarEventosDinamicos
html = html.replace(/const arrHoras = hrString\.split\(\',\'\);/, "const arrHoras = hrString.split(',');\n        const totalB = arrHoras.length;");
html = html.replace(/let permitidos = disp \? \(disp\[dStr\] \|\| \[\]\) : \[1,2,3,4,5,6,7,8,9,10,11,12\];/g, "let permitidos = disp ? (disp[dStr] || []) : Array.from({length: totalB}, (_, i) => i + 1);");
html = html.replace(/for \(let b = 1; b <= 12; b\+\+\) \{/g, "for (let b = 1; b <= totalB; b++) {");

// 3. abrirModalReserva
// Need to find the `for(let b=1; b<=12; b++)` in abrirModalReserva.
// Look for `const diaStr = diasSemana[dayIdx - 1];`
const regexModalRes = /const diaStr = diasSemana\[dayIdx - 1\];\s*for\(let b=1; b<=12; b\+\+\) \{/;
const replacementModalRes = `const hrString2 = (r && r.horarios_exactos) ? r.horarios_exactos : '08:00,08:45,09:30,10:15,11:00,11:45,12:30,13:15,14:00,14:45,15:30,16:15';
         const arrHoras2 = hrString2.split(',');
         const diaStr = diasSemana[dayIdx - 1];
         for(let b=1; b<=arrHoras2.length; b++) {`;
html = html.replace(regexModalRes, replacementModalRes);

// Delete the inner duplicate definition of hrString2
const regexInnerHr2 = /const hrString2 = \(r && r\.horarios_exactos\) \? r\.horarios_exactos : '08:00,08:45,09:30,10:15,11:00,11:45,12:30,13:15,14:00,14:45,15:30,16:15';\s*const arrHoras2 = hrString2\.split\(\',\'\);/;
html = html.replace(regexInnerHr2, "");

// 4. abrirDisp
// Look for `const body = document.getElementById('dispBody');\s*body.innerHTML = '';\s*for\(let b=1; b<=12; b\+\+\) \{`
const regexDisp = /const body = document\.getElementById\('dispBody'\);\s*body\.innerHTML = '';\s*for\(let b=1; b<=12; b\+\+\) \{/;
const replacementDisp = `const hrString3 = r.horarios_exactos || '08:00,08:45,09:30,10:15,11:00,11:45,12:30,13:15,14:00,14:45,15:30,16:15';
         const totalBDisp = hrString3.split(',').length;
         const body = document.getElementById('dispBody');
         body.innerHTML = '';
         for(let b=1; b<=totalBDisp; b++) {`;
html = html.replace(regexDisp, replacementDisp);

fs.writeFileSync('public/recursos.html', html, 'utf8');
console.log('recursos.html actualizado con bloques dinámicos');
