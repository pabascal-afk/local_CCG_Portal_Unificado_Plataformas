const fs = require('fs');
let codeGs = fs.readFileSync('c:/Users/TI/Documents/Horarios/Asignador_Codigo.gs.txt', 'utf8');

// 1. Add obtenerRolYEmail function at the end
const rbacFunc = `
function obtenerRolYEmail() {
  const email = Session.getActiveUser().getEmail() || '';
  const ss = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.openById('1QgmRnkGO5AuQcb1P8WNZO15ZHwKHQ2qMeMRBrFJMIqo');
  
  let sheetUsuarios = ss.getSheetByName('Usuarios');
  if (!sheetUsuarios) {
    sheetUsuarios = ss.insertSheet('Usuarios');
    sheetUsuarios.appendRow(['Email', 'Rol']);
    if (email) {
      sheetUsuarios.appendRow([email, 'SUPERADMIN']);
    }
  }
  
  if (!email) {
    return { email: 'Anonimo', rol: 'LECTOR' };
  }
  
  const data = sheetUsuarios.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toString().toLowerCase() === email.toLowerCase()) {
      let rol = data[i][1].toString().toUpperCase();
      if (rol === 'SUPERADMIN' || rol === 'ADMIN' || rol === 'LECTOR') {
        return { email: email, rol: rol };
      }
    }
  }
  
  if (email.endsWith('@colegiocerrogrande.cl')) {
    return { email: email, rol: 'LECTOR' };
  }
  
  return { email: email, rol: 'UNAUTHORIZED' };
}
`;
codeGs += rbacFunc;

// 2. Modify getAppData
const oldReturnAppData = `return { 
      horarios: horariosClean, 
      reglasGrales: rGrales, 
      reglasProfes: rProfes 
  };`;
const newReturnAppData = `
  const userAccess = obtenerRolYEmail();
  if (userAccess.rol === 'UNAUTHORIZED') {
      return { error: 'UNAUTHORIZED', email: userAccess.email };
  }
  return { 
      horarios: horariosClean, 
      reglasGrales: rGrales, 
      reglasProfes: rProfes,
      userRol: userAccess.rol,
      userEmail: userAccess.email
  };`;
codeGs = codeGs.replace(oldReturnAppData, newReturnAppData);

// 3. Modify guardarHorarioGenerado
const oldGuardarHorario = `function guardarHorarioGenerado(asignaciones) {
  const ss = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.openById('1QgmRnkGO5AuQcb1P8WNZO15ZHwKHQ2qMeMRBrFJMIqo');`;
const newGuardarHorario = `function guardarHorarioGenerado(asignaciones) {
  const userAccess = obtenerRolYEmail();
  if (userAccess.rol !== 'SUPERADMIN' && userAccess.rol !== 'ADMIN') {
    throw new Error('No tienes permisos de Administrador para guardar cambios en el horario.');
  }
  const ss = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.openById('1QgmRnkGO5AuQcb1P8WNZO15ZHwKHQ2qMeMRBrFJMIqo');`;
codeGs = codeGs.replace(oldGuardarHorario, newGuardarHorario);

// 4. Modify guardarReglasProfesores
const oldGuardarReglas = `function guardarReglasProfesores(reglasProfesoresArr) {
  const ss = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.openById('1QgmRnkGO5AuQcb1P8WNZO15ZHwKHQ2qMeMRBrFJMIqo');`;
const newGuardarReglas = `function guardarReglasProfesores(reglasProfesoresArr) {
  const userAccess = obtenerRolYEmail();
  if (userAccess.rol !== 'SUPERADMIN') {
    throw new Error('Solo un Super Admin puede modificar los perfiles de profesores.');
  }
  const ss = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.openById('1QgmRnkGO5AuQcb1P8WNZO15ZHwKHQ2qMeMRBrFJMIqo');`;
codeGs = codeGs.replace(oldGuardarReglas, newGuardarReglas);

fs.writeFileSync('c:/Users/TI/Documents/Horarios/Asignador_Codigo.gs.txt', codeGs);
console.log('RBAC backend implemented');
