const fs = require('fs');
let text = fs.readFileSync('codigo.txt', 'utf8');

// 1. Separate code from html
let htmlIndex = text.indexOf('<!DOCTYPE html>');
let jsPart = text.substring(0, htmlIndex);
let htmlPart = text.substring(htmlIndex);

// Add missing functions to jsPart if they were inside the html string
let execCargaStr = 'function ejecutarCargaAutomaticaBackend(permitirCortas)';
let execCargaIndex = htmlPart.indexOf(execCargaStr);
if (execCargaIndex > -1) {
  let endHtml = htmlPart.substring(execCargaIndex);
  jsPart += "\n\n" + endHtml;
}

let code = jsPart;

// 2. Remove Emojis
code = code.replace(/⏱️/g, '[H]');
code = code.replace(/❗/g, '[!]');

// 3. Inject helpers
const helpers = `
function obtenerHojaHorariosExt() {
  try {
    const extSs = SpreadsheetApp.openById('1dN4LrF0Odt4kQ9ShYfuxX5xIWSGGTnFnqF64rgyOg0E');
    for (let s of extSs.getSheets()) { if (s.getSheetId() == 1057884051) return s; }
  } catch(e) { console.error("Error horarios ext: " + e); }
  return null;
}

function obtenerBloqueosExt() {
  try {
    const extSs = SpreadsheetApp.openById('1R897XLkr841Bkl22TY_dgDL6FENzvUdAmR-Ph5yaZdo');
    let sheet = null;
    for (let s of extSs.getSheets()) { if (s.getSheetId() == 626980973) { sheet = s; break; } }
    if (!sheet) return [];
    
    let tiposQueBloquean = ['FERIADO', 'SUSPENSIÓN', 'VACACIONES', 'BLOQUEO']; 
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheetGen = ss.getSheetByName('Config_General');
    if (sheetGen) {
      const fila = sheetGen.getDataRange().getValues().find(r => r[0] === 'Tipos_Bloqueo_Calendario');
      if (fila && fila[1]) tiposQueBloquean = fila[1].toString().toUpperCase().split(',').map(s=>s.trim());
    }

    const data = sheet.getDataRange().getValues().slice(1);
    const bloqueos = [];
    data.forEach(r => {
      if (r[0] && r[2]) {
        const tipo = r[2].toString().trim().toUpperCase();
        const evento = r[1] ? r[1].toString() : 'Día Bloqueado';
        if (tiposQueBloquean.some(t => tipo.includes(t))) {
          const d = new Date(r[0]);
          if (!isNaN(d)) bloqueos.push({ fecha: d, evento: evento });
        }
      }
    });
    return bloqueos;
  } catch(e) { console.error("Error calend ext: " + e); return []; }
}
`;
code = code.replace('function getDataConfig() {', helpers + '\nfunction getDataConfig() {');

// 4. Update verificarPermisos
code = code.replace(
  /let rolAsignado = null;\s*for \(let i = 0; i < data\.length; i\+\+\) {\s*if \(data\[i\]\[0\]\.toString\(\)\.trim\(\)\.toLowerCase\(\) === email\) {\s*rolAsignado = data\[i\]\[1\] \? data\[i\]\[1\]\.toString\(\)\.trim\(\) : 'Profesor';\s*break;\s*}\s*}\s*if \(!rolAsignado\) throw new Error\(`Acceso denegado: El correo \$\{email\} no tiene permisos de acceso.`\);\s*return \{ email: email, rol: rolAsignado \};\s*}/g,
  `let rolAsignado = null;
  let nombreAsignado = "";

  for (let i = 0; i < data.length; i++) {
    if (data[i][0].toString().trim().toLowerCase() === email) {
      rolAsignado = data[i][1] ? data[i][1].toString().trim() : 'Profesor';
      nombreAsignado = data[i][2] ? data[i][2].toString().trim() : "";
      break;
    }
  }

  if (!rolAsignado) throw new Error(\`Acceso denegado: El correo \${email} no tiene permisos de acceso.\`);
  return { email: email, rol: rolAsignado, nombre: nombreAsignado }; 
}`
);

// 5. Update getEstadoUsuario
code = code.replace(
  /return \{ autorizado: true, email: usuario\.email, rol: usuario\.rol, sistemaAbierto: abierto \};/g,
  `return { autorizado: true, email: usuario.email, rol: usuario.rol, nombre: usuario.nombre, sistemaAbierto: abierto };`
);

// 6. Patch getDataConfig body
code = code.replace(
  /const sheetHorarios = ss\.getSheetByName\('horarios_cursos'\);/g,
  'const sheetHorarios = obtenerHojaHorariosExt();'
);
code = code.replace(
  /const a1 = r\[4\] \? r\[4\]\.toString\(\)\.trim\(\)\.toUpperCase\(\) : "";\s*const a2 = r\[5\] \? r\[5\]\.toString\(\)\.trim\(\)\.toUpperCase\(\) : "";\s*const prof = r\[6\] \? r\[6\]\.toString\(\)\.trim\(\)\.toLowerCase\(\) : "";\s*if \(prof === usuario\.email\.toLowerCase\(\)\) {/g,
  `const a1 = r[5] ? r[5].toString().trim().toUpperCase() : "";
        const prof = r[6] ? r[6].toString().trim().toLowerCase() : "";
        if (prof === usuario.email.toLowerCase() || (usuario.nombre && prof === usuario.nombre.toLowerCase())) {`
);
code = code.replace(
  /if \(a2 && !asignaturasPermitidas\.includes\(a2\)\) asignaturasPermitidas\.push\(a2\);\s*if \(!dictProfesor\[c\]\) dictProfesor\[c\] = \[\];\s*if \(a1 && !dictProfesor\[c\]\.includes\(a1\)\) dictProfesor\[c\]\.push\(a1\);\s*if \(a2 && !dictProfesor\[c\]\.includes\(a2\)\) dictProfesor\[c\]\.push\(a2\);/g,
  `if (!dictProfesor[c]) dictProfesor[c] = [];
          if (a1 && !dictProfesor[c].includes(a1)) dictProfesor[c].push(a1);`
);

// 7. Patch obtenerEventosCalendario
code = code.replace(
  /const sheetGen = ss\.getSheetByName\('Config_General'\);\s*if \(sheetGen\) {\s*sheetGen\.getDataRange\(\)\.getValues\(\)\.slice\(1\)\.forEach\(r => {\s*if \(r\[6\]\) {\s*const d = new Date\(r\[6\]\);\s*if \(!isNaN\(d\)\) {\s*todosLosEventos\.push\({\s*title: '🚫 ' \+ \(r\[7\] \? r\[7\]\.toString\(\) : 'Día Bloqueado'\),\s*start: Utilities\.formatDate\(d, tz, "yyyy-MM-dd"\),\s*allDay: true,\s*backgroundColor: '#dc3545',\s*borderColor: '#dc3545',\s*extendedProps: \{ bloqueado: true \}\s*}\);\s*}\s*}\s*}\);\s*}/g,
  `const bloqueosExt = obtenerBloqueosExt();
  bloqueosExt.forEach(b => {
    todosLosEventos.push({
      title: '🚫 ' + b.evento, start: Utilities.formatDate(b.fecha, tz, "yyyy-MM-dd"),
      allDay: true, backgroundColor: '#dc3545', borderColor: '#dc3545', extendedProps: { bloqueado: true }
    });
  });`
);

// 8. Patch agendarDesdeCalendario
code = code.replace(
  /const emailProfesor = usuario\.email;/g,
  `const emailProfesor = usuario.email;
  const nombreProfesor = usuario.nombre ? usuario.nombre.toLowerCase() : "";`
);

code = code.replace(
  /for \(let r of dataGen\.slice\(1\)\) {\s*if \(r\[6\]\) {\s*const fechaBloqueada = Utilities\.formatDate\(new Date\(r\[6\]\), timezone, "yyyy-MM-dd"\);\s*if \(fechaBloqueada === datos\.fecha\) {\s*throw new Error\("No se puede agendar en esta fecha\. El día se encuentra bloqueado por administración\."\);\s*}\s*}\s*}/g,
  `const bloqueosExt = obtenerBloqueosExt();
    for (let b of bloqueosExt) {
      const fechaBloqueada = Utilities.formatDate(b.fecha, timezone, "yyyy-MM-dd");
      if (fechaBloqueada === datos.fecha) {
        throw new Error("No se puede agendar en esta fecha. Día bloqueado: " + b.evento);
      }
    }`
);

code = code.replace(
  /if \(r\[6\] && r\[6\]\.toString\(\)\.trim\(\)\.toLowerCase\(\) === emailProfesor && r\[0\] && r\[0\]\.toString\(\)\.trim\(\) === datos\.curso\.trim\(\)\) {/g,
  `const prof = r[6] ? r[6].toString().trim().toLowerCase() : "";
        if ((prof === emailProfesor || (nombreProfesor && prof === nombreProfesor)) && r[0] && r[0].toString().trim() === datos.curso.trim()) {`
);

code = code.replace(
  /const a1 = r\[4\] \? r\[4\]\.toString\(\)\.trim\(\)\.toUpperCase\(\) : "";\s*const a2 = r\[5\] \? r\[5\]\.toString\(\)\.trim\(\)\.toUpperCase\(\) : "";\s*const asigReq = datos\.asignatura\.trim\(\)\.toUpperCase\(\);\s*if \(a1 === asigReq \|\| a2 === asigReq\) {/g,
  `const a1 = r[5] ? r[5].toString().trim().toUpperCase() : "";
          const asigReq = datos.asignatura.trim().toUpperCase();
          if (a1 === asigReq) {`
);

// 9. Delete obtenerHorarioCurso and guardarHorarioCurso
code = code.replace(/function obtenerHorarioCurso[\s\S]*?return `Horario de \$\{curso\} guardado exitosamente\.`;\s*}/g, '');

// 10. Patch obtenerEstadoEvaluacionesProfesor
code = code.replace(
  /if \(r\[6\] && r\[6\]\.toString\(\)\.trim\(\)\.toLowerCase\(\) === usuario\.email\.toLowerCase\(\)\) {/g,
  `const prof = r[6] ? r[6].toString().trim().toLowerCase() : "";
    if (prof === usuario.email.toLowerCase() || (usuario.nombre && prof === usuario.nombre.toLowerCase())) {`
);
code = code.replace(
  /const a1 = r\[4\] \? r\[4\]\.toString\(\)\.trim\(\)\.toUpperCase\(\) : "";\s*const a2 = r\[5\] \? r\[5\]\.toString\(\)\.trim\(\)\.toUpperCase\(\) : "";\s*if \(a1\) {\s*const key = curso \+ "\|" \+ a1;\s*cargaProfesor\[key\] = \(cargaProfesor\[key\] \|\| 0\) \+ 1;\s*}\s*if \(a2\) {\s*const key = curso \+ "\|" \+ a2;\s*cargaProfesor\[key\] = \(cargaProfesor\[key\] \|\| 0\) \+ 1;\s*}/g,
  `const a1 = r[5] ? r[5].toString().trim().toUpperCase() : "";
      if (a1) {
        const key = curso + "|" + a1;
        cargaProfesor[key] = (cargaProfesor[key] || 0) + 1;
      }`
);

// 11. Patch ejecutarCargaAutomaticaBackend
code = code.replace(/const sheetCarga = ss\.getSheetByName\('Carga_Automatica'\); const sheetHorarios = ss\.getSheetByName\('horarios_cursos'\);/g, "const sheetCarga = ss.getSheetByName('Carga_Automatica'); const sheetHorarios = obtenerHojaHorariosExt();");

code = code.replace(
  /const fechasBloqueadas = new Set\(\);\s*if \(sheetGen\) {\s*sheetGen\.getDataRange\(\)\.getValues\(\)\.slice\(1\)\.forEach\(r => {\s*if \(r\[6\]\) {\s*const d = new Date\(r\[6\]\);\s*if \(!isNaN\(d\)\) fechasBloqueadas\.add\(Utilities\.formatDate\(d, tz, "yyyy-MM-dd"\)\);\s*}\s*}\);\s*}/g,
  `const bloqueosExt = obtenerBloqueosExt();
  const fechasBloqueadas = new Set(bloqueosExt.map(b => Utilities.formatDate(b.fecha, tz, "yyyy-MM-dd")));`
);

code = code.replace(
  /const inicio = fila\[2\]; const fin = fila\[3\];\s*const asig1 = fila\[4\] \? fila\[4\]\.toString\(\)\.trim\(\)\.toUpperCase\(\) : "";\s*const asig2 = fila\[5\] \? fila\[5\]\.toString\(\)\.trim\(\)\.toUpperCase\(\) : "";\s*const esCorta = \(asig1 !== "" && asig2 !== ""\);\s*if \(!mapaHorarios\[curso\]\) mapaHorarios\[curso\] = \{\};\s*if \(asig1\) \{ if \(!mapaHorarios\[curso\]\[asig1\]\) mapaHorarios\[curso\]\[asig1\] = \[\]; mapaHorarios\[curso\]\[asig1\]\.push\(\{ dia, inicio, fin, esCorta \}\); \}\s*if \(asig2\) \{ if \(!mapaHorarios\[curso\]\[asig2\]\) mapaHorarios\[curso\]\[asig2\] = \[\]; mapaHorarios\[curso\]\[asig2\]\.push\(\{ dia, inicio, fin, esCorta \}\); \}/g,
  `const inicio = fila[3]; const fin = fila[4];    
    const asig1 = fila[5] ? fila[5].toString().trim().toUpperCase() : ""; 
    const esCorta = false; // Ya no hay bloques compartidos
    
    if (!mapaHorarios[curso]) mapaHorarios[curso] = {};
    if (asig1) { if (!mapaHorarios[curso][asig1]) mapaHorarios[curso][asig1] = []; mapaHorarios[curso][asig1].push({ dia, inicio, fin, esCorta }); }`
);


// Ensure no unclosed templates are around opening html.
// There was a const html = `<!DOCTYPE html><html>... 
// we removed the html in step 1. But wait, `abrirDialogoCarga()` was in the original and still has `const html = \`` open if we just cut it!
// Ah, let's fix `abrirDialogoCarga`.
code = code.replace(/function abrirDialogoCarga\(\) {\s*const html = `$/g, '');

fs.writeFileSync('code.gs', code);
console.log('Rebuild complete!');
