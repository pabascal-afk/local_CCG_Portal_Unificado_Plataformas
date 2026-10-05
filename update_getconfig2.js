const fs = require('fs');
let code = fs.readFileSync('server/api/rpc.js', 'utf8');

const dictRegex = /if\(isAdmin\) \{\s*if\(!asigDict\[c\]\['TODAS'\]\) asigDict\[c\]\['TODAS'\] = new Set\(\);\s*if\(a\) asigDict\[c\]\['TODAS'\]\.add\(a\);\s*\} else \{/g;

const dictReplacement = `if(isAdmin) {
                   const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];
                   dias.forEach(diaNormal => {
                       if(!asigDict[c][diaNormal]) asigDict[c][diaNormal] = new Set();
                       if(a) asigDict[c][diaNormal].add(a);
                   });
                } else {`;

code = code.replace(dictRegex, dictReplacement);
fs.writeFileSync('server/api/rpc.js', code, 'utf8');
console.log('getConfigFrontend modificado para Admin');
