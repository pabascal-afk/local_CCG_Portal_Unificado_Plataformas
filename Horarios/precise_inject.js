const fs = require('fs');

let codeGs = fs.readFileSync('c:/Users/TI/Documents/Horarios/Asignador_Codigo.gs.txt', 'utf8');

const targetStr = `    headers.forEach((header, i) => {
      if (header) obj[header] = row[i];
    });`;

const insertStr = `    
    obj.MateriasExtra = {};
    ['Profesor', 'Profesor 2', 'Profesor 3', 'Profesor 4', 'Profesor 5'].forEach(pKey => {
      if (obj[pKey]) {
         let val = String(obj[pKey]).trim();
         let match = val.match(/^(.*?)\\s*\\((.*?)\\)$/);
         if (match) {
            obj[pKey] = match[1].trim(); // Nombre limpio del profesor
            obj.MateriasExtra[obj[pKey]] = match[2].trim(); // La asignatura extra
         } else {
            obj[pKey] = val;
         }
      }
    });`;

codeGs = codeGs.replace(targetStr, targetStr + insertStr);

const oldElectivo = `      ['Profesor 2', 'Profesor 3', 'Profesor 4', 'Profesor 5'].forEach(pKey => {
        let pName = String(obj[pKey] || '').trim();
        if (pName) obj.ProfesoresExtra.push(pName);
      });`;

const newElectivo = `      ['Profesor 2', 'Profesor 3', 'Profesor 4', 'Profesor 5'].forEach(pKey => {
        let pName = obj[pKey];
        if (pName) obj.ProfesoresExtra.push(pName);
      });`;

codeGs = codeGs.replace(oldElectivo, newElectivo);

fs.writeFileSync('c:/Users/TI/Documents/Horarios/Asignador_Codigo.gs.txt', codeGs);
console.log('Codigo.gs updated successfully via precise injection!');
