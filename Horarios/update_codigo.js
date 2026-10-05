const fs = require('fs');
let code = fs.readFileSync('c:/Users/TI/Documents/Horarios/Asignador_Codigo.gs.txt', 'utf8');

const functionCode = `
function guardarReglas(generales, profes) {
  const ss = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.openById('1QgmRnkGO5AuQcb1P8WNZO15ZHwKHQ2qMeMRBrFJMIqo');
  
  // Guardar Reglas Generales
  const sheetGen = ss.getSheetByName('Reglas_Generales');
  if (sheetGen) {
    if (sheetGen.getLastRow() > 1) {
      sheetGen.getRange(2, 1, sheetGen.getLastRow() - 1, sheetGen.getLastColumn()).clearContent();
    }
    if (generales && generales.length > 0) {
      const gHeaders = sheetGen.getRange(1, 1, 1, sheetGen.getLastColumn()).getValues()[0].map(h => String(h).trim());
      const gData = generales.map(regla => gHeaders.map(h => regla[h] !== undefined ? regla[h] : ''));
      sheetGen.getRange(2, 1, gData.length, gData[0].length).setValues(gData);
    }
  }

  // Guardar Reglas Profesores
  const sheetProf = ss.getSheetByName('Reglas_Profesores');
  if (sheetProf) {
    if (sheetProf.getLastRow() > 1) {
      sheetProf.getRange(2, 1, sheetProf.getLastRow() - 1, sheetProf.getLastColumn()).clearContent();
    }
    if (profes && profes.length > 0) {
      const pHeaders = sheetProf.getRange(1, 1, 1, sheetProf.getLastColumn()).getValues()[0].map(h => String(h).trim());
      const pData = profes.map(regla => pHeaders.map(h => regla[h] !== undefined ? regla[h] : ''));
      sheetProf.getRange(2, 1, pData.length, pData[0].length).setValues(pData);
    }
  }
}
`;

code += '\n' + functionCode;
fs.writeFileSync('c:/Users/TI/Documents/Horarios/Asignador_Codigo.gs.txt', code);
console.log('Done');
