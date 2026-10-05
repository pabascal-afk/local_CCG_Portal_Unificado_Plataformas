const fs = require('fs');
let content = fs.readFileSync('Backend.gs', 'utf8');

const regex = /function agendarEvaluacion\(datos\) \{[\s\S]*?return esElectivo \? "Evaluaciones agendadas exitosamente en los 4 cursos \(IIIA y IVA Medios\)." : "EvaluaciA3n agendada exitosamente.";\r?\n\}/;

const newFunction = \unction agendarEvaluacion(datos) {
  const usuario = verificarUsuario();
  if (!usuario.autorizado) throw new Error("No tienes permisos para agendar.");
  
  const isAdmin = (usuario.rol.toLowerCase() === 'admin' || usuario.rol.toLowerCase() === 'administrador');
  
  if (!obtenerEstadoSistema() && !isAdmin) {
    throw new Error("El sistema de agendamiento se encuentra temporalmente cerrado.");
  }
  
  if (!isAdmin && obtenerProfesoresBloqueados().includes(usuario.nombre.toLowerCase().trim())) {
    throw new Error("Tus permisos para agendar estAn bloqueados. Contacta a coordinaciA3n.");
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
    throw new Error(\\\No puedes agendar el \\\. No tienes clases de \\\ en \\\ este dA-a segAn el horario escolar.\\\);
  }

  // 2. Validar Bloqueos
  const bloqueos = getBloqueosExternos();
  for (let b of bloqueos) {
    const bStr = Utilities.formatDate(b.fecha, tz, "yyyy-MM-dd");
    if (bStr === fechaElegida) {
      if (b.bloques === "TODOS") {
        throw new Error(\\\El dA-a completo estA bloqueado por el colegio: \\\\\\);
      } else {
        // Verificar si todos los bloques de clase intersectan con el bloqueo
        let todasBloqueadas = true;
        horariosClase.forEach(h => {
          if (!b.bloques.includes(h.bloque.toString())) {
            todasBloqueadas = false;
          }
        });
        if (todasBloqueadas) {
          throw new Error(\\\Tus bloques de clase para este dA-a estAn bloqueados por: \\\ (Bloques: \\\)\\\);
        }
      }
    }
  }

  // NUEVO: Validar Disponibilidad de Recurso
  const bloquesClase = horariosClase.map(h => h.bloque.toString());
  if (datos.recurso && datos.recurso !== "Ninguno" && datos.recurso !== "") {
    if (bloquesClase.length === 0) {
        throw new Error("No se puede reservar recurso si no hay bloques de clase definidos para este dA-a.");
    }
    const recursoDisponible = validarDisponibilidadRecurso(fechaElegida, bloquesClase, datos.recurso, ss);
    if (!recursoDisponible) {
      throw new Error(\\\El \\\ ya se encuentra ocupado en los bloques seleccionados (\\\).\\\);
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

  // NUEVO: Guardar la reserva del recurso si se solicitA3
  if (datos.recurso && datos.recurso !== "Ninguno" && datos.recurso !== "") {
     const sheetRecursos = ss.getSheetByName('Reservas_Recursos');
     if (sheetRecursos) {
       const idReserva = Utilities.getUuid();
       sheetRecursos.appendRow([
         idReserva,
         ultimoIdGuardado, // ID EvaluaciA3n (guardamos el Aoltimo si son mAltiples)
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

  return esElectivo ? "Evaluaciones agendadas exitosamente en los 4 cursos (IIIA y IVA Medios)." : "EvaluaciA3n agendada exitosamente.";
}

function validarDisponibilidadRecurso(fechaStr, bloquesSolicitados, recurso, ss) {
  const sheet = ss.getSheetByName('Reservas_Recursos');
  if (!sheet) return true; // Si no existe la pestaAa, asumimos disponible
  
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
\;

if (content.match(regex)) {
    content = content.replace(regex, newFunction);
    fs.writeFileSync('Backend.gs', content, 'utf8');
    console.log('Reemplazo realizado con exito.');
} else {
    console.log('No se encontro el match.');
}
