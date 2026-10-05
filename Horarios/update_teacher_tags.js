const fs = require('fs');

// 1. Modificar Código.gs
let codeGs = fs.readFileSync('c:/Users/TI/Documents/Horarios/Asignador_Codigo.gs.txt', 'utf8');

const oldIngestion = `  const horarios = dataRows.map((row, index) => {
    let obj = { _rowIndex: headerIndex + 1 + index };
    headers.forEach((header, i) => {
      if (header) obj[header] = row[i];
    });
    
    let asig = String(obj['Asignatura'] || '').toLowerCase();
    if (asig.includes('electivo')) {
      obj.ProfesoresExtra = [];
      ['Profesor 2', 'Profesor 3', 'Profesor 4', 'Profesor 5'].forEach(pKey => {
        let pName = String(obj[pKey] || '').trim();
        if (pName) obj.ProfesoresExtra.push(pName);
      });
    }
    return obj;
  });`;

const newIngestion = `  const horarios = dataRows.map((row, index) => {
    let obj = { _rowIndex: headerIndex + 1 + index };
    headers.forEach((header, i) => {
      if (header) obj[header] = row[i];
    });
    
    obj.MateriasExtra = {};
    ['Profesor', 'Profesor 2', 'Profesor 3', 'Profesor 4', 'Profesor 5'].forEach(pKey => {
      if (obj[pKey]) {
         let val = String(obj[pKey]);
         let match = val.match(/^(.*?)\\((.*?)\\)$/);
         if (match) {
            obj[pKey] = match[1].trim(); // Nombre limpio del profesor
            obj.MateriasExtra[obj[pKey]] = match[2].trim(); // La asignatura extra
         } else {
            obj[pKey] = val.trim();
         }
      }
    });

    let asig = String(obj['Asignatura'] || '').toLowerCase();
    if (asig.includes('electivo')) {
      obj.ProfesoresExtra = [];
      ['Profesor 2', 'Profesor 3', 'Profesor 4', 'Profesor 5'].forEach(pKey => {
        let pName = obj[pKey];
        if (pName) obj.ProfesoresExtra.push(pName);
      });
    }
    return obj;
  });`;

codeGs = codeGs.replace(oldIngestion, newIngestion);
fs.writeFileSync('c:/Users/TI/Documents/Horarios/Asignador_Codigo.gs.txt', codeGs);


// 2. Modificar Index.html
let codeHtml = fs.readFileSync('c:/Users/TI/Documents/Horarios/Asignador_Index.html.txt', 'utf8');

const oldTag = `<span class="tag tag-profesor \${hasConflict ? 'conflict-tag' : ''}" 
                        onclick="\${clickProf}"
                        ondblclick="dblClickTag('Profesor', '\${c.Profesor}', '\${c.Curso}', '\${c.Día}', \${b})">\${c.Profesor}</span>`;

const newTag = `<span class="tag tag-profesor \${hasConflict ? 'conflict-tag' : ''}" 
                        onclick="\${clickProf}"
                        ondblclick="dblClickTag('Profesor', '\${c.Profesor}', '\${c.Curso}', '\${c.Día}', \${b})">\${c.Profesor} \${c.MateriasExtra && c.MateriasExtra[c.Profesor] ? '<i>(' + c.MateriasExtra[c.Profesor] + ')</i>' : ''}</span>`;

codeHtml = codeHtml.replace(oldTag, newTag);

const oldExtraTag = `\${c.ProfesoresExtra ? c.ProfesoresExtra.map(p => \`<span class="tag tag-profesor" onclick="clickTag('Profesor', '\${p}')">\${p}</span>\`).join('') : ''}`;

const newExtraTag = `\${c.ProfesoresExtra ? c.ProfesoresExtra.map(p => \`<span class="tag tag-profesor" onclick="clickTag('Profesor', '\${p}')">\${p} \${c.MateriasExtra && c.MateriasExtra[p] ? '<i>(' + c.MateriasExtra[p] + ')</i>' : ''}</span>\`).join('') : ''}`;

codeHtml = codeHtml.replace(oldExtraTag, newExtraTag);


const oldBandejaTag = `<span class="tag tag-profesor" onclick="clickTag('Profesor', '\${c.Profesor}')">\${c.Profesor}</span>`;

const newBandejaTag = `<span class="tag tag-profesor" onclick="clickTag('Profesor', '\${c.Profesor}')">\${c.Profesor} \${c.MateriasExtra && c.MateriasExtra[c.Profesor] ? '<i>(' + c.MateriasExtra[c.Profesor] + ')</i>' : ''}</span>`;

codeHtml = codeHtml.replace(oldBandejaTag, newBandejaTag);

fs.writeFileSync('c:/Users/TI/Documents/Horarios/Asignador_Index.html.txt', codeHtml);
console.log('Teacher tags separated logic applied');
