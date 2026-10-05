/**
 * SISTEMA DE GESTIÃ“N DE AGENDA ESCOLAR (V2 - GROUND UP)
 * Archivo: Backend.gs
 */

const ID_HORARIOS_EXT = '1QgmRnkGO5AuQcb1P8WNZO15ZHwKHQ2qMeMRBrFJMIqo';
const GID_HORARIOS = 1141469377;

const ID_CALENDARIO_EXT = '1R897XLkr841Bkl22TY_dgDL6FENzvUdAmR-Ph5yaZdo';
const GID_CALENDARIO = 263777311;

/**
 * ==========================================
 * 1. CONFIGURACIÃ“N INICIAL
 * ==========================================
 * Ejecutar esta funciÃ³n UNA VEZ en el nuevo archivo 
 * para crear las pestaÃ±as base.
 */
function setupDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  const sheetsNecesarios = [
    { name: 'Evaluaciones', headers: ['ID', 'Fecha_Agenda', 'Fecha_Evaluacion', 'Curso', 'Asignatura', 'Tipo', 'Profesor_Email', 'Profesor_Nombre', 'Detalles', 'Creado_En'] },
    { name: 'Usuarios_Autorizados', headers: ['Email', 'Rol', 'Nombre'] },
    { name: 'Config_Topes', headers: ['Curso', 'Max_Diarias_Escritas', 'Max_Diarias_Otras', 'Max_Semanales_Escritas', 'Max_Semanales_Total'] },
    { name: 'Reservas_Recursos', headers: ['ID_Reserva', 'ID_Evaluacion', 'Fecha', 'Bloques', 'Recurso', 'Curso', 'Profesor_Email', 'Estado', 'Creado_En'] }
  ];

  sheetsNecesarios.forEach(req => {
    let sheet = ss.getSheetByName(req.name);
    if (!sheet) {
      sheet = ss.insertSheet(req.name);
      sheet.appendRow(req.headers);
      sheet.getRange(1, 1, 1, req.headers.length).setFontWeight('bold').setBackground('#d9ead3');
    }
  });

  // Agregar un usuario de prueba si estÃ¡ vacÃ­o
  const sheetUsuarios = ss.getSheetByName('Usuarios_Autorizados');
  if (sheetUsuarios.getLastRow() === 1) {
    const emailTest = Session.getActiveUser().getEmail() || 'tu_correo@colegio.edu';
    sheetUsuarios.appendRow([emailTest, 'Admin', 'Administrador Inicial']);
  }

  SpreadsheetApp.getUi().alert('âœ… Base de datos inicializada correctamente.');
}

/**
 * ==========================================
 * 2. SERVIR INTERFAZ WEB
 * ==========================================
 */
function doGet(e) {
  const template = HtmlService.createTemplateFromFile('Frontend');
  const usuario = verificarUsuario();
  
  if (!usuario.autorizado) {
    return HtmlService.createHtmlOutput(`<h2>Acceso Denegado</h2><p>El correo ${usuario.email} no estÃ¡ autorizado.</p>`);
  }

  template.usuario = usuario;
  return template.evaluate()
    .setTitle('Agenda Escolar')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * ==========================================
 * 3. SEGURIDAD Y PERMISOS
 * ==========================================
 */
function verificarUsuario() {
  const emailActual = Session.getActiveUser().getEmail().toLowerCase();
  if (!emailActual) return { autorizado: false, email: 'Desconocido' };

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetUsuarios = ss.getSheetByName('Usuarios_Autorizados');
  if (!sheetUsuarios) return { autorizado: false, email: emailActual };

  const datos = sheetUsuarios.getDataRange().getValues().slice(1);
  for (let r of datos) {
    if (r[0] && r[0].toString().trim().toLowerCase() === emailActual) {
      return {
        autorizado: true,
        email: emailActual,
        rol: r[1] ? r[1].toString().trim() : 'Profesor',
        nombre: r[2] ? r[2].toString().trim() : emailActual
      };
    }
  }

  return { autorizado: false, email: emailActual };
}

/**
 * ==========================================
 * 4. LECTURA DE FUENTES EXTERNAS
 * ==========================================
 */
function getBloqueosExternos() {
  try {
    const extSs = SpreadsheetApp.openById(ID_CALENDARIO_EXT);
    let sheet = null;
    for (let s of extSs.getSheets()) {
      if (s.getSheetId() === GID_CALENDARIO) { sheet = s; break; }
    }
    if (!sheet) return [];

    const datos = sheet.getDataRange().getValues().slice(1);
    const bloqueos = [];
    
    datos.forEach(r => {
      let fechaBase = r[0];
      const evento = r[1] ? r[1].toString().trim() : 'Evento';
      const tipo = r[2] ? r[2].toString().trim().toUpperCase() : '';
      const flagBloquea = r[3] ? r[3].toString().trim().toLowerCase() : '';
      const strBloques = r[4] ? r[4].toString().trim().toUpperCase() : '';

      // Si la fecha viene como texto tipo "10/09/2026", la convertimos a objeto Date
      if (typeof fechaBase === 'string') {
        const strLimpio = fechaBase.trim();
        const partes = strLimpio.split('/');
        if (partes.length === 3) {
          fechaBase = new Date(parseInt(partes[2]), parseInt(partes[1]) - 1, parseInt(partes[0]));
        } else {
          fechaBase = new Date(strLimpio); // Intento fallback
        }
      }

      if (fechaBase instanceof Date && !isNaN(fechaBase)) {
        // Bloquea si la columna D dice "si" o si es FERIADO o VACACIONES
        const isBloqueo = (flagBloquea === 'si' || flagBloquea === 'sÃ­') || ['FERIADO', 'VACACIONES'].includes(tipo);
        
        if (isBloqueo) {
          let bloquesArr = "TODOS";
          if (strBloques !== "" && strBloques !== "TODOS") {
            bloquesArr = strBloques.split(',').map(b => b.trim());
          }

          // Rango de fechas ej: [14-18] o [14 - 18]
          const match = evento.match(/\[\s*(\d{1,2})\s*-\s*(\d{1,2})\s*\]/);
          if (match) {
            const startDay = parseInt(match[1]);
            const endDay = parseInt(match[2]);
            for (let d = startDay; d <= endDay; d++) {
              let fd = new Date(fechaBase.getTime());
              fd.setDate(d);
              bloqueos.push({ fecha: fd, evento: evento, bloques: bloquesArr });
            }
          } else {
            bloqueos.push({ fecha: fechaBase, evento: evento, bloques: bloquesArr });
          }
        }
      }
    });
    return bloqueos;
  } catch (e) {
    console.error("Error leyendo bloqueos:", e);
    return [];
  }
}

function testBloqueos() {
  try {
    const extSs = SpreadsheetApp.openById(ID_CALENDARIO_EXT);
    const sheet = extSs.getSheets().find(s => s.getSheetId() === GID_CALENDARIO);
    if (!sheet) {
      SpreadsheetApp.getUi().alert("Error: No se encontrÃ³ la pestaÃ±a con el GID " + GID_CALENDARIO + ".");
      return;
    }
    const datos = sheet.getDataRange().getValues();
    if (datos.length < 2) {
      SpreadsheetApp.getUi().alert("La hoja de calendario parece estar vacÃ­a o solo tener el encabezado.");
      return;
    }
    // Tomar la primera fila de datos reales (Ã­ndice 1) para revisar quÃ© estÃ¡ leyendo
    let r = datos[1];
    let debugText = "DEBUG DE LECTURA (Fila 2):\n";
    debugText += "Columna A (Fecha): " + r[0] + " (Tipo: " + (typeof r[0]) + ")\n";
    debugText += "Columna B (Evento): " + r[1] + "\n";
    debugText += "Columna C (Tipo): " + r[2] + "\n";
    debugText += "Columna D (Bloquea): " + r[3] + "\n";
    debugText += "Columna E (Bloques): " + r[4] + "\n\n";

    const bloqueos = getBloqueosExternos();
    debugText += "Total bloqueos procesados con Ã©xito: " + bloqueos.length;
    
    SpreadsheetApp.getUi().alert(debugText);
  } catch(e) {
    SpreadsheetApp.getUi().alert("Error fatal leyendo: " + e.message);
  }
}

function getHorariosExternos() {
  try {
    const extSs = SpreadsheetApp.openById(ID_HORARIOS_EXT);
    let sheet = null;
    for (let s of extSs.getSheets()) {
      if (s.getSheetId() === GID_HORARIOS) { sheet = s; break; }
    }
    if (!sheet) return [];

    const datos = sheet.getDataRange().getValues().slice(1);
    const horarios = [];
    const normalize = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();

    datos.forEach(r => {
      let curso = r[0] ? r[0].toString().trim().toUpperCase() : '';
      let asigBase = r[5] ? r[5].toString().trim().toUpperCase() : '';
      let diaNorm = r[1] ? normalize(r[1].toString().trim()) : '';
      
      if (curso && asigBase && diaNorm) {
        if (asigBase.includes('ELECTIVO')) {
           // Si es electivo, revisar columnas G, H, I, J (Ã­ndices 6, 7, 8, 9)
           for (let i = 6; i <= 9; i++) {
             let celda = r[i] ? r[i].toString().trim() : '';
             if (celda) {
               // Formato esperado: "Juan Perez (Biologia)"
               let match = celda.match(/^(.*?)\((.*?)\)$/);
               if (match) {
                 let prof = match[1].trim().toLowerCase();
                 let asigEspecifica = match[2].trim().toUpperCase() + ` (${asigBase})`;
                 horarios.push({
                   curso: curso,
                   dia: diaNorm,
                   bloque: r[2].toString().trim(),
                   horaInicio: r[3],
                   horaFin: r[4],
                   asignatura: asigEspecifica,
                   profesor: prof
                 });
               }
             }
           }
        } else {
          if (r[6]) {
            horarios.push({
              curso: curso,
              dia: diaNorm,
              bloque: r[2].toString().trim(),
              horaInicio: r[3],
              horaFin: r[4],
              asignatura: asigBase,
              profesor: r[6].toString().trim().toLowerCase()
            });
          }
        }
      }
    });
    return horarios;
  } catch (e) {
    console.error("Error leyendo horarios:", e);
    return [];
  }
}

/**
 * ==========================================
 * 5. COMUNICACIÃ“N CON EL FRONTEND
 * ==========================================
 */

// Devuelve la informaciÃ³n necesaria para los selectores del formulario
function getConfigFrontend() {
  const usuario = verificarUsuario();
  if (!usuario.autorizado) throw new Error("No autorizado");

  const horarios = getHorariosExternos();
  const isAdmin = (usuario.rol.toLowerCase() === 'admin' || usuario.rol.toLowerCase() === 'administrador');
  
  const cursosSet = new Set();
  const asignaturasDict = {};
  
  const allCursos = new Set();
  const allAsignaturas = new Set();
  const allProfesores = new Set();
  
  const userEmail = usuario.nombre.toLowerCase();
  const nombreCorto = usuario.nombre.toLowerCase();

  horarios.forEach(h => {
    // Listas globales para filtros del administrador/vista general
    allCursos.add(h.curso);
    allAsignaturas.add(h.asignatura);
    allProfesores.add(h.profesor);

    // Listas especÃ­ficas para el profesor que agenda
    if (isAdmin || h.profesor === userEmail || h.profesor === nombreCorto) {
      cursosSet.add(h.curso);
      if (!asignaturasDict[h.curso]) asignaturasDict[h.curso] = {};
      if (!asignaturasDict[h.curso][h.dia]) asignaturasDict[h.curso][h.dia] = new Set();
      asignaturasDict[h.curso][h.dia].add(h.asignatura);
    }
  });

  const resultDict = {};
  for (let c in asignaturasDict) {
    resultDict[c] = {};
    for (let d in asignaturasDict[c]) {
      resultDict[c][d] = Array.from(asignaturasDict[c][d]).sort();
    }
  }

  return {
    usuario: { nombre: usuario.nombre, rol: usuario.rol, email: userEmail },
    sistemaAbierto: obtenerEstadoSistema(),
    profesoresBloqueados: obtenerProfesoresBloqueados(),
    cursos: Array.from(cursosSet).sort(),
    asignaturasDict: resultDict,
    filtrosGlobales: {
      cursos: Array.from(allCursos).sort(),
      asignaturas: Array.from(allAsignaturas).sort(),
      profesores: Array.from(allProfesores).sort()
    }
  };
}

// Genera un color Ãºnico y consistente basado en el nombre
function getColorForAsignatura(nombre) {
  const palette = [
    '#e53935', '#d81b60', '#8e24aa', '#5e35b1', '#3949ab', 
    '#1e88e5', '#00acc1', '#00897b', '#43a047', '#7cb342', 
    '#f57c00', '#f4511e', '#6d4c41', '#546e7a', '#c2185b',
    '#1976d2', '#388e3c', '#e64a19', '#455a64', '#0288d1'
  ];
  let hash = 0;
  for (let i = 0; i < nombre.length; i++) {
    hash = nombre.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % palette.length;
  return palette[index];
}

// Devuelve los eventos al FullCalendar
function getEventosCalendario() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const tz = ss.getSpreadsheetTimeZone();
  const eventos = [];

  // 1. Cargar Bloqueos
  const bloqueos = getBloqueosExternos();
  bloqueos.forEach(b => {
    let esTotal = b.bloques === "TODOS";
    let titulo = esTotal ? '[BLOQUEADO] ' + b.evento : '[ATENCION] ' + b.evento + ' (Bloques ' + b.bloques.join(',') + ')';
    let color = esTotal ? '#dc3545' : '#fd7e14';
    
    eventos.push({
      id: 'bloqueo_' + b.fecha.getTime(),
      title: titulo,
      start: Utilities.formatDate(b.fecha, tz, "yyyy-MM-dd"),
      allDay: true,
      backgroundColor: color,
      borderColor: color,
      extendedProps: { esBloqueo: true }
    });
  });

  // 2. Cargar Evaluaciones
  const sheetEval = ss.getSheetByName('Evaluaciones');
  if (sheetEval && sheetEval.getLastRow() > 1) {
    const datos = sheetEval.getDataRange().getValues().slice(1);
    datos.forEach(r => {
      if (r[2]) {
        const fechaEval = new Date(r[2]);
        if (!isNaN(fechaEval)) {
          const curso = r[3];
          const asig = r[4];
          const tipo = r[5];
          const profNombre = r[7] || r[6]; // Nombre o Email
          const detalles = r[8];
          
          let colorHex = getColorForAsignatura(asig.toUpperCase());
          let titulo = curso + ' - ' + asig;
          let isBloqueoGhost = (tipo === 'â›” BLOQUEO');
          
          if (isBloqueoGhost) {
            colorHex = '#dc3545';
            titulo = 'â›” BLOQUEO: ' + curso;
          }
          
          eventos.push({
            id: r[0].toString(),
            title: titulo,
            start: Utilities.formatDate(fechaEval, tz, "yyyy-MM-dd"),
            allDay: true,
            backgroundColor: colorHex,
            borderColor: colorHex,
            extendedProps: {
              curso: curso,
              asignatura: asig,
              tipo: tipo,
              profesor: profNombre,
              profesorEmail: r[6], // AÃ±adido para permisos de EdiciÃ³n/EliminaciÃ³n
              detalles: detalles,
              esBloqueo: isBloqueoGhost
            }
          });
        }
      }
    });
  }

  return eventos;
}

/**
 * ==========================================
 * 6. LOGICA DE AGENDAMIENTO
 * ==========================================
 */
function agendarEvaluacion(datos) {
  const usuario = verificarUsuario();
  if (!usuario.autorizado) throw new Error("No tienes permisos para agendar.");
  
  const isAdmin = (usuario.rol.toLowerCase() === 'admin' || usuario.rol.toLowerCase() === 'administrador');
  
  if (!obtenerEstadoSistema() && !isAdmin) {
    throw new Error("El sistema de agendamiento se encuentra temporalmente cerrado.");
  }
  
  if (!isAdmin && obtenerProfesoresBloqueados().includes(usuario.nombre.toLowerCase().trim())) {
    throw new Error("Tus permisos para agendar estan bloqueados. Contacta a coordinacion.");
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const tz = ss.getSpreadsheetTimeZone();
  const fechaElegida = datos.fecha; // Formato yyyy-MM-dd
  
  // 1. Validar Fin de Semana
  const dObj = new Date(fechaElegida + "T12:00:00");
  if (dObj.getDay() === 0 || dObj.getDay() === 6) {
    throw new Error("No se pueden agendar evaluaciones los fines de semana.");
  }

  // 1.5 Validar Horario del Profesor
  const diasMapa = { 1: "LUNES", 2: "MARTES", 3: "MIERCOLES", 4: "JUEVES", 5: "VIERNES" };
  const diaSemanaStr = diasMapa[dObj.getDay()];
  
  const horariosTodos = getHorariosExternos();
  const horariosClase = horariosTodos.filter(h => 
    h.curso === datos.curso && 
    h.asignatura === datos.asignatura && 
    h.dia === diaSemanaStr
  );

  if (datos.tipo !== '>" BLOQUEO' && horariosClase.length === 0) {
    throw new Error(`No puedes agendar el ${diaSemanaStr}. No tienes clases de ${datos.asignatura} en ${datos.curso} este dia segun el horario escolar.`);
  }

  // 2. Validar Bloqueos
  const bloqueos = getBloqueosExternos();
  for (let b of bloqueos) {
    const bStr = Utilities.formatDate(b.fecha, tz, "yyyy-MM-dd");
    if (bStr === fechaElegida) {
      if (b.bloques === "TODOS") {
        throw new Error(`El dia completo esta bloqueado por el colegio: ${b.evento}`);
      } else {
        // Verificar si todos los bloques de clase intersectan con el bloqueo
        let todasBloqueadas = true;
        horariosClase.forEach(h => {
          if (!b.bloques.includes(h.bloque.toString())) {
            todasBloqueadas = false;
          }
        });
        if (todasBloqueadas) {
          throw new Error(`Tus bloques de clase para este dia estan bloqueados por: ${b.evento} (Bloques: ${b.bloques.join(', ')})`);
        }
      }
    }
  }

  // NUEVO: Validar Disponibilidad de Recurso
  const bloquesClase = horariosClase.map(h => h.bloque.toString());
  if (datos.recurso && datos.recurso !== "Ninguno" && datos.recurso !== "") {
    const rolNorm = usuario.rol.toLowerCase().trim();
    if (rolNorm === 'profesor') {
      throw new Error("Acceso denegado: Solo Coordinación Pedagógica o Directivos pueden solicitar laboratorios o el auditorio para evaluaciones.");
    }
    if (bloquesClase.length === 0) {
        throw new Error("No se puede reservar recurso si no hay bloques de clase definidos para este dia.");
    }
    const recursoDisponible = validarDisponibilidadRecurso(fechaElegida, bloquesClase, datos.recurso, ss);
    if (!recursoDisponible) {
      throw new Error(`El ${datos.recurso} ya se encuentra ocupado en los bloques seleccionados (${bloquesClase.join(', ')}).`);
    }
  }

  // 3. Obtener Cursos Afectados (Si es electivo, son 4 cursos combinados)
  const esElectivo = datos.asignatura.toUpperCase().includes('(ELECTIVO');
  let cursosAfectados = [datos.curso.trim().toUpperCase()];
  
  if (esElectivo) {
    cursosAfectados = ['IIIA MEDIO A', 'IIIA MEDIO B', 'IVA MEDIO A', 'IVA MEDIO B'];
  }

  // 4. Validar Topes y Reglas para CADA curso afectado
  cursosAfectados.forEach(c => {
    let datosCurso = JSON.parse(JSON.stringify(datos));
    datosCurso.curso = c;
    validarTopesAgendamiento(datosCurso, tz, ss);
  });

  // 5. Guardar (Multi-registro si es electivo)
  const sheetEval = ss.getSheetByName('Evaluaciones');
  const ahora = new Date();
  
  let ultimoIdGuardado = "";
  cursosAfectados.forEach(c => {
    const nuevoId = Utilities.getUuid();
    ultimoIdGuardado = nuevoId;
    // Headers: ['ID', 'Fecha_Agenda', 'Fecha_Evaluacion', 'Curso', 'Asignatura', 'Tipo', 'Profesor_Email', 'Profesor_Nombre', 'Detalles', 'Creado_En']
    sheetEval.appendRow([
      nuevoId,
      ahora,
      fechaElegida,
      c,
      datos.asignatura,
      datos.tipo,
      usuario.email,
      usuario.nombre,
      datos.detalles || "",
      ahora
    ]);
  });

  // NUEVO: Guardar la reserva del recurso si se solicito
  if (datos.recurso && datos.recurso !== "Ninguno" && datos.recurso !== "") {
     const sheetRecursos = ss.getSheetByName('Reservas_Recursos');
     if (sheetRecursos) {
       const idReserva = Utilities.getUuid();
       sheetRecursos.appendRow([
         idReserva,
         ultimoIdGuardado, // ID Evaluacion (guardamos el ultimo si son multiples)
         fechaElegida,
         bloquesClase.join(','),
         datos.recurso,
         datos.curso,
         usuario.email,
         'Aprobada',
         ahora
       ]);
     }
  }

  return esElectivo ? "Evaluaciones agendadas exitosamente en los 4 cursos (IIIA y IVA Medios)." : "Evaluacion agendada exitosamente.";
}

function validarDisponibilidadRecurso(fechaStr, bloquesSolicitados, recurso, ss) {
  const sheet = ss.getSheetByName('Reservas_Recursos');
  if (!sheet) return true; // Si no existe la pestana, asumimos disponible
  
  const data = sheet.getDataRange().getValues();
  // Headers: ['ID_Reserva', 'ID_Evaluacion', 'Fecha', 'Bloques', 'Recurso', 'Curso', 'Profesor_Email', 'Estado', 'Creado_En']
  
  for (let i = 1; i < data.length; i++) {
    let rFecha = data[i][2];
    let rBloquesStr = data[i][3] ? data[i][3].toString() : "";
    let rRecurso = data[i][4];
    let rEstado = data[i][7];
    
    // Transformar rFecha a string yyyy-MM-dd si es Date
    if (rFecha instanceof Date) {
      rFecha = Utilities.formatDate(rFecha, ss.getSpreadsheetTimeZone(), "yyyy-MM-dd");
    }
    
    if (rFecha === fechaStr && rRecurso === recurso && rEstado !== 'Cancelada') {
      let bloquesOcupados = rBloquesStr.split(',');
      for (let b of bloquesSolicitados) {
        if (bloquesOcupados.includes(b)) {
          return false; // Choque de bloque encontrado
        }
      }
    }
  }
  return true;
}

function validarTopesAgendamiento(datos, tz, ss) {
  const curso = datos.curso.trim().toUpperCase();
  const fechaStr = datos.fecha;
  const tipoSolicitado = datos.tipo;
  const asigSolicitada = datos.asignatura.trim().toUpperCase();

  const sheetTopes = ss.getSheetByName('Config_Topes');
  let maxDiaEscritas = 2, maxDiaOtras = 2, maxSemEscritas = 2, maxSemTotal = 4;
  
  if (sheetTopes && sheetTopes.getLastRow() > 1) {
    const config = sheetTopes.getDataRange().getValues().slice(1);
    const configCurso = config.find(r => r[0].toString().trim().toUpperCase() === curso);
    if (configCurso) {
      maxDiaEscritas = parseInt(configCurso[1]) || 2;
      maxDiaOtras = parseInt(configCurso[2]) || 2;
      maxSemEscritas = parseInt(configCurso[3]) || 2;
      maxSemTotal = parseInt(configCurso[4]) || 4;
    }
  }

  const sheetEval = ss.getSheetByName('Evaluaciones');
  if (!sheetEval || sheetEval.getLastRow() === 1) return; // No hay evaluaciones aÃºn

  const evaluaciones = sheetEval.getDataRange().getValues().slice(1);
  
  // NUEVO: Verificar si hay un "â›” BLOQUEO" fantasma este dÃ­a para este curso.
  for (let e of evaluaciones) {
    if (!e[2]) continue;
    const fE = Utilities.formatDate(new Date(e[2]), tz, "yyyy-MM-dd");
    if (fE === fechaStr && e[3].toString().trim().toUpperCase() === curso) {
      if (e[5] === 'â›” BLOQUEO' && tipoSolicitado !== 'â›” BLOQUEO') {
        throw new Error(`Este dÃ­a ha sido bloqueado manualmente por AdministraciÃ³n para el curso ${curso}.`);
      }
    }
  }
  
  if (tipoSolicitado === 'â›” BLOQUEO') return; // El bloqueo no necesita validar topes

  const sumarParaTope = (t) => {
    const txt = (t || '').toUpperCase();
    return txt.includes('PRUEBA') || txt.includes('EXPOSICIÃ“N ORAL') || txt.includes('EXPOSICION ORAL') || txt === 'ESCRITA';
  };

  let evalDiaSumantes = [];
  let evalSemSumantes = [];
  let evalSemTotalSumantes = [];

  // FunciÃ³n para obtener el nÃºmero de semana ISO
  const getWeek = (d) => {
    const date = new Date(d.getTime()); date.setHours(0,0,0,0);
    date.setDate(date.getDate() + 4 - (date.getDay() || 7));
    return Math.ceil((((date - new Date(date.getFullYear(),0,1)) / 8.64e7) + 1)/7);
  };

  const fechaNuevaObj = new Date(fechaStr + "T12:00:00");
  const numSemanaNueva = getWeek(fechaNuevaObj);
  const anoNuevo = fechaNuevaObj.getFullYear();

  evaluaciones.forEach(r => {
    if (r[3] && r[3].toString().trim().toUpperCase() === curso) {
      const fechaEval = new Date(r[2]);
      if (isNaN(fechaEval)) return;

      const fEvalStr = Utilities.formatDate(fechaEval, tz, "yyyy-MM-dd");
      const tipo = r[5] ? r[5].toString().trim() : '';
      const asigGuardada = r[4] ? r[4].toString().trim().toUpperCase() : '';

      // Regla inquebrantable: No se puede evaluar la misma asignatura dos veces el mismo dÃ­a, sin importar el tipo
      if (fEvalStr === fechaStr && asigGuardada === asigSolicitada) {
        throw new Error(`Ya existe una evaluaciÃ³n agendada para ${asigSolicitada} en el curso ${curso} en este dÃ­a.`);
      }

      // Si la evaluaciÃ³n guardada suma para los topes
      if (sumarParaTope(tipo)) {
        if (fEvalStr === fechaStr) {
          evalDiaSumantes.push(asigGuardada);
        }
        if (getWeek(fechaEval) === numSemanaNueva && fechaEval.getFullYear() === anoNuevo) {
          evalSemSumantes.push(asigGuardada);
          evalSemTotalSumantes.push(asigGuardada);
        }
      }
    }
  });

  // FunciÃ³n para contar cargas reales agrupando electivos
  const calcularCarga = (listaAsignaturas) => {
    let grupos = new Set();
    let cargaNormal = 0;
    listaAsignaturas.forEach(a => {
      let match = a.match(/\((ELECTIVO\s*\d+)\)/i);
      if (match) {
        grupos.add(match[1].toUpperCase());
      } else {
        cargaNormal++;
      }
    });
    return cargaNormal + grupos.size;
  };

  // Validaciones solo si la nueva evaluaciÃ³n "suma"
  if (sumarParaTope(tipoSolicitado)) {
    let nuevaDia = [...evalDiaSumantes, asigSolicitada];
    if (calcularCarga(nuevaDia) > maxDiaEscritas) {
      throw new Error(`LÃ­mite diario superado (${maxDiaEscritas} pruebas/exposiciones) para el curso ${curso}.`);
    }
    
    let nuevaSem = [...evalSemSumantes, asigSolicitada];
    if (calcularCarga(nuevaSem) > maxSemEscritas) {
      throw new Error(`LÃ­mite semanal superado (${maxSemEscritas} pruebas/exposiciones) para el curso ${curso}.`);
    }
    
    let nuevaSemTotal = [...evalSemTotalSumantes, asigSolicitada];
    if (calcularCarga(nuevaSemTotal) > maxSemTotal) {
      throw new Error(`LÃ­mite semanal TOTAL superado (${maxSemTotal} evaluaciones sumantes) para el curso ${curso}.`);
    }
  }
}

// ==========================================
// AUDITORÃA ART. 51
// ==========================================
function getAuditoriaArt51(semestre) {
  const horarios = getHorariosExternos();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetEval = ss.getSheetByName('Evaluaciones');
  
  // 1. Calcular Horas Semanales
  const conteoHoras = {};
  horarios.forEach(h => {
    const key = `${h.curso}:::${h.asignatura}`;
    if (!conteoHoras[key]) {
      conteoHoras[key] = {
        curso: h.curso,
        asignatura: h.asignatura,
        profesor: h.profesor,
        horas: 0
      };
    }
    conteoHoras[key].horas++;
  });

  // 2. Contar Evaluaciones por Semestre
  const evaluacionesAgendadas = {};
  if (sheetEval && sheetEval.getLastRow() > 1) {
    const datos = sheetEval.getDataRange().getValues().slice(1);
    datos.forEach(r => {
      if (!r[2]) return;
      const fechaEval = new Date(r[2]);
      if (isNaN(fechaEval)) return;
      
      const mes = fechaEval.getMonth(); // 0-indexed (Marzo=2, Junio=5, Julio=6, Dic=11)
      const esSem1 = mes >= 2 && mes <= 5;
      const esSem2 = mes >= 6 && mes <= 11;
      
      if ((semestre === 1 && esSem1) || (semestre === 2 && esSem2)) {
        const key = `${r[3].toString().trim().toUpperCase()}:::${r[4].toString().trim().toUpperCase()}`;
        if (!evaluacionesAgendadas[key]) evaluacionesAgendadas[key] = 0;
        evaluacionesAgendadas[key]++;
      }
    });
  }

  // 3. Generar Reporte cruzado
  const reporte = [];
  for (const key in conteoHoras) {
    const data = conteoHoras[key];
    const horas = data.horas;
    let minimo = 2;
    if (horas === 1) minimo = 2;
    else if (horas === 2 || horas === 3) minimo = 3;
    else if (horas === 4) minimo = 4;
    else if (horas >= 5) minimo = 5;

    const agendadas = evaluacionesAgendadas[key] || 0;
    const diferencia = agendadas - minimo;
    let estado = '';
    
    if (diferencia === 0) estado = 'CUMPLE';
    else if (diferencia > 0) estado = 'CUMPLE (EXCEDE)';
    else estado = `FALTAN ${Math.abs(diferencia)}`;

    reporte.push({
      curso: data.curso,
      asignatura: data.asignatura,
      profesor: data.profesor,
      horas: horas,
      minimo: minimo,
      agendadas: agendadas,
      estado: estado
    });
  }

  // Ordenar por curso y luego asignatura
  reporte.sort((a, b) => {
    if (a.curso < b.curso) return -1;
    if (a.curso > b.curso) return 1;
    if (a.asignatura < b.asignatura) return -1;
    if (a.asignatura > b.asignatura) return 1;
    return 0;
  });

  return reporte;
}

// ==========================================
// 8. EDICIÃ“N, ELIMINACIÃ“N Y CARGA MASIVA
// ==========================================

function eliminarEvaluacionBackend(datos) {
  const usuario = verificarUsuario();
  const esAdmin = (usuario.rol.toLowerCase() === 'admin' || usuario.rol.toLowerCase() === 'administrador');
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Evaluaciones');
  const data = sheet.getDataRange().getValues();
  const tz = ss.getSpreadsheetTimeZone();
  
  for (let i = data.length - 1; i >= 1; i--) {
    const fila = data[i];
    if (!fila[2]) continue;
    const fechaStr = Utilities.formatDate(new Date(fila[2]), tz, "yyyy-MM-dd");
    
    if (fechaStr === datos.fechaStr && 
        fila[3].toString().trim().toUpperCase() === datos.curso.trim().toUpperCase() && 
        fila[4].toString().trim().toUpperCase() === datos.asignatura.trim().toUpperCase() && 
        (fila[6].toString().trim().toLowerCase() === datos.profesorEmail.trim().toLowerCase() ||
         fila[7].toString().trim().toLowerCase() === datos.profesorEmail.trim().toLowerCase())) {
      
      const emailCoincide = (fila[6].toString().trim().toLowerCase() === usuario.email);
      const nombreCoincide = (fila[7] && fila[7].toString().trim().toLowerCase() === usuario.nombre.toLowerCase());
      
      if (!esAdmin && !emailCoincide && !nombreCoincide) {
        throw new Error("Solo el autor original o un Administrador puede eliminar esta evaluaciÃ³n.");
      }
      
      sheet.deleteRow(i + 1); 
      return "La evaluaciÃ³n ha sido eliminada correctamente.";
    }
  }
  throw new Error("No se encontrÃ³ la evaluaciÃ³n o ya fue eliminada.");
}

function editarEvaluacionBackend(datosAntiguos, datosNuevos) {
  const usuario = verificarUsuario();
  const esAdmin = (usuario.rol.toLowerCase() === 'admin' || usuario.rol.toLowerCase() === 'administrador');
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Evaluaciones');
  const data = sheet.getDataRange().getValues();
  const tz = ss.getSpreadsheetTimeZone();
  
  let filaIndex = -1;
  let filaData = null;

  for (let i = data.length - 1; i >= 1; i--) {
    const fila = data[i];
    if (!fila[2]) continue;
    const fechaStr = Utilities.formatDate(new Date(fila[2]), tz, "yyyy-MM-dd");
    
    if (fechaStr === datosAntiguos.fechaStr && 
        fila[3].toString().trim().toUpperCase() === datosAntiguos.curso.trim().toUpperCase() && 
        fila[4].toString().trim().toUpperCase() === datosAntiguos.asignatura.trim().toUpperCase() && 
        (fila[6].toString().trim().toLowerCase() === datosAntiguos.profesorEmail.trim().toLowerCase() ||
         fila[7].toString().trim().toLowerCase() === datosAntiguos.profesorEmail.trim().toLowerCase())) {
      
      const emailCoincide = (fila[6].toString().trim().toLowerCase() === usuario.email);
      const nombreCoincide = (fila[7] && fila[7].toString().trim().toLowerCase() === usuario.nombre.toLowerCase());
      
      if (!esAdmin && !emailCoincide && !nombreCoincide) {
        throw new Error("No tienes permiso para editar esta evaluaciÃ³n.");
      }
      
      filaIndex = i + 1;
      filaData = fila;
      break;
    }
  }

  if (filaIndex === -1) throw new Error("No se encontrÃ³ la evaluaciÃ³n original para editar.");

  // Eliminar temporalmente para que validarTopes no cuente la misma prueba antigua
  sheet.deleteRow(filaIndex);
  
  try {
    agendarEvaluacion(datosNuevos);
    return "EvaluaciÃ³n editada exitosamente.";
  } catch (e) {
    // Si falla, insertar la fila original de vuelta
    sheet.appendRow(filaData);
    throw e;
  }
}

function ejecutarCargaAutomaticaBackend() {
  const usuario = verificarUsuario();
  if (usuario.rol.toLowerCase() !== 'admin' && usuario.rol.toLowerCase() !== 'administrador') {
    throw new Error("Solo administradores pueden ejecutar la carga automÃ¡tica.");
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheetCarga = ss.getSheetByName('Carga_Automatica');
  if (!sheetCarga) {
    // Si no existe, crearla y avisar
    sheetCarga = ss.insertSheet('Carga_Automatica');
    sheetCarga.getRange(1,1,1,5).setValues([["Asignatura", "Fecha_Inicio", "Fecha_Fin", "Tipo", "Activo"]]).setFontWeight("bold");
    throw new Error("Se ha creado la pestaÃ±a 'Carga_Automatica' porque no existÃ­a. LlÃ©nala y vuelve a presionar el botÃ³n.");
  }
  
  const sheetEval = ss.getSheetByName('Evaluaciones');
  const sheetCursos = ss.getSheetByName('Config_Topes'); 
  const tz = ss.getSpreadsheetTimeZone();

  const horarios = getHorariosExternos();
  const bloqueos = getBloqueosExternos();
  const fechasBloqueadas = new Set(bloqueos.map(b => Utilities.formatDate(new Date(b.fecha), tz, "yyyy-MM-dd")));

  const topesCurso = {};
  sheetCursos.getDataRange().getValues().slice(1).forEach(r => {
    topesCurso[r[0].toString().trim().toUpperCase()] = { maxD: r[1], maxS: r[2], maxTot: r[3] };
  });

  const mapaHorarios = {};
  horarios.forEach(h => {
    if (!mapaHorarios[h.curso]) mapaHorarios[h.curso] = {};
    if (!mapaHorarios[h.curso][h.asignatura]) mapaHorarios[h.curso][h.asignatura] = [];
    
    let hI = h.horaInicio;
    let hF = h.horaFin;
    let minDiferencia = 0;
    if (hI instanceof Date && hF instanceof Date) {
      minDiferencia = (hF - hI) / 60000;
    } else {
      try {
        let pI = hI.toString().split(":");
        let pF = hF.toString().split(":");
        minDiferencia = (parseInt(pF[0])*60 + parseInt(pF[1])) - (parseInt(pI[0])*60 + parseInt(pI[1]));
      } catch(e) {}
    }
    
    if (minDiferencia >= 80) { // Bloques dobles (90 min aprox)
      mapaHorarios[h.curso][h.asignatura].push(h);
    }
  });

  const reglas = sheetCarga.getDataRange().getValues().slice(1).filter(r => r[4] && r[4].toString().trim().toUpperCase() === 'SI');
  if (reglas.length === 0) {
    throw new Error("No hay reglas activas en la pestaÃ±a Carga_Automatica.");
  }

  let nuevasEvaluaciones = [];
  let logErrores = [];
  const mapaDiasNumeros = { 1: "LUNES", 2: "MARTES", 3: "MIERCOLES", 4: "JUEVES", 5: "VIERNES" };

  const sumarParaTope = (t) => {
    const txt = (t || '').toUpperCase();
    return txt.includes('PRUEBA') || txt.includes('EXPOSICIÃ“N ORAL') || txt.includes('EXPOSICION ORAL') || txt === 'ESCRITA';
  };
  const getWeek = (d) => {
    const date = new Date(d.getTime()); date.setHours(0,0,0,0); date.setDate(date.getDate() + 4 - (date.getDay() || 7));
    return Math.ceil((((date - new Date(date.getFullYear(),0,1)) / 8.64e7) + 1)/7);
  };

  const evalHist = sheetEval.getDataRange().getValues().slice(1);
  const checkTopesEnMemoria = (curso, fechaStr, asig, tipo) => {
    const maxD = topesCurso[curso] ? topesCurso[curso].maxD : 2;
    const maxS = topesCurso[curso] ? topesCurso[curso].maxS : 3;
    const maxTot = topesCurso[curso] ? topesCurso[curso].maxTot : 5;
    
    const objFecha = new Date(fechaStr + "T12:00:00");
    const semNueva = getWeek(objFecha);
    const anoNuevo = objFecha.getFullYear();
    
    let lDia = [], lSem = [], lTot = [];

    evalHist.concat(nuevasEvaluaciones).forEach(r => {
      if (r[3] && r[3].toString().trim().toUpperCase() === curso) {
        const fe = new Date(r[2]); if (isNaN(fe)) return;
        const feStr = Utilities.formatDate(fe, tz, "yyyy-MM-dd");
        const fTipo = r[5] ? r[5].toString() : '';
        const fAsig = r[4] ? r[4].toString().trim().toUpperCase() : '';
        
        if (feStr === fechaStr && fAsig === asig) return false;

        if (sumarParaTope(fTipo)) {
          if (feStr === fechaStr) lDia.push(fAsig);
          if (getWeek(fe) === semNueva && fe.getFullYear() === anoNuevo) {
            lSem.push(fAsig);
            lTot.push(fAsig);
          }
        }
      }
    });

    const countCarga = (list) => {
      let g = new Set(); let n = 0;
      list.forEach(a => { let m = a.match(/\((ELECTIVO\s*\d+)\)/i); if(m) g.add(m[1].toUpperCase()); else n++; });
      return n + g.size;
    };

    if (sumarParaTope(tipo)) {
      lDia.push(asig); lSem.push(asig); lTot.push(asig);
      if (countCarga(lDia) > maxD) return false;
      if (countCarga(lSem) > maxS) return false;
      if (countCarga(lTot) > maxTot) return false;
    }
    return true;
  };

  reglas.forEach(regla => {
    const asigRegla = regla[0].toString().trim().toUpperCase();
    const fInicio = new Date(regla[1]);
    const fFin = new Date(regla[2]);
    const tipo = regla[3].toString().trim();
    if (isNaN(fInicio) || isNaN(fFin)) return;
    fInicio.setHours(0,0,0,0);
    fFin.setHours(23,59,59,999);

    for (const curso in mapaHorarios) {
      if (mapaHorarios[curso][asigRegla]) {
        const bloquesClase = mapaHorarios[curso][asigRegla];
        if (bloquesClase.length === 0) {
          logErrores.push("Sin bloques dobles para " + asigRegla + " en " + curso + ".");
          continue;
        }

        let agendado = false;
        let iterador = new Date(fInicio.getTime());
        
        while (!agendado && iterador <= fFin) {
          const ds = iterador.getDay();
          if (ds !== 0 && ds !== 6) { 
            const fechaStrIter = Utilities.formatDate(iterador, tz, "yyyy-MM-dd");
            const diaTxt = mapaDiasNumeros[ds];
            
            if (!fechasBloqueadas.has(fechaStrIter)) {
              let chocaMismaPrueba = false;
              evalHist.concat(nuevasEvaluaciones).forEach(r => {
                if (r[3] === curso && r[4] === asigRegla) {
                  const feStr = Utilities.formatDate(new Date(r[2]), tz, "yyyy-MM-dd");
                  if (feStr === fechaStrIter) chocaMismaPrueba = true;
                }
              });

              if (!chocaMismaPrueba) {
                const bloquesHoy = bloquesClase.filter(b => b.dia === diaTxt);
                if (bloquesHoy.length > 0) {
                  if (checkTopesEnMemoria(curso, fechaStrIter, asigRegla, tipo)) {
                    let profe = bloquesHoy[0].profesor;
                    let profEmail = profe; 
                    let msj = "ðŸ¤– Sistema AutomÃ¡tico: B" + bloquesHoy[0].bloque;
                    
                    // ['ID', 'Fecha_Agenda', 'Fecha_Evaluacion', 'Curso', 'Asignatura', 'Tipo', 'Profesor_Email', 'Profesor_Nombre', 'Detalles', 'Creado_En']
                    nuevasEvaluaciones.push([Utilities.getUuid(), new Date(), fechaStrIter, curso, asigRegla, tipo, profEmail, profe, msj, new Date()]);
                    agendado = true;
                  }
                }
              }
            }
          }
          iterador.setDate(iterador.getDate() + 1);
        }
        if (!agendado) logErrores.push("Sin cupo (Topes) para " + asigRegla + " en " + curso + ".");
      }
    }
  });

  if (nuevasEvaluaciones.length > 0) {
    sheetEval.getRange(sheetEval.getLastRow() + 1, 1, nuevasEvaluaciones.length, nuevasEvaluaciones[0].length).setValues(nuevasEvaluaciones);
    return "Carga masiva finalizada. Evaluaciones agendadas: " + nuevasEvaluaciones.length + ".\n\nAlertas:\n" + logErrores.slice(0,10).join("\n");
  } else {
    return "No se agendÃ³ nada nuevo.\n\nAlertas:\n" + logErrores.slice(0,10).join("\n");
  }
}


// ==========================================
// 7. CORREOS AUTOMÃTICOS (TRIGGERS)
// ==========================================

/**
 * FunciÃ³n que se debe ejecutar TODOS LOS DÃAS a primera hora (Ej: 8:00 AM)
 * Revisa si faltan 15 dÃ­as exactos para una evaluaciÃ³n y avisa al profesor.
 */
function enviarRecordatoriosProfesores() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetEval = ss.getSheetByName('Evaluaciones');
  if (!sheetEval || sheetEval.getLastRow() === 1) return;

  const datos = sheetEval.getDataRange().getValues().slice(1);
  const hoy = new Date();
  hoy.setHours(0,0,0,0);

  datos.forEach(r => {
    if (!r[2]) return;
    const fechaEval = new Date(r[2]);
    fechaEval.setHours(0,0,0,0);
    
    // Diferencia en dÃ­as
    const diffTime = Math.abs(fechaEval - hoy);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Si faltan exactamente 15 dÃ­as
    if (diffDays === 15 && fechaEval > hoy) {
      const curso = r[3];
      const asig = r[4];
      const tipo = r[5] || "EvaluaciÃ³n";
      const profEmail = r[6];
      const profNombre = r[7] || "Profesor";
      const fechaFormat = Utilities.formatDate(fechaEval, Session.getScriptTimeZone(), "dd/MM/yyyy");

      if (profEmail && profEmail.includes('@')) {
        const asunto = `Recordatorio: Entrega de EvaluaciÃ³n de ${asig} - ${curso}`;
        const mensaje = `Estimado/a ${profNombre},

Le recordamos que el dÃ­a ${fechaFormat} estÃ¡ agendada su evaluaciÃ³n (${tipo}) de ${asig} para el curso ${curso}.

Faltan 15 dÃ­as para la evaluaciÃ³n. SegÃºn el protocolo, tiene 7 dÃ­as a partir de hoy para enviar la evaluaciÃ³n y la rÃºbrica a CoordinaciÃ³n AcadÃ©mica.

Saludos cordiales,
Sistema de Agenda Escolar`;

        try {
          MailApp.sendEmail({
            to: profEmail,
            subject: asunto,
            body: mensaje
          });
        } catch(e) {
          console.error("Error enviando email a " + profEmail + ": " + e);
        }
      }
    }
  });
}

/**
 * FunciÃ³n que se debe ejecutar TODOS LOS LUNES a primera hora (Ej: 8:00 AM)
 * EnvÃ­a resÃºmenes enrutados a los coordinadores segÃºn Config_Topes.
 */
function enviarResumenCoordinador() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Leer Coordinadores
  const sheetConfig = ss.getSheetByName('Config_Topes');
  if (!sheetConfig) return;
  
  const configDatos = sheetConfig.getDataRange().getValues();
  const coordinadores = [];
  
  // Asumimos que los coordinadores estÃ¡n desde la fila 2, columnas G(6), H(7), I(8)
  for (let i = 1; i < configDatos.length; i++) {
    const emailCoord = configDatos[i][6] ? configDatos[i][6].toString().trim() : '';
    const asigStr = configDatos[i][7] ? configDatos[i][7].toString().trim().toUpperCase() : '';
    const cursoStr = configDatos[i][8] ? configDatos[i][8].toString().trim().toUpperCase() : '';
    
    if (emailCoord && emailCoord.includes('@')) {
      coordinadores.push({
        email: emailCoord,
        asignaturas: asigStr.split(',').map(s => s.trim()),
        cursos: cursoStr.split(',').map(s => s.trim()),
        isAllAsig: asigStr === 'TODAS' || asigStr === '',
        isAllCursos: cursoStr === 'TODOS' || cursoStr === ''
      });
    }
  }

  if (coordinadores.length === 0) return; // No hay coordinadores configurados

  // 2. Leer Evaluaciones
  const sheetEval = ss.getSheetByName('Evaluaciones');
  if (!sheetEval || sheetEval.getLastRow() === 1) return;
  const evaluaciones = sheetEval.getDataRange().getValues().slice(1);

  // Determinar la semana actual (Esta semana) y la prÃ³xima (Entrantes)
  const tz = Session.getScriptTimeZone();
  const hoy = new Date();
  const diaSemana = hoy.getDay() === 0 ? 7 : hoy.getDay(); // Lunes=1
  
  const inicioEstaSemana = new Date(hoy);
  inicioEstaSemana.setDate(hoy.getDate() - diaSemana + 1);
  inicioEstaSemana.setHours(0,0,0,0);
  
  const finEstaSemana = new Date(inicioEstaSemana);
  finEstaSemana.setDate(inicioEstaSemana.getDate() + 6);
  finEstaSemana.setHours(23,59,59,999);

  const inicioProximaSemana = new Date(finEstaSemana);
  inicioProximaSemana.setDate(finEstaSemana.getDate() + 1);
  inicioProximaSemana.setHours(0,0,0,0);
  
  const finProximaSemana = new Date(inicioProximaSemana);
  finProximaSemana.setDate(inicioProximaSemana.getDate() + 6);
  finProximaSemana.setHours(23,59,59,999);

  const formatF = (d) => Utilities.formatDate(d, tz, "dd/MM");

  // 3. Enrutar y Enviar
  coordinadores.forEach(coord => {
    let salenEstaSemana = []; // Evaluaciones que se aplican esta semana
    let entranEstaSemana = []; // Evaluaciones de la prÃ³xima semana (deben entregarlas ahora a coordinaciÃ³n)

    evaluaciones.forEach(r => {
      if (!r[2]) return;
      const fechaEval = new Date(r[2]);
      const curso = r[3].toString().toUpperCase();
      const asig = r[4].toString().toUpperCase();
      const prof = r[7] || r[6];
      const tipo = r[5];
      
      // Validar si pertenece a este coordinador
      const matchAsig = coord.isAllAsig || coord.asignaturas.some(a => asig.includes(a));
      const matchCurso = coord.isAllCursos || coord.cursos.some(c => curso.includes(c));
      
      if (matchAsig && matchCurso) {
        const item = `- ${Utilities.formatDate(fechaEval, tz, "EEE dd/MM")}: ${curso} | ${asig} (${tipo}) - Prof: ${prof}`;
        
        if (fechaEval >= inicioEstaSemana && fechaEval <= finEstaSemana) {
          salenEstaSemana.push(item);
        } else if (fechaEval >= inicioProximaSemana && fechaEval <= finProximaSemana) {
          entranEstaSemana.push(item);
        }
      }
    });

    // Si tiene actividad, enviar correo
    if (salenEstaSemana.length > 0 || entranEstaSemana.length > 0) {
      const asunto = `Resumen Semanal de Evaluaciones - Semana del ${formatF(inicioEstaSemana)}`;
      
      let cuerpo = `Hola,\n\nEste es el resumen automatizado de evaluaciones para tus niveles/asignaturas a cargo.\n\n`;
      
      cuerpo += `=====================================\n`;
      cuerpo += `âž¡ï¸ ENTRAN ESTA SEMANA A REVISIÃ“N\n`;
      cuerpo += `(Pruebas que se aplican la prÃ³xima semana y deben ser entregadas por los profesores)\n`;
      cuerpo += `=====================================\n`;
      if (entranEstaSemana.length > 0) cuerpo += entranEstaSemana.join("\n") + "\n\n";
      else cuerpo += "No hay evaluaciones para revisiÃ³n esta semana.\n\n";

      cuerpo += `=====================================\n`;
      cuerpo += `ðŸ“¤ SALEN ESTA SEMANA (SE APLICAN)\n`;
      cuerpo += `(Evaluaciones que se rinden esta semana en las aulas)\n`;
      cuerpo += `=====================================\n`;
      if (salenEstaSemana.length > 0) cuerpo += salenEstaSemana.join("\n") + "\n\n";
      else cuerpo += "No hay evaluaciones a rendirse esta semana.\n\n";

      cuerpo += `Saludos cordiales,\nSistema de Agenda Escolar`;

      try {
        MailApp.sendEmail({
          to: coord.email,
          subject: asunto,
          body: cuerpo
        });
      } catch(e) {
        console.error("Error enviando email al coordinador " + coord.email + ": " + e);
      }
    }
  });
}

/**
 * ==========================================
 * 8. CONFIGURACION Y BLOQUEOS (NUEVO)
 * ==========================================
 */

function asegurarPestanasConfig() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheetGlobal = ss.getSheetByName('Config_Global');
  if (!sheetGlobal) {
    sheetGlobal = ss.insertSheet('Config_Global');
    sheetGlobal.appendRow(['Clave', 'Valor']);
    sheetGlobal.appendRow(['Estado_Sistema', 'ABIERTO']);
    sheetGlobal.getRange("A1:B1").setFontWeight("bold");
  }
  
  let sheetProfes = ss.getSheetByName('Profesores_Bloqueados');
  if (!sheetProfes) {
    sheetProfes = ss.insertSheet('Profesores_Bloqueados');
    sheetProfes.appendRow(['Email']);
    sheetProfes.getRange("A1").setFontWeight("bold");
  }
}

function obtenerEstadoSistema() {
  asegurarPestanasConfig();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Config_Global');
  const datos = sheet.getDataRange().getValues();
  for (let i = 1; i < datos.length; i++) {
    if (datos[i][0] === 'Estado_Sistema') return datos[i][1] === 'ABIERTO';
  }
  return true;
}

function cambiarEstadoSistema(abierto) {
  asegurarPestanasConfig();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Config_Global');
  const datos = sheet.getDataRange().getValues();
  for (let i = 1; i < datos.length; i++) {
    if (datos[i][0] === 'Estado_Sistema') {
      sheet.getRange(i + 1, 2).setValue(abierto ? 'ABIERTO' : 'CERRADO');
      return abierto;
    }
  }
  return abierto;
}

function obtenerProfesoresBloqueados() {
  asegurarPestanasConfig();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Profesores_Bloqueados');
  if (!sheet) return [];
  const datos = sheet.getDataRange().getValues().slice(1);
  return datos.map(r => r[0].toString().toLowerCase().trim()).filter(e => e);
}

function alternarBloqueoProfesor(email, bloquear) {
  asegurarPestanasConfig();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Profesores_Bloqueados');
  const datos = sheet.getDataRange().getValues();
  const emailNorm = email.toLowerCase().trim();
  
  let rowIndex = -1;
  for (let i = 1; i < datos.length; i++) {
    if (datos[i][0].toString().toLowerCase().trim() === emailNorm) {
      rowIndex = i + 1;
      break;
    }
  }
  
  if (bloquear) {
    if (rowIndex === -1) sheet.appendRow([emailNorm]);
  } else {
    if (rowIndex !== -1) sheet.deleteRow(rowIndex);
  }
  
  return obtenerProfesoresBloqueados();
}
