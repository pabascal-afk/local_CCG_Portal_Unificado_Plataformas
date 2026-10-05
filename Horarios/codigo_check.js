function doGet() {
  return HtmlService.createTemplateFromFile('Asignador_Index')
    .evaluate()
    .setTitle('Asignador de Horarios Automático - 2026')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getAppData() {
  const spreadsheetId = '1QgmRnkGO5AuQcb1P8WNZO15ZHwKHQ2qMeMRBrFJMIqo';
  const ss = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.openById(spreadsheetId);
  
  // 1. HORARIOS
  const sheet = ss.getSheets().find(s => s.getSheetId() == 1141469377) || ss.getSheets()[0];
  const data = sheet.getDataRange().getDisplayValues(); 
  
  let headerIndex = 0;
  for (let i = 0; i < data.length; i++) {
    const rowStr = data[i].join('').toLowerCase();
    if (rowStr.includes('curso') && (rowStr.includes('dia') || rowStr.includes('día')) && rowStr.includes('bloque')) {
      headerIndex = i;
      break;
    }
  }
  
  const headersRaw = data[headerIndex];
  const dataRows = data.slice(headerIndex + 1);
  
  const headers = headersRaw.map(h => {
    let clean = String(h).trim();
    if (clean.toLowerCase() === 'dia' || clean.toLowerCase() === 'día') return 'Día';
    if (clean.toLowerCase() === 'curso') return 'Curso';
    if (clean.toLowerCase() === 'bloque') return 'Bloque';
    if (clean.toLowerCase() === 'profesor') return 'Profesor';
    if (clean.toLowerCase() === 'asignatura') return 'Asignatura';
    if (clean.toLowerCase() === 'profesor 2') return 'Profesor 2';
    if (clean.toLowerCase() === 'profesor 3') return 'Profesor 3';
    if (clean.toLowerCase() === 'profesor 4') return 'Profesor 4';
    if (clean.toLowerCase() === 'profesor 5') return 'Profesor 5';
    return clean;
  });
  
  const horarios = dataRows.map((row, index) => {
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
  });

  // 2. REGLAS PROFESORES
  let reglasProfesores = [];
  const sheetProfes = ss.getSheetByName('Reglas_Profesores');
  if (sheetProfes) {
    const profData = sheetProfes.getDataRange().getDisplayValues();
    if(profData.length > 1) {
      const pHeaders = profData[0].map(h => String(h).trim());
      for(let i=1; i<profData.length; i++) {
        let obj = {};
        pHeaders.forEach((h, j) => obj[h] = profData[i][j]);
        reglasProfesores.push(obj);
      }
    }
  }

  // 3. REGLAS GENERALES
  let reglasGenerales = [];
  const sheetGenerales = ss.getSheetByName('Reglas_Generales');
  if (sheetGenerales) {
    const genData = sheetGenerales.getDataRange().getDisplayValues();
    if(genData.length > 1) {
      const gHeaders = genData[0].map(h => String(h).trim());
      for(let i=1; i<genData.length; i++) {
        let obj = {};
        gHeaders.forEach((h, j) => obj[h] = genData[i][j]);
        reglasGenerales.push(obj);
      }
    }
  }

  return { horarios, reglasProfesores, reglasGenerales };
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function guardarHorarioGenerado(asignaciones) {
  const ss = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.openById('1QgmRnkGO5AuQcb1P8WNZO15ZHwKHQ2qMeMRBrFJMIqo');
  const sheet = ss.getSheets().find(s => s.getSheetId() == 1141469377) || ss.getSheets()[0];
  const fullData = sheet.getDataRange().getValues();
  
  let headerIndex = 0;
  for (let i = 0; i < fullData.length; i++) {
    const rowStr = fullData[i].join('').toLowerCase();
    if (rowStr.includes('curso') && (rowStr.includes('dia') || rowStr.includes('día')) && rowStr.includes('bloque')) {
      headerIndex = i;
      break;
    }
  }

  const headers = fullData[headerIndex].map(h => String(h).trim().toLowerCase());
  const colDia = headers.indexOf('día') !== -1 ? headers.indexOf('día') : headers.indexOf('dia');
  const colBloque = headers.indexOf('bloque');
  const colCurso = headers.indexOf('curso');
  const colAsignatura = headers.indexOf('asignatura');
  const colProfesor = headers.indexOf('profesor');
  
  if (colDia === -1 || colBloque === -1) {
    throw new Error("No se encontraron las columnas 'Día' o 'Bloque'.");
  }
  
  let rowsToAppend = [];
  
  asignaciones.forEach(asig => {
    if(asig.isNew) {
       let newRow = new Array(headers.length).fill('');
       if(colCurso !== -1) newRow[colCurso] = asig.curso;
       if(colAsignatura !== -1) newRow[colAsignatura] = asig.asignatura;
       if(colProfesor !== -1) newRow[colProfesor] = asig.profesor;
       newRow[colDia] = asig.dia;
       newRow[colBloque] = asig.bloque;
       rowsToAppend.push(newRow);
    } else {
       if (asig.rowIndex !== undefined && asig.rowIndex >= 0) {
         let sheetRow = asig.rowIndex + 1; // rowIndex was stored as fullData array index, so +1 for sheet row
         sheet.getRange(sheetRow, colDia + 1).setValue(asig.dia);
         sheet.getRange(sheetRow, colBloque + 1).setValue(asig.bloque);
       }
    }
  });
  
  if (rowsToAppend.length > 0) {
      sheet.getRange(fullData.length + 1, 1, rowsToAppend.length, headers.length).setValues(rowsToAppend);
  }
}

function eliminarRegistroFila(rowIndex) {
  const ss = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.openById('1QgmRnkGO5AuQcb1P8WNZO15ZHwKHQ2qMeMRBrFJMIqo');
  const sheet = ss.getSheets().find(s => s.getSheetId() == 1141469377) || ss.getSheets()[0];
  
  // rowIndex is the 0-based index of the fullData array.
  // Row 1 in Sheets is index 0. Row 2 is index 1.
  // Therefore, the sheet row number is rowIndex + 1.
  if (rowIndex !== undefined && rowIndex >= 0) {
    sheet.deleteRow(rowIndex + 1);
  } else {
    throw new Error("Índice de fila inválido.");
  }
}

// Keep single update for manual edits just in case
function actualizarRegistroUnicoFila(rowIndex, dia, bloque) {
  const ss = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.openById('1QgmRnkGO5AuQcb1P8WNZO15ZHwKHQ2qMeMRBrFJMIqo');
  const sheet = ss.getSheets().find(s => s.getSheetId() == 1141469377) || ss.getSheets()[0];
  const data = sheet.getDataRange().getValues();
  
  let headerIndex = 0;
  for (let i = 0; i < data.length; i++) {
    const rowStr = data[i].join('').toLowerCase();
    if (rowStr.includes('curso') && (rowStr.includes('dia') || rowStr.includes('día')) && rowStr.includes('bloque')) {
      headerIndex = i;
      break;
    }
  }

  const headers = data[headerIndex].map(h => String(h).trim().toLowerCase());
  const diaIdx = headers.indexOf('día') !== -1 ? headers.indexOf('día') : headers.indexOf('dia');
  const bloqueIdx = headers.indexOf('bloque');
  
  if (diaIdx !== -1 && bloqueIdx !== -1 && rowIndex < data.length) {
    sheet.getRange(rowIndex + 1, diaIdx + 1).setValue(dia);
    sheet.getRange(rowIndex + 1, bloqueIdx + 1).setValue(bloque);
  }
}

function actualizarRegistroUnico(curso, dia, bloque, columna, nuevoValor) {
  const ss = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.openById('1QgmRnkGO5AuQcb1P8WNZO15ZHwKHQ2qMeMRBrFJMIqo');
  const sheet = ss.getSheets().find(s => s.getSheetId() == 1141469377) || ss.getSheets()[0];
  const data = sheet.getDataRange().getValues();
  
  let headerIndex = 0;
  for (let i = 0; i < data.length; i++) {
    const rowStr = data[i].join('').toLowerCase();
    if (rowStr.includes('curso') && (rowStr.includes('dia') || rowStr.includes('día')) && rowStr.includes('bloque')) {
      headerIndex = i;
      break;
    }
  }

  const headers = data[headerIndex].map(h => String(h).trim().toLowerCase());
  const colIndex = headers.indexOf(String(columna).toLowerCase());
  const cursoIdx = headers.indexOf('curso');
  const diaIdx = headers.indexOf('día') !== -1 ? headers.indexOf('día') : headers.indexOf('dia');
  const bloqueIdx = headers.indexOf('bloque');
  
  if (colIndex === -1 || cursoIdx === -1 || diaIdx === -1 || bloqueIdx === -1) return;

  for(let i=headerIndex+1; i<data.length; i++) {
    let cellDia = data[i][diaIdx] ? String(data[i][diaIdx]) : '';
    let cellCurso = String(data[i][cursoIdx] || '');
    let cellBloque = String(data[i][bloqueIdx] || '');
    if(cellCurso.trim() == String(curso).trim() && cellDia.toLowerCase().trim().startsWith(String(dia).substring(0,2).toLowerCase()) && cellBloque.trim() == String(bloque).trim()) {
      sheet.getRange(i+1, colIndex+1).setValue(nuevoValor);
      break;
    }
  }
}

function actualizarRegistroMasivo(columna, valorAntiguo, nuevoValor) {
  const ss = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.openById('1QgmRnkGO5AuQcb1P8WNZO15ZHwKHQ2qMeMRBrFJMIqo');
  const sheet = ss.getSheets().find(s => s.getSheetId() == 1141469377) || ss.getSheets()[0];
  const data = sheet.getDataRange().getValues();
  
  let headerIndex = 0;
  for (let i = 0; i < data.length; i++) {
    const rowStr = data[i].join('').toLowerCase();
    if (rowStr.includes('curso') && (rowStr.includes('dia') || rowStr.includes('día')) && rowStr.includes('bloque')) {
      headerIndex = i;
      break;
    }
  }

  const headers = data[headerIndex].map(h => String(h).trim().toLowerCase());
  const colIndex = headers.indexOf(String(columna).toLowerCase());
  
  if (colIndex === -1) return;

  for(let i=headerIndex+1; i<data.length; i++) {
    if(data[i][colIndex] === valorAntiguo) {
      sheet.getRange(i+1, colIndex+1).setValue(nuevoValor);
    }
  }
}

function generarReportesSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.openById('1QgmRnkGO5AuQcb1P8WNZO15ZHwKHQ2qMeMRBrFJMIqo');
  
  let sCursos = ss.getSheetByName('Reporte_Cursos');
  if(!sCursos) { sCursos = ss.insertSheet('Reporte_Cursos'); }
  else { sCursos.clear(); }
  
  let sProfes = ss.getSheetByName('Reporte_Profesores');
  if(!sProfes) { sProfes = ss.insertSheet('Reporte_Profesores'); }
  else { sProfes.clear(); }
  
  const appData = getAppData();
  const horarios = appData.horarios;
  
  const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  const bloques = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  
  const cursos = [...new Set(horarios.map(h => h.Curso))].filter(Boolean).sort();
  let rowCursor = 1;
  
  cursos.forEach(c => {
     let out = [];
     out.push([`HORARIO CURSO: ${c}`, '', '', '', '', '']);
     out.push(['Bloque', ...dias]);
     
     bloques.forEach(b => {
        let row = [b];
        dias.forEach(d => {
           let clases = horarios.filter(h => h.Curso === c && (h.Día || '').trim() === d && parseInt(h.Bloque) === b);
           if(clases.length > 0) {
              row.push(clases.map(x => `${x.Asignatura}\n(${x.Profesor})`).join('\n---\n'));
           } else {
              row.push('');
           }
        });
        out.push(row);
     });
     
     sCursos.getRange(rowCursor, 1, out.length, 6).setValues(out);
     sCursos.getRange(rowCursor, 1, 1, 6).setBackground('#2c3e50').setFontColor('white').setFontWeight('bold');
     sCursos.getRange(rowCursor+1, 1, 1, 6).setBackground('#ecf0f1').setFontWeight('bold');
     rowCursor += out.length + 2;
  });
  
  let todosProfes = [];
  horarios.forEach(h => {
     if(h.Profesor) todosProfes.push(h.Profesor);
     if(h.ProfesoresExtra) todosProfes.push(...h.ProfesoresExtra);
  });
  const profes = [...new Set(todosProfes)].filter(Boolean).sort();
  let rowProf = 1;
  
  profes.forEach(p => {
     let out = [];
     out.push([`HORARIO PROFESOR: ${p}`, '', '', '', '', '']);
     out.push(['Bloque', ...dias]);
     
     bloques.forEach(b => {
        let row = [b];
        dias.forEach(d => {
           let clases = horarios.filter(h => (h.Profesor === p || (h.ProfesoresExtra && h.ProfesoresExtra.includes(p))) && (h.Día || '').trim() === d && parseInt(h.Bloque) === b);
           if(clases.length > 0) {
              row.push(clases.map(x => `${x.Asignatura}\n(${x.Curso})`).join('\n---\n'));
           } else {
              row.push('');
           }
        });
        out.push(row);
     });
     
     sProfes.getRange(rowProf, 1, out.length, 6).setValues(out);
     sProfes.getRange(rowProf, 1, 1, 6).setBackground('#18bc9c').setFontColor('white').setFontWeight('bold');
     sProfes.getRange(rowProf+1, 1, 1, 6).setBackground('#ecf0f1').setFontWeight('bold');
     rowProf += out.length + 2;
  });
  
  return "¡Reportes generados exitosamente en las pestañas 'Reporte_Cursos' y 'Reporte_Profesores'!";
}

function limpiarDatosNube() {
  const ss = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.openById('1QgmRnkGO5AuQcb1P8WNZO15ZHwKHQ2qMeMRBrFJMIqo');
  const sheet = ss.getSheets().find(s => s.getSheetId() == 1141469377) || ss.getSheets()[0];
  const data = sheet.getDataRange().getValues();
  
  let headerIndex = 0;
  for (let i = 0; i < data.length; i++) {
    const rowStr = data[i].join('').toLowerCase();
    if (rowStr.includes('curso') && (rowStr.includes('dia') || rowStr.includes('día')) && rowStr.includes('bloque')) {
      headerIndex = i;
      break;
    }
  }

  const headers = data[headerIndex].map(h => String(h).trim().toLowerCase());
  const asigIdx = headers.indexOf('asignatura');
  const diaIdx = headers.indexOf('día') !== -1 ? headers.indexOf('día') : headers.indexOf('dia');
  const bloqueIdx = headers.indexOf('bloque');
  
  if (asigIdx === -1 || diaIdx === -1 || bloqueIdx === -1) return "Error encontrando columnas";
  
  let rowsToDelete = [];
  for(let i = data.length - 1; i > headerIndex; i--) {
      let asig = String(data[i][asigIdx]).trim();
      if(asig === 'Hora No Lectiva' || asig === 'Consejo') {
          rowsToDelete.push(i + 1);
      }
  }
  
  rowsToDelete.forEach(r => sheet.deleteRow(r));
  
  const newData = sheet.getDataRange().getValues();
  const numRows = newData.length - (headerIndex + 1);
  if (numRows > 0) {
      const emptyDia = new Array(numRows).fill(['']);
      const emptyBloque = new Array(numRows).fill(['']);
      sheet.getRange(headerIndex + 2, diaIdx + 1, numRows, 1).setValues(emptyDia);
      sheet.getRange(headerIndex + 2, bloqueIdx + 1, numRows, 1).setValues(emptyBloque);
  }
  
  return "Tablero limpiado exitosamente.";
}

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
