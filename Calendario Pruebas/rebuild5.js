const fs = require('fs');
let text = fs.readFileSync('codigo.txt', 'utf8');

// 1. Separate code from html
let htmlIndex = text.indexOf('<!DOCTYPE html>');
let jsPart = text.substring(0, htmlIndex);
let htmlPart = text.substring(htmlIndex);

let execCargaStr = 'function ejecutarCargaAutomaticaBackend(permitirCortas)';
let execCargaIndex = htmlPart.indexOf(execCargaStr);
if (execCargaIndex > -1) {
  let endHtml = htmlPart.substring(execCargaIndex);
  jsPart += "\n\n" + endHtml;
}

let code = jsPart;

// Emojis
code = code.replace(/⏱️/g, '[H]');
code = code.replace(/❗/g, '[!]');

// Fix the backticks and syntax errors by matching substrings instead of exact backtick strings
code = code.replace(/logErrores\.push\(.Sin cupo para.*asigRegla.*curso.*\);/g, 'logErrores.push("Sin cupo para " + asigRegla + " en " + curso + ".");');
code = code.replace(/ui\.alert\(.*Carga finalizada.*nuevasEvaluaciones\.length.*\n.*\n.*\+.*logErrores\.length > 0 \?.*Alertas.*logErrores\.slice.*join.*/g, 
  'ui.alert("Carga finalizada.\\nAgendadas: " + nuevasEvaluaciones.length + ".\\n\\n" + (logErrores.length > 0 ? "Alertas:\\n" + logErrores.slice(0,5).join("\\n") : ""));');
code = code.replace(/ui\.alert\(.*No se generó nada.* \+ logErrores\.join.*/g, 'ui.alert("No se generó nada.\\n" + logErrores.join("\\n"));');
code = code.replace(/let msj = .*calcularDuracion\(bElegido\.inicio, bElegido\.fin, tz, bElegido\.esCorta\).* \| Auto.*/g, 
  'let msj = calcularDuracion(bElegido.inicio, bElegido.fin, tz, bElegido.esCorta) + " | Auto";');
code = code.replace(/return .*\[H\].*\$\{sI\}-\$\{sF\} \(\$<m>m\).* \+ \(esCorta \? " \[!\]" : ""\);/g, 
  'return "[H] " + sI + "-" + sF + " (" + m + "m)" + (esCorta ? " [!]" : "");');


// Replace weird characters by matching `return .*\[H\]` -> we can just match `return .*\[H\].*` on that line
// Actually, I can just replace all instances of backticks in jsPart if they are not needed... No, we need backticks for html? No, html is in htmlPart!
// Wait! `jsPart` shouldn't need ANY backticks unless there are template literals. We can replace ALL template literals with string concatenation!
code = code.replace(/return `\[H\] \$\{sI\}-\$\{sF\} \(\$\{m\}m\)` \+ \(esCorta \? " \[!\]" : ""\);/g, 'return "[H] " + sI + "-" + sF + " (" + m + "m)" + (esCorta ? " [!]" : "");');

// Replaces
let helpers = "function obtenerHojaHorariosExt() {\n  try {\n    const extSs = SpreadsheetApp.openById('1dN4LrF0Odt4kQ9ShYfuxX5xIWSGGTnFnqF64rgyOg0E');\n    for (let s of extSs.getSheets()) { if (s.getSheetId() == 1057884051) return s; }\n  } catch(e) { console.error(\"Error horarios ext: \" + e); }\n  return null;\n}\n\nfunction obtenerBloqueosExt() {\n  try {\n    const extSs = SpreadsheetApp.openById('1R897XLkr841Bkl22TY_dgDL6FENzvUdAmR-Ph5yaZdo');\n    let sheet = null;\n    for (let s of extSs.getSheets()) { if (s.getSheetId() == 626980973) { sheet = s; break; } }\n    if (!sheet) return [];\n    \n    let tiposQueBloquean = ['FERIADO', 'SUSPENSIÓN', 'VACACIONES', 'BLOQUEO']; \n    const ss = SpreadsheetApp.getActiveSpreadsheet();\n    const sheetGen = ss.getSheetByName('Config_General');\n    if (sheetGen) {\n      const fila = sheetGen.getDataRange().getValues().find(r => r[0] === 'Tipos_Bloqueo_Calendario');\n      if (fila && fila[1]) tiposQueBloquean = fila[1].toString().toUpperCase().split(',').map(s=>s.trim());\n    }\n\n    const data = sheet.getDataRange().getValues().slice(1);\n    const bloqueos = [];\n    data.forEach(r => {\n      if (r[0] && r[2]) {\n        const tipo = r[2].toString().trim().toUpperCase();\n        const evento = r[1] ? r[1].toString() : 'Día Bloqueado';\n        if (tiposQueBloquean.some(t => tipo.includes(t))) {\n          const d = new Date(r[0]);\n          if (!isNaN(d)) bloqueos.push({ fecha: d, evento: evento });\n        }\n      }\n    });\n    return bloqueos;\n  } catch(e) { console.error(\"Error calend ext: \" + e); return []; }\n}\n";

code = code.replace('function getDataConfig() {', helpers + '\nfunction getDataConfig() {');

code = code.replace(
  /let rolAsignado = null;\s*for \(let i = 0; i < data\.length; i\+\+\) {\s*if \(data\[i\]\[0\]\.toString\(\)\.trim\(\)\.toLowerCase\(\) === email\) {\s*rolAsignado = data\[i\]\[1\] \? data\[i\]\[1\]\.toString\(\)\.trim\(\) : 'Profesor';\s*break;\s*}\s*}\s*if \(!rolAsignado\) throw new Error\(`Acceso denegado: El correo \$\{email\} no tiene permisos de acceso.`\);\s*return \{ email: email, rol: rolAsignado \};\s*}/g,
  "let rolAsignado = null;\n  let nombreAsignado = \"\";\n\n  for (let i = 0; i < data.length; i++) {\n    if (data[i][0].toString().trim().toLowerCase() === email) {\n      rolAsignado = data[i][1] ? data[i][1].toString().trim() : 'Profesor';\n      nombreAsignado = data[i][2] ? data[i][2].toString().trim() : \"\";\n      break;\n    }\n  }\n\n  if (!rolAsignado) throw new Error(\"Acceso denegado: El correo \" + email + \" no tiene permisos de acceso.\");\n  return { email: email, rol: rolAsignado, nombre: nombreAsignado }; \n}"
);

code = code.replace(
  /return \{ autorizado: true, email: usuario\.email, rol: usuario\.rol, sistemaAbierto: abierto \};/g,
  "return { autorizado: true, email: usuario.email, rol: usuario.rol, nombre: usuario.nombre, sistemaAbierto: abierto };"
);

code = code.replace(
  /const sheetHorarios = ss\.getSheetByName\('horarios_cursos'\);/g,
  "const sheetHorarios = obtenerHojaHorariosExt();"
);
code = code.replace(
  /const a1 = r\[4\] \? r\[4\]\.toString\(\)\.trim\(\)\.toUpperCase\(\) : "";\s*const a2 = r\[5\] \? r\[5\]\.toString\(\)\.trim\(\)\.toUpperCase\(\) : "";\s*const prof = r\[6\] \? r\[6\]\.toString\(\)\.trim\(\)\.toLowerCase\(\) : "";\s*if \(prof === usuario\.email\.toLowerCase\(\)\) {/g,
  "const a1 = r[5] ? r[5].toString().trim().toUpperCase() : \"\";\n        const prof = r[6] ? r[6].toString().trim().toLowerCase() : \"\";\n        if (prof === usuario.email.toLowerCase() || (usuario.nombre && prof === usuario.nombre.toLowerCase())) {"
);
code = code.replace(
  /if \(a2 && !asignaturasPermitidas\.includes\(a2\)\) asignaturasPermitidas\.push\(a2\);\s*if \(!dictProfesor\[c\]\) dictProfesor\[c\] = \[\];\s*if \(a1 && !dictProfesor\[c\]\.includes\(a1\)\) dictProfesor\[c\]\.push\(a1\);\s*if \(a2 && !dictProfesor\[c\]\.includes\(a2\)\) dictProfesor\[c\]\.push\(a2\);/g,
  "if (!dictProfesor[c]) dictProfesor[c] = [];\n          if (a1 && !dictProfesor[c].includes(a1)) dictProfesor[c].push(a1);"
);

code = code.replace(
  /const sheetGen = ss\.getSheetByName\('Config_General'\);\s*if \(sheetGen\) {\s*sheetGen\.getDataRange\(\)\.getValues\(\)\.slice\(1\)\.forEach\(r => {\s*if \(r\[6\]\) {\s*const d = new Date\(r\[6\]\);\s*if \(!isNaN\(d\)\) {\s*todosLosEventos\.push\(\{\s*title: '🚫 ' \+ \(r\[7\] \? r\[7\]\.toString\(\) : 'Día Bloqueado'\),\s*start: Utilities\.formatDate\(d, tz, "yyyy-MM-dd"\),\s*allDay: true,\s*backgroundColor: '#dc3545',\s*borderColor: '#dc3545',\s*extendedProps: \{ bloqueado: true \}\s*\}\);\s*}\s*}\s*}\);\s*}/g,
  "const bloqueosExt = obtenerBloqueosExt();\n  bloqueosExt.forEach(b => {\n    todosLosEventos.push({\n      title: '🚫 ' + b.evento, start: Utilities.formatDate(b.fecha, tz, \"yyyy-MM-dd\"),\n      allDay: true, backgroundColor: '#dc3545', borderColor: '#dc3545', extendedProps: { bloqueado: true }\n    });\n  });"
);

code = code.replace(
  /const emailProfesor = usuario\.email;/g,
  "const emailProfesor = usuario.email;\n  const nombreProfesor = usuario.nombre ? usuario.nombre.toLowerCase() : \"\";"
);

code = code.replace(
  /for \(let r of dataGen\.slice\(1\)\) {\s*if \(r\[6\]\) {\s*const fechaBloqueada = Utilities\.formatDate\(new Date\(r\[6\]\), timezone, "yyyy-MM-dd"\);\s*if \(fechaBloqueada === datos\.fecha\) {\s*throw new Error\("No se puede agendar en esta fecha\. El día se encuentra bloqueado por administración\."\);\s*}\s*}\s*}/g,
  "const bloqueosExt = obtenerBloqueosExt();\n    for (let b of bloqueosExt) {\n      const fechaBloqueada = Utilities.formatDate(b.fecha, timezone, \"yyyy-MM-dd\");\n      if (fechaBloqueada === datos.fecha) {\n        throw new Error(\"No se puede agendar en esta fecha. Día bloqueado: \" + b.evento);\n      }\n    }"
);

code = code.replace(
  /if \(r\[6\] && r\[6\]\.toString\(\)\.trim\(\)\.toLowerCase\(\) === emailProfesor && r\[0\] && r\[0\]\.toString\(\)\.trim\(\) === datos\.curso\.trim\(\)\) {/g,
  "const prof = r[6] ? r[6].toString().trim().toLowerCase() : \"\";\n        if ((prof === emailProfesor || (nombreProfesor && prof === nombreProfesor)) && r[0] && r[0].toString().trim() === datos.curso.trim()) {"
);

code = code.replace(
  /const a1 = r\[4\] \? r\[4\]\.toString\(\)\.trim\(\)\.toUpperCase\(\) : "";\s*const a2 = r\[5\] \? r\[5\]\.toString\(\)\.trim\(\)\.toUpperCase\(\) : "";\s*const asigReq = datos\.asignatura\.trim\(\)\.toUpperCase\(\);\s*if \(a1 === asigReq \|\| a2 === asigReq\) {/g,
  "const a1 = r[5] ? r[5].toString().trim().toUpperCase() : \"\";\n          const asigReq = datos.asignatura.trim().toUpperCase();\n          if (a1 === asigReq) {"
);

code = code.replace(/function obtenerHorarioCurso[\s\S]*?return `Horario de \$\{curso\} guardado exitosamente\.`;\s*}/g, '');
code = code.replace(/function obtenerHorarioCurso[\s\S]*?return "Horario de " \+ curso \+ " guardado exitosamente\.";\s*}/g, '');
// Delete exact signature match up to the end brace
let funcMatch = code.match(/function obtenerHorarioCurso[\s\S]*?\}\n\nfunction guardarHorarioCurso/);
if (funcMatch) {
  code = code.replace(/function obtenerHorarioCurso[\s\S]*?\}\n\nfunction guardarHorarioCurso[\s\S]*?\}\n/g, "");
}

code = code.replace(
  /if \(r\[6\] && r\[6\]\.toString\(\)\.trim\(\)\.toLowerCase\(\) === usuario\.email\.toLowerCase\(\)\) {/g,
  "const prof = r[6] ? r[6].toString().trim().toLowerCase() : \"\";\n    if (prof === usuario.email.toLowerCase() || (usuario.nombre && prof === usuario.nombre.toLowerCase())) {"
);

code = code.replace(
  /const a1 = r\[4\] \? r\[4\]\.toString\(\)\.trim\(\)\.toUpperCase\(\) : "";\s*const a2 = r\[5\] \? r\[5\]\.toString\(\)\.trim\(\)\.toUpperCase\(\) : "";\s*if \(a1\) {\s*const key = curso \+ "\|" \+ a1;\s*cargaProfesor\[key\] = \(cargaProfesor\[key\] \|\| 0\) \+ 1;\s*}\s*if \(a2\) {\s*const key = curso \+ "\|" \+ a2;\s*cargaProfesor\[key\] = \(cargaProfesor\[key\] \|\| 0\) \+ 1;\s*}/g,
  "const a1 = r[5] ? r[5].toString().trim().toUpperCase() : \"\";\n      if (a1) {\n        const key = curso + \"|\" + a1;\n        cargaProfesor[key] = (cargaProfesor[key] || 0) + 1;\n      }"
);

code = code.replace(/const sheetCarga = ss\.getSheetByName\('Carga_Automatica'\); const sheetHorarios = ss\.getSheetByName\('horarios_cursos'\);/g, "const sheetCarga = ss.getSheetByName('Carga_Automatica'); const sheetHorarios = obtenerHojaHorariosExt();");

code = code.replace(
  /const fechasBloqueadas = new Set\(\);\s*if \(sheetGen\) {\s*sheetGen\.getDataRange\(\)\.getValues\(\)\.slice\(1\)\.forEach\(r => {\s*if \(r\[6\]\) {\s*const d = new Date\(r\[6\]\);\s*if \(!isNaN\(d\)\) fechasBloqueadas\.add\(Utilities\.formatDate\(d, tz, "yyyy-MM-dd"\)\);\s*}\s*}\);\s*}/g,
  "const bloqueosExt = obtenerBloqueosExt();\n  const fechasBloqueadas = new Set(bloqueosExt.map(b => Utilities.formatDate(b.fecha, tz, \"yyyy-MM-dd\")));"
);

code = code.replace(
  /const inicio = fila\[2\]; const fin = fila\[3\];\s*const asig1 = fila\[4\] \? fila\[4\]\.toString\(\)\.trim\(\)\.toUpperCase\(\) : "";\s*const asig2 = fila\[5\] \? fila\[5\]\.toString\(\)\.trim\(\)\.toUpperCase\(\) : "";\s*const esCorta = \(asig1 !== "" && asig2 !== ""\);\s*if \(!mapaHorarios\[curso\]\) mapaHorarios\[curso\] = \{\};\s*if \(asig1\) \{ if \(!mapaHorarios\[curso\]\[asig1\]\) mapaHorarios\[curso\]\[asig1\] = \[\]; mapaHorarios\[curso\]\[asig1\]\.push\(\{ dia, inicio, fin, esCorta \}\); \}\s*if \(asig2\) \{ if \(!mapaHorarios\[curso\]\[asig2\]\) mapaHorarios\[curso\]\[asig2\] = \[\]; mapaHorarios\[curso\]\[asig2\]\.push\(\{ dia, inicio, fin, esCorta \}\); \}/g,
  "const inicio = fila[3]; const fin = fila[4];    \n    const asig1 = fila[5] ? fila[5].toString().trim().toUpperCase() : \"\"; \n    const esCorta = false; // Ya no hay bloques compartidos\n    \n    if (!mapaHorarios[curso]) mapaHorarios[curso] = {};\n    if (asig1) { if (!mapaHorarios[curso][asig1]) mapaHorarios[curso][asig1] = []; mapaHorarios[curso][asig1].push({ dia, inicio, fin, esCorta }); }"
);

// Delete broken function
code = code.replace(/function abrirDialogoCarga\(\)[\s\S]*?\}\s*function ejecutarCargaAutomaticaBackend/g, "function ejecutarCargaAutomaticaBackend");

// Replace all remaining backticks with standard double quotes or template strings where possible
// We will simply regex ` ` ` globally to ` "` IF it is followed by something? No, we can just replace all \` with "
// But what about actual string literals? They won't have interpolation.
// So:
code = code.replace(/`/g, '"');
// And fix the ones that had ${}
code = code.replace(/"(.*)\$\{(.*)\}(.*)"/g, '"$1" + $2 + "$3"'); 
code = code.replace(/"(.*)\$\{(.*)\}(.*)\$\{(.*)\}(.*)"/g, '"$1" + $2 + "$3" + $4 + "$5"');

fs.writeFileSync('code.gs', code);
console.log('Rebuild complete!');
