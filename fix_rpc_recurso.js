const fs = require('fs');
let code = fs.readFileSync('server/api/rpc.js', 'utf8');

// Update getEventosCalendario
const getRegex = /const evtInstitucionales = await queryAll\("SELECT \* FROM eventos"\);\s*evtInstitucionales\.forEach\(e => \{/;
const getReplace = `const evtInstitucionales = await queryAll("SELECT * FROM eventos");
              evtInstitucionales.forEach(e => {
                  let rec = null;
                  try { rec = e.recurso; } catch(ex){}
`;
code = code.replace(getRegex, getReplace);

// We need to make sure we inject 'recurso: e.recurso' into extendedProps in getEventosCalendario.
const propsRegex = /extendedProps: \{\s*esInstitucional: true,\s*esBloqueo: e\.bloques \? true : false,\s*bloques: e\.bloques,\s*cursos: e\.cursos,\s*externos: e\.externos\s*\}/;
const propsReplace = `extendedProps: {
                          esInstitucional: true,
                          esBloqueo: e.bloques ? true : false,
                          bloques: e.bloques,
                          cursos: e.cursos,
                          externos: e.externos,
                          recurso: e.recurso
                      }`;
code = code.replace(propsRegex, propsReplace);

// Update procesarEvento
const procRegex = /const externosStr = datos\.externos \? JSON\.stringify\(datos\.externos\) : '\[\]';\s*if \(datos\.idEditar\) \{[\s\S]*?UPDATE eventos SET fecha = \?, titulo = \?, categoria = \?, bloques = \?, cursos = \?, externos = \? WHERE id = \?"\,\s*\[fecha, datos\.texto, datos\.tipo, datos\.bloquea \? datos\.bloques : null, datos\.cursos \|\| 'TODOS', externosStr, datos\.idEditar\]\);\s*\} else \{[\s\S]*?INSERT INTO eventos \(fecha, titulo, categoria, bloques, creador_email, cursos, externos\) VALUES \(\?, \?, \?, \?, \?, \?, \?\)",\s*\[fecha, datos\.texto, datos\.tipo, datos\.bloquea \? datos\.bloques : null, user\.email, datos\.cursos \|\| 'TODOS', externosStr\]\);\s*\}/;
const procReplace = `const externosStr = datos.externos ? JSON.stringify(datos.externos) : '[]';
                 const rec = datos.recurso || null;
                 if (datos.idEditar) {
                     await run("UPDATE eventos SET fecha = ?, titulo = ?, categoria = ?, bloques = ?, cursos = ?, externos = ?, recurso = ? WHERE id = ?", 
                         [fecha, datos.texto, datos.tipo, datos.bloquea ? datos.bloques : null, datos.cursos || 'TODOS', externosStr, rec, datos.idEditar]);
                 } else {
                     await run("INSERT INTO eventos (fecha, titulo, categoria, bloques, creador_email, cursos, externos, recurso) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                         [fecha, datos.texto, datos.tipo, datos.bloquea ? datos.bloques : null, user.email, datos.cursos || 'TODOS', externosStr, rec]);
                 }`;
code = code.replace(procRegex, procReplace);

fs.writeFileSync('server/api/rpc.js', code, 'utf8');
console.log('rpc.js updated with recurso logic');
