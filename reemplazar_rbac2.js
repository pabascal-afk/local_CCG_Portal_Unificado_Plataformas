const fs = require('fs');
let code = fs.readFileSync('Reserva de Recursos/Backend.gs', 'utf8');

const regex = /function guardarReservaManual\(datos\) {[\s\S]*?const ss = SpreadsheetApp.openById\(SPREADSHEET_ID\);/;

const replacement = `function verificarPermisoReserva() {
  const emailActual = Session.getActiveUser().getEmail().toLowerCase();
  if (!emailActual) throw new Error("Usuario desconocido.");
  
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheetUsuarios = ss.getSheetByName('Usuarios_Autorizados');
  if (!sheetUsuarios) throw new Error("No se encuentra la configuración de usuarios.");
  
  const data = sheetUsuarios.getDataRange().getValues();
  for(let i=1; i<data.length; i++) {
    if(data[i][0] && data[i][0].toString().trim().toLowerCase() === emailActual) {
      const rol = data[i][1] ? data[i][1].toString().trim().toLowerCase() : 'profesor';
      if (rol === 'profesor') {
         throw new Error("Acceso denegado: Los profesores no pueden reservar recursos directamente. Solicítelo a Coordinación.");
      }
      return true; // Permitido para otros roles (Coordinacion, Admin, Directivo)
    }
  }
  throw new Error("Usuario no autorizado.");
}

function guardarReservaManual(datos) {
  verificarPermisoReserva();
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);`;

code = code.replace(regex, replacement);

const regex2 = /function eliminarReserva\(id\) {[\s\S]*?const ss = SpreadsheetApp.openById\(SPREADSHEET_ID\);/;
const replacement2 = `function eliminarReserva(id) {
  verificarPermisoReserva();
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);`;

code = code.replace(regex2, replacement2);

fs.writeFileSync('Reserva de Recursos/Backend.gs', code, 'utf8');
console.log('RBAC enforced en Reserva de Recursos.');
