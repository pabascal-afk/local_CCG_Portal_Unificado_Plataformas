// Reemplazar con el ID de la planilla que tiene la pestana Reservas_Recursos (la misma de Calendario Pruebas)
const SPREADSHEET_ID = 'TU_SPREADSHEET_ID_AQUI'; 

function doGet() {
  return HtmlService.createTemplateFromFile('Frontend')
    .evaluate()
    .setTitle('Reserva de Recursos')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getReservas() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Reservas_Recursos');
  if (!sheet) return [];
  
  const data = sheet.getDataRange().getValues();
  // Headers: ['ID_Reserva', 'ID_Evaluacion', 'Fecha', 'Bloques', 'Recurso', 'Curso', 'Profesor_Email', 'Estado', 'Creado_En']
  
  const reservas = [];
  const tz = ss.getSpreadsheetTimeZone();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][7] === 'Cancelada') continue;
    
    let fecha = data[i][2];
    if (fecha instanceof Date) {
      fecha = Utilities.formatDate(fecha, tz, "yyyy-MM-dd");
    }
    
    reservas.push({
      id: data[i][0],
      fecha: fecha,
      bloques: data[i][3],
      recurso: data[i][4],
      curso: data[i][5],
      profesor: data[i][6],
      title: `${data[i][4]} - B:${data[i][3]} - ${data[i][5]}`,
      start: fecha,
      color: getColorRecurso(data[i][4])
    });
  }
  return reservas;
}

function getColorRecurso(recurso) {
  switch(recurso) {
    case 'Laboratorio de Computación': return '#4285F4';
    case 'Laboratorio Móvil 1': return '#0F9D58';
    case 'Laboratorio Móvil 2': return '#0F9D58';
    case 'Laboratorio de Ciencias': return '#F4B400';
    case 'Auditorio': return '#DB4437';
    default: return '#757575';
  }
}

function verificarPermisoReserva() {
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
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Reservas_Recursos');
  if (!sheet) throw new Error("No existe la base de datos de reservas.");
  
  // Validar disponibilidad
  const recursoDisponible = validarDisponibilidadRecurso(datos.fecha, datos.bloques, datos.recurso, sheet, ss.getSpreadsheetTimeZone());
  if (!recursoDisponible) {
    throw new Error(`El ${datos.recurso} ya está ocupado en alguno de los bloques seleccionados.`);
  }
  
  const idReserva = Utilities.getUuid();
  const ahora = new Date();
  const email = Session.getActiveUser().getEmail() || 'usuario_desconocido';
  
  sheet.appendRow([
    idReserva,
    'MANUAL',
    datos.fecha,
    datos.bloques.join(','),
    datos.recurso,
    datos.motivo || 'Uso General',
    email,
    'Aprobada',
    ahora
  ]);
  
  return "Reserva guardada exitosamente.";
}

function validarDisponibilidadRecurso(fechaStr, bloquesSolicitados, recurso, sheet, tz) {
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    let rFecha = data[i][2];
    let rBloquesStr = data[i][3] ? data[i][3].toString() : "";
    let rRecurso = data[i][4];
    let rEstado = data[i][7];
    
    if (rFecha instanceof Date) {
      rFecha = Utilities.formatDate(rFecha, tz, "yyyy-MM-dd");
    }
    
    if (rFecha === fechaStr && rRecurso === recurso && rEstado !== 'Cancelada') {
      let bloquesOcupados = rBloquesStr.split(',');
      for (let b of bloquesSolicitados) {
        if (bloquesOcupados.includes(b)) {
          return false;
        }
      }
    }
  }
  return true;
}

function eliminarReserva(id) {
  verificarPermisoReserva();
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Reservas_Recursos');
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      sheet.getRange(i + 1, 8).setValue('Cancelada');
      return "Reserva cancelada.";
    }
  }
  throw new Error("Reserva no encontrada.");
}
