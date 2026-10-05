// ID de la Planilla Central (Donde estan Usuarios_Autorizados, Evaluaciones, Reservas_Recursos)
const SPREADSHEET_ID = 'TU_SPREADSHEET_ID_AQUI';

function doGet() {
  return HtmlService.createTemplateFromFile('Frontend')
    .evaluate()
    .setTitle('Gestión de Usuarios - RBAC')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function verificarAccesoAdmin() {
  const emailActual = Session.getActiveUser().getEmail().toLowerCase();
  if (!emailActual) throw new Error("No se pudo detectar el usuario.");
  
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheetUsuarios = ss.getSheetByName('Usuarios_Autorizados');
  if (!sheetUsuarios) throw new Error("La hoja Usuarios_Autorizados no existe en la base de datos.");
  
  const datos = sheetUsuarios.getDataRange().getValues();
  for (let i = 1; i < datos.length; i++) {
    if (datos[i][0] && datos[i][0].toString().trim().toLowerCase() === emailActual) {
      const rol = datos[i][1] ? datos[i][1].toString().trim() : '';
      if (rol.toLowerCase() === 'administrador' || rol.toLowerCase() === 'admin' || rol.toLowerCase() === 'directivo general') {
        return true;
      } else {
        throw new Error("Acceso denegado: Se requiere rol de Administrador o Directivo General.");
      }
    }
  }
  throw new Error("Acceso denegado: Usuario no registrado.");
}

function obtenerUsuarios() {
  verificarAccesoAdmin();
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Usuarios_Autorizados');
  const data = sheet.getDataRange().getValues();
  
  const usuarios = [];
  for (let i = 1; i < data.length; i++) {
    if(data[i][0]) {
      usuarios.push({
        email: data[i][0],
        rol: data[i][1],
        nombre: data[i][2]
      });
    }
  }
  return usuarios;
}

function guardarUsuario(email, rol, nombre) {
  verificarAccesoAdmin();
  const emailNorm = email.toLowerCase().trim();
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Usuarios_Autorizados');
  const data = sheet.getDataRange().getValues();
  
  // Buscar si ya existe
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] && data[i][0].toString().toLowerCase().trim() === emailNorm) {
      // Actualizar
      sheet.getRange(i + 1, 2).setValue(rol);
      sheet.getRange(i + 1, 3).setValue(nombre);
      return "Usuario actualizado correctamente.";
    }
  }
  
  // Nuevo
  sheet.appendRow([emailNorm, rol, nombre]);
  return "Usuario creado correctamente.";
}

function eliminarUsuario(email) {
  verificarAccesoAdmin();
  const emailNorm = email.toLowerCase().trim();
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Usuarios_Autorizados');
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] && data[i][0].toString().toLowerCase().trim() === emailNorm) {
      sheet.deleteRow(i + 1);
      return "Usuario eliminado.";
    }
  }
  throw new Error("Usuario no encontrado.");
}
