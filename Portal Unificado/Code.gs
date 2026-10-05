const SPREADSHEET_ID = 'TU_SPREADSHEET_ID_AQUI';

function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('Portal Unificado - Colegio')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getContextoUsuario() {
  const emailActual = Session.getActiveUser().getEmail().toLowerCase();
  if (!emailActual) return { email: 'Desconocido', rol: 'Desconocido' };
  
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheetUsuarios = ss.getSheetByName('Usuarios_Autorizados');
  if (!sheetUsuarios) return { email: emailActual, rol: 'Profesor' }; // Default si no esta configurado
  
  const datos = sheetUsuarios.getDataRange().getValues();
  for (let i = 1; i < datos.length; i++) {
    if (datos[i][0] && datos[i][0].toString().trim().toLowerCase() === emailActual) {
      return {
        email: emailActual,
        rol: datos[i][1] ? datos[i][1].toString().trim() : 'Profesor'
      };
    }
  }
  
  return { email: emailActual, rol: 'Profesor' }; // Default
}

function obtenerUrls() {
  // Estas URLs deben ser reemplazadas por las URLs publicadas de cada Web App
  return {
    evaluaciones: "https://script.google.com/macros/s/TU_URL_PRUEBAS/exec",
    calendario: "https://script.google.com/macros/s/TU_URL_CALENDARIO/exec",
    horarios: "https://script.google.com/macros/s/TU_URL_HORARIOS/exec",
    recursos: "https://script.google.com/macros/s/TU_URL_RECURSOS/exec",
    usuarios: "https://script.google.com/macros/s/TU_URL_USUARIOS/exec"
  };
}
