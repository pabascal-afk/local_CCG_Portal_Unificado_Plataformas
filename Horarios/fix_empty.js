const fs=require('fs');
let code=fs.readFileSync('c:/Users/TI/Documents/Horarios/Asignador_Codigo.gs.txt', 'utf8'); 
code = code.replace('reglasGenerales.push(obj);', "if (obj['Asignatura'] && String(obj['Asignatura']).trim() !== '') reglasGenerales.push(obj);"); 
code = code.replace('reglasProfesores.push(obj);', "if (obj['Nombre Profesor'] && String(obj['Nombre Profesor']).trim() !== '') reglasProfesores.push(obj);"); 
fs.writeFileSync('c:/Users/TI/Documents/Horarios/Asignador_Codigo.gs.txt', code); 
console.log('Fixed');
