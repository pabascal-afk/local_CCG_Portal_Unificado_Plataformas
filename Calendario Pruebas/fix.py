import re

with open('codigo.txt', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Separate code from html
html_index = text.find('<!DOCTYPE html>')
js_part = text[:html_index]
html_part = text[html_index:]

exec_carga_str = 'function ejecutarCargaAutomaticaBackend(permitirCortas)'
exec_carga_index = html_part.find(exec_carga_str)
if exec_carga_index > -1:
    end_html = html_part[exec_carga_index:]
    js_part += "\n\n" + end_html

code = js_part

# Emojis
code = code.replace('⏱️', '[H]')
code = code.replace('❗', '[!]')

# Fix corrupted backticks around Sin cupo para...
code = re.sub(r'logErrores\.push\([^)]*Sin cupo para[^)]*\);', 'logErrores.push("Sin cupo para " + asigRegla + " en " + curso + ".");', code)
code = re.sub(r'ui\.alert\([^)]*Carga finalizada[^)]*\);', 'ui.alert("✅ Carga finalizada.\\nAgendadas: " + String(nuevasEvaluaciones.length) + ".\\n\\n" + (logErrores.length > 0 ? "Alertas:\\n" + logErrores.slice(0,5).join("\\n") : ""));', code)
code = re.sub(r'ui\.alert\([^)]*No se generó nada[^)]*\);', 'ui.alert("No se generó nada.\\n" + logErrores.join("\\n"));', code)
code = re.sub(r'let msj = .*calcularDuracion\(bElegido\.inicio, bElegido\.fin, tz, bElegido\.esCorta\).*\| Auto.*;', 'let msj = calcularDuracion(bElegido.inicio, bElegido.fin, tz, bElegido.esCorta) + " | Auto";', code)
code = re.sub(r'return .*\[H\].*sI.*sF.*<m>m.*\+.*esCorta.*\[!\].*""\);', 'return "[H] " + sI + "-" + sF + " (" + m + "m)" + (esCorta ? " [!]" : "");', code)


# Helpers
helpers = """
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
"""
code = code.replace('function getDataConfig() {', helpers + '\nfunction getDataConfig() {')

code = re.sub(
  r'let rolAsignado = null;\s*for \(let i = 0; i < data\.length; i\+\+\) \{\s*if \(data\[i\]\[0\]\.toString\(\)\.trim\(\)\.toLowerCase\(\) === email\) \{\s*rolAsignado = data\[i\]\[1\] \? data\[i\]\[1\]\.toString\(\)\.trim\(\) : \'Profesor\';\s*break;\s*\}\s*\}\s*if \(!rolAsignado\) throw new Error\(`Acceso denegado: El correo \$\{email\} no tiene permisos de acceso.`\);\s*return \{ email: email, rol: rolAsignado \};\s*\}',
  'let rolAsignado = null;\n  let nombreAsignado = "";\n\n  for (let i = 0; i < data.length; i++) {\n    if (data[i][0].toString().trim().toLowerCase() === email) {\n      rolAsignado = data[i][1] ? data[i][1].toString().trim() : \'Profesor\';\n      nombreAsignado = data[i][2] ? data[i][2].toString().trim() : "";\n      break;\n    }\n  }\n\n  if (!rolAsignado) throw new Error("Acceso denegado: El correo " + email + " no tiene permisos de acceso.");\n  return { email: email, rol: rolAsignado, nombre: nombreAsignado }; \n}',
  code
)

code = re.sub(
  r'return \{ autorizado: true, email: usuario\.email, rol: usuario\.rol, sistemaAbierto: abierto \};',
  'return { autorizado: true, email: usuario.email, rol: usuario.rol, nombre: usuario.nombre, sistemaAbierto: abierto };',
  code
)

code = re.sub(
  r'const sheetHorarios = ss\.getSheetByName\(\'horarios_cursos\'\);',
  'const sheetHorarios = obtenerHojaHorariosExt();',
  code
)

code = re.sub(
  r'const a1 = r\[4\] \? r\[4\]\.toString\(\)\.trim\(\)\.toUpperCase\(\) : "";\s*const a2 = r\[5\] \? r\[5\]\.toString\(\)\.trim\(\)\.toUpperCase\(\) : "";\s*const prof = r\[6\] \? r\[6\]\.toString\(\)\.trim\(\)\.toLowerCase\(\) : "";\s*if \(prof === usuario\.email\.toLowerCase\(\)\) \{',
  'const a1 = r[5] ? r[5].toString().trim().toUpperCase() : "";\n        const prof = r[6] ? r[6].toString().trim().toLowerCase() : "";\n        if (prof === usuario.email.toLowerCase() || (usuario.nombre && prof === usuario.nombre.toLowerCase())) {',
  code
)

code = re.sub(
  r'if \(a2 && !asignaturasPermitidas\.includes\(a2\)\) asignaturasPermitidas\.push\(a2\);\s*if \(!dictProfesor\[c\]\) dictProfesor\[c\] = \[\];\s*if \(a1 && !dictProfesor\[c\]\.includes\(a1\)\) dictProfesor\[c\]\.push\(a1\);\s*if \(a2 && !dictProfesor\[c\]\.includes\(a2\)\) dictProfesor\[c\]\.push\(a2\);',
  'if (!dictProfesor[c]) dictProfesor[c] = [];\n          if (a1 && !dictProfesor[c].includes(a1)) dictProfesor[c].push(a1);',
  code
)

code = re.sub(
  r'const sheetGen = ss\.getSheetByName\(\'Config_General\'\);\s*if \(sheetGen\) \{\s*sheetGen\.getDataRange\(\)\.getValues\(\)\.slice\(1\)\.forEach\(r => \{\s*if \(r\[6\]\) \{\s*const d = new Date\(r\[6\]\);\s*if \(!isNaN\(d\)\) \{\s*todosLosEventos\.push\(\{\s*title: \'🚫 \' \+ \(r\[7\] \? r\[7\]\.toString\(\) : \'Día Bloqueado\'\),\s*start: Utilities\.formatDate\(d, tz, "yyyy-MM-dd"\),\s*allDay: true,\s*backgroundColor: \'#dc3545\',\s*borderColor: \'#dc3545\',\s*extendedProps: \{ bloqueado: true \}\s*\}\);\s*\}\s*\}\s*\}\);\s*\}',
  'const bloqueosExt = obtenerBloqueosExt();\n  bloqueosExt.forEach(b => {\n    todosLosEventos.push({\n      title: \'🚫 \' + b.evento, start: Utilities.formatDate(b.fecha, tz, "yyyy-MM-dd"),\n      allDay: true, backgroundColor: \'#dc3545\', borderColor: \'#dc3545\', extendedProps: { bloqueado: true }\n    });\n  });',
  code
)

code = re.sub(
  r'const emailProfesor = usuario\.email;',
  'const emailProfesor = usuario.email;\n  const nombreProfesor = usuario.nombre ? usuario.nombre.toLowerCase() : "";',
  code
)

code = re.sub(
  r'for \(let r of dataGen\.slice\(1\)\) \{\s*if \(r\[6\]\) \{\s*const fechaBloqueada = Utilities\.formatDate\(new Date\(r\[6\]\), timezone, "yyyy-MM-dd"\);\s*if \(fechaBloqueada === datos\.fecha\) \{\s*throw new Error\("No se puede agendar en esta fecha\. El día se encuentra bloqueado por administración\."\);\s*\}\s*\}\s*\}',
  'const bloqueosExt = obtenerBloqueosExt();\n    for (let b of bloqueosExt) {\n      const fechaBloqueada = Utilities.formatDate(b.fecha, timezone, "yyyy-MM-dd");\n      if (fechaBloqueada === datos.fecha) {\n        throw new Error("No se puede agendar en esta fecha. Día bloqueado: " + b.evento);\n      }\n    }',
  code
)

code = re.sub(
  r'if \(r\[6\] && r\[6\]\.toString\(\)\.trim\(\)\.toLowerCase\(\) === emailProfesor && r\[0\] && r\[0\]\.toString\(\)\.trim\(\) === datos\.curso\.trim\(\)\) \{',
  'const prof = r[6] ? r[6].toString().trim().toLowerCase() : "";\n        if ((prof === emailProfesor || (nombreProfesor && prof === nombreProfesor)) && r[0] && r[0].toString().trim() === datos.curso.trim()) {',
  code
)

code = re.sub(
  r'const a1 = r\[4\] \? r\[4\]\.toString\(\)\.trim\(\)\.toUpperCase\(\) : "";\s*const a2 = r\[5\] \? r\[5\]\.toString\(\)\.trim\(\)\.toUpperCase\(\) : "";\s*const asigReq = datos\.asignatura\.trim\(\)\.toUpperCase\(\);\s*if \(a1 === asigReq \|\| a2 === asigReq\) \{',
  'const a1 = r[5] ? r[5].toString().trim().toUpperCase() : "";\n          const asigReq = datos.asignatura.trim().toUpperCase();\n          if (a1 === asigReq) {',
  code
)


# FIXED REGEX FOR CONSTRUCTOR
code = re.sub(r'function obtenerHorarioCurso[\s\S]*?guardado exitosamente[^}]*\}', '', code)

code = re.sub(
  r'if \(r\[6\] && r\[6\]\.toString\(\)\.trim\(\)\.toLowerCase\(\) === usuario\.email\.toLowerCase\(\)\) \{',
  'const prof = r[6] ? r[6].toString().trim().toLowerCase() : "";\n    if (prof === usuario.email.toLowerCase() || (usuario.nombre && prof === usuario.nombre.toLowerCase())) {',
  code
)

code = re.sub(
  r'const a1 = r\[4\] \? r\[4\]\.toString\(\)\.trim\(\)\.toUpperCase\(\) : "";\s*const a2 = r\[5\] \? r\[5\]\.toString\(\)\.trim\(\)\.toUpperCase\(\) : "";\s*if \(a1\) \{\s*const key = curso \+ "\|" \+ a1;\s*cargaProfesor\[key\] = \(cargaProfesor\[key\] \|\| 0\) \+ 1;\s*\}\s*if \(a2\) \{\s*const key = curso \+ "\|" \+ a2;\s*cargaProfesor\[key\] = \(cargaProfesor\[key\] \|\| 0\) \+ 1;\s*\}',
  'const a1 = r[5] ? r[5].toString().trim().toUpperCase() : "";\n      if (a1) {\n        const key = curso + "|" + a1;\n        cargaProfesor[key] = (cargaProfesor[key] || 0) + 1;\n      }',
  code
)

code = re.sub(r'const sheetCarga = ss\.getSheetByName\(\'Carga_Automatica\'\); const sheetHorarios = ss\.getSheetByName\(\'horarios_cursos\'\);', "const sheetCarga = ss.getSheetByName('Carga_Automatica'); const sheetHorarios = obtenerHojaHorariosExt();", code)

code = re.sub(
  r'const fechasBloqueadas = new Set\(\);\s*if \(sheetGen\) \{\s*sheetGen\.getDataRange\(\)\.getValues\(\)\.slice\(1\)\.forEach\(r => \{\s*if \(r\[6\]\) \{\s*const d = new Date\(r\[6\]\);\s*if \(!isNaN\(d\)\) fechasBloqueadas\.add\(Utilities\.formatDate\(d, tz, "yyyy-MM-dd"\)\);\s*\}\s*\}\);\s*\}',
  'const bloqueosExt = obtenerBloqueosExt();\n  const fechasBloqueadas = new Set(bloqueosExt.map(b => Utilities.formatDate(b.fecha, tz, "yyyy-MM-dd")));',
  code
)

code = re.sub(
  r'const inicio = fila\[2\]; const fin = fila\[3\];\s*const asig1 = fila\[4\] \? fila\[4\]\.toString\(\)\.trim\(\)\.toUpperCase\(\) : "";\s*const asig2 = fila\[5\] \? fila\[5\]\.toString\(\)\.trim\(\)\.toUpperCase\(\) : "";\s*const esCorta = \(asig1 !== "" && asig2 !== ""\);\s*if \(!mapaHorarios\[curso\]\) mapaHorarios\[curso\] = \{\};\s*if \(asig1\) \{ if \(!mapaHorarios\[curso\]\[asig1\]\) mapaHorarios\[curso\]\[asig1\] = \[\]; mapaHorarios\[curso\]\[asig1\]\.push\(\{ dia, inicio, fin, esCorta \}\); \}\s*if \(asig2\) \{ if \(!mapaHorarios\[curso\]\[asig2\]\) mapaHorarios\[curso\]\[asig2\] = \[\]; mapaHorarios\[curso\]\[asig2\]\.push\(\{ dia, inicio, fin, esCorta \}\); \}',
  'const inicio = fila[3]; const fin = fila[4];    \n    const asig1 = fila[5] ? fila[5].toString().trim().toUpperCase() : ""; \n    const esCorta = false; // Ya no hay bloques compartidos\n    \n    if (!mapaHorarios[curso]) mapaHorarios[curso] = {};\n    if (asig1) { if (!mapaHorarios[curso][asig1]) mapaHorarios[curso][asig1] = []; mapaHorarios[curso][asig1].push({ dia, inicio, fin, esCorta }); }',
  code
)

# VERY IMPORTANT: Remove abrirDialogoCarga properly
code = re.sub(r'function abrirDialogoCarga\(\)[\s\S]*?\}\s*function ejecutarCargaAutomaticaBackend', "function ejecutarCargaAutomaticaBackend", code)

with open('code.gs', 'w', encoding='utf-8') as f:
    f.write(code)

print("Python patch complete!")
