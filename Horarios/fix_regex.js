const fs = require('fs');

let codeGs = fs.readFileSync('c:/Users/TI/Documents/Horarios/Asignador_Codigo.gs.txt', 'utf8');

const oldRegex = `         let val = String(obj[pKey]);
         let match = val.match(/^(.*?)\\((.*?)\\)$/);`;

const newRegex = `         let val = String(obj[pKey]).trim();
         let match = val.match(/^(.*?)\\s*\\((.*?)\\)$/);`;

codeGs = codeGs.replace(oldRegex, newRegex);

fs.writeFileSync('c:/Users/TI/Documents/Horarios/Asignador_Codigo.gs.txt', codeGs);
console.log('Regex fixed in Asignador_Codigo');
