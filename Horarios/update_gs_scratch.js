const fs = require('fs');

let codeGs = fs.readFileSync('c:/Users/TI/Documents/Horarios/Asignador_Codigo.gs.txt', 'utf8');

// Update guardarHorarioGenerado
const oldGuardar = `         let sheetRow = asig.rowIndex + 1; // rowIndex was stored as fullData array index, so +1 for sheet row
         sheet.getRange(sheetRow, colDia + 1).setValue(asig.dia);
         sheet.getRange(sheetRow, colBloque + 1).setValue(asig.bloque);
       }
    }
  });`;

const newGuardar = `         let sheetRow = asig.rowIndex + 1; // rowIndex was stored as fullData array index, so +1 for sheet row
         sheet.getRange(sheetRow, colDia + 1).setValue(asig.dia);
         sheet.getRange(sheetRow, colBloque + 1).setValue(asig.bloque);
         if (colProfesor !== -1 && asig.profesor !== undefined) {
             // Si el profesor fue modificado o limpiado, se actualiza, reconstruyendo la materia extra si existe
             let profeStr = asig.profesor;
             if (asig.materiasExtra && asig.materiasExtra[asig.profesor]) {
                 profeStr += ' (' + asig.materiasExtra[asig.profesor] + ')';
             }
             sheet.getRange(sheetRow, colProfesor + 1).setValue(profeStr);
         }
       }
    }
  });`;

codeGs = codeGs.replace(oldGuardar, newGuardar);

// Add guardarReglasProfesores
const addReglas = `
function guardarReglasProfesores(reglasProfesoresArr) {
  const ss = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.openById('1QgmRnkGO5AuQcb1P8WNZO15ZHwKHQ2qMeMRBrFJMIqo');
  let sheet = ss.getSheetByName('Reglas_Profesores');
  if (!sheet) {
    sheet = ss.insertSheet('Reglas_Profesores');
  }
  sheet.clear();
  
  if (reglasProfesoresArr.length === 0) return;
  
  const headers = ['Nombre Profesor', 'Horas Maximas', 'Cursos', 'Asignaturas'];
  let data = [headers];
  
  reglasProfesoresArr.forEach(r => {
    data.push([
      r['Nombre Profesor'] || '',
      r['Horas Maximas'] || '',
      r['Cursos'] || '',
      r['Asignaturas'] || ''
    ]);
  });
  
  sheet.getRange(1, 1, data.length, headers.length).setValues(data);
}
`;

codeGs += addReglas;

fs.writeFileSync('c:/Users/TI/Documents/Horarios/Asignador_Codigo.gs.txt', codeGs);
console.log('Codigo GS updated with scratch features.');
