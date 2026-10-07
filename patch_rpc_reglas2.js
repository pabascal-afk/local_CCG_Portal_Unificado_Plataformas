const fs = require('fs');
let code = fs.readFileSync('server/api/rpc.js', 'utf8');

const anchor = "const rolNorm = user.rol.toLowerCase();";

const logicToInject = `
              
              // 1. Deteccion de Electivos (Expansion de cursos afectados)
              const esElectivo = datos.asignatura.toUpperCase().includes('(ELECTIVO');
              let cursosAfectados = [datos.curso.trim().toUpperCase()];
              if (esElectivo) {
                  cursosAfectados = ['III° MEDIO A', 'III° MEDIO B', 'IV° MEDIO A', 'IV° MEDIO B'];
              }

              // 2. Validar Topes y Bloqueos Institucionales
              const eventosInstX = await queryAll("SELECT * FROM eventos WHERE fecha LIKE ? AND bloques IS NOT NULL", ["%" + datos.fecha + "%"]);
              const evaluacionesGuardadas = await queryAll("SELECT * FROM evaluaciones WHERE fecha LIKE ?", ["%" + datos.fecha + "%"]);
              
              const sumarParaTope = (t) => {
                  const txt = (t || '').toUpperCase();
                  return txt.includes('PRUEBA') || txt.includes('EXPOSICI') || txt === 'ESCRITA';
              };

              const calcularCarga = (listaAsignaturas) => {
                  let grupos = new Set();
                  let cargaNormal = 0;
                  listaAsignaturas.forEach(a => {
                      let match = a.match(/\\((ELECTIVO\\s*\\d+)\\)/i);
                      if (match) {
                          grupos.add(match[1].toUpperCase());
                      } else {
                          cargaNormal++;
                      }
                  });
                  return cargaNormal + grupos.size;
              };

              for (let c of cursosAfectados) {
                  // Bloqueos institucionales
                  for (let ev of eventosInstX) {
                      const cAfectadosInst = ev.cursos || 'TODOS';
                      if (cAfectadosInst === 'TODOS' || cAfectadosInst.split(',').map(x => x.trim().toUpperCase()).includes(c)) {
                          throw new Error("El día " + datos.fecha + " está bloqueado por la actividad institucional: " + ev.titulo + " (Afecta al curso " + c + ").");
                      }
                  }

                  // Topes diarios
                  if (sumarParaTope(datos.tipo)) {
                      const topes = await queryAll("SELECT * FROM config_topes WHERE UPPER(curso) = ?", [c]);
                      let maxDiaEscritas = 2; // Default para Media
                      if (topes.length > 0) {
                          maxDiaEscritas = parseInt(topes[0].max_dia_escritas) || 2;
                      } else if (c.includes('BASICO') && (parseInt(c.charAt(0)) <= 6)) {
                          maxDiaEscritas = 1; // Fallback para Basica
                      }
                      
                      let evalDia = [];
                      for (let evG of evaluacionesGuardadas) {
                          if (evG.curso.toUpperCase() === c && sumarParaTope(evG.tipo)) {
                              evalDia.push(evG.asignatura);
                          }
                      }
                      evalDia.push(datos.asignatura);

                      if (calcularCarga(evalDia) > maxDiaEscritas) {
                          throw new Error("Límite diario superado (" + maxDiaEscritas + " pruebas/exposiciones) para el curso " + c + ".");
                      }
                  }
              }
`;

code = code.replace(anchor, anchor + "\n" + logicToInject);

// Remove the old institutional block check
const oldBlockLogic = `// Validar Bloqueos Institucionales
              const eventosInst = await queryAll("SELECT * FROM eventos WHERE fecha LIKE ? AND bloques IS NOT NULL", [\`%\${datos.fecha}%\`]);
              for (let ev of eventosInst) {
                  const cursosAfectados = ev.cursos || 'TODOS';
                  if (cursosAfectados === 'TODOS' || cursosAfectados.split(',').map(c => c.trim()).includes(datos.curso)) {
                      throw new Error(\`El día \${datos.fecha} está bloqueado por la actividad institucional: \${ev.titulo}\`);
                  }
              }`;

// Since the old logic has special characters, let's just replace it via regex or substring
code = code.replace(/\/\/ Validar Bloqueos Institucionales[\s\S]*?\}\s*\}/, "");

const insertAnchor = `await run(
                  "INSERT INTO evaluaciones (id, fecha, curso, asignatura, tipo, recurso, profesor_email, profesor_nombre, detalles) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                  [nuevoId, datos.fecha, datos.curso, datos.asignatura, datos.tipo, datos.recurso, profeEmail, profeNombre, datos.detalles]
              );`;
              
const newInsert = `for (let c of cursosAfectados) {
                  const nId = Math.random().toString(36).substr(2, 9);
                  await run(
                      "INSERT INTO evaluaciones (id, fecha, curso, asignatura, tipo, recurso, profesor_email, profesor_nombre, detalles) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                      [nId, datos.fecha, c, datos.asignatura, datos.tipo, datos.recurso, profeEmail, profeNombre, datos.detalles]
                  );
              }`;

code = code.replace(insertAnchor, newInsert);

fs.writeFileSync('server/api/rpc.js', code, 'utf8');
console.log("rpc.js inyectado!");
