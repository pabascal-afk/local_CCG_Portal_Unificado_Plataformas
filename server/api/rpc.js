const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const nodemailer = require('nodemailer');
const path = require('path');
const transporter = nodemailer.createTransport({service: 'gmail', auth: {user: process.env.SMTP_USER, pass: process.env.SMTP_PASS}});
const dbPath = path.join(__dirname, '../db/colegio.db');

const queryAll = (query, params = []) => new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath);
    db.all(query, params, (err, rows) => {
        db.close();
        if(err) reject(err); else resolve(rows);
    });
});

const run = (query, params = []) => new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath);
    db.run(query, params, function(err) {
        db.close();
        if(err) reject(err); else resolve(this.lastID);
    });
});

function sonMismoProfesor(profesorHorario, user) {
    if (!profesorHorario || !user) return false;
    const norm = (s) => (s || '').toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().replace(/\s+/g, ' ');
    const p1 = norm(profesorHorario);
    const pNombre = norm(user.nombre);
    if (p1 === pNombre) return true;
    
    if (user.email) {
        const uEmailPrefix = norm(user.email.split('@')[0]);
        const parts = p1.split(' ');
        if (parts.length >= 2) {
            const initialPlusLast = parts[0][0] + parts[parts.length - 1];
            if (initialPlusLast === uEmailPrefix) return true;
        }
        if (uEmailPrefix.length >= 4 && p1.includes(uEmailPrefix)) return true;
    }
    
    if (p1.length > 5 && pNombre.length > 5) {
        if (p1.includes(pNombre) || pNombre.includes(p1)) return true;
    }
    return false;
}

router.post('/:functionName', async (req, res) => {
    const { functionName } = req.params;
    const args = req.body.args || [];
    const user = req.user || { email: 'pabascal@colegiocerrogrande.cl', nombre: 'PEDRO ABASCAL', rol: 'Administrador' };
    
    try {
        if (functionName === 'getConfigFrontend') {
            
              const rolesList = await queryAll("SELECT * FROM roles_config WHERE nombre = ?", [user.rol]);
              let permisos = { esAdminGeneral: false, puedeAgendarSinRestricciones: false };
              if (rolesList.length > 0) {
                  try { 
                        permisos = JSON.parse(rolesList[0].permisos); 
                        if (permisos.ignorarMalla || permisos.esAdminGeneral) {
                            permisos.puedeAgendarSinRestricciones = true;
                        }
                    } catch(e){}
              } else {
                  // Fallback
                  const r = user.rol.toLowerCase();
                  permisos = {
                      esAdminGeneral: r.includes('admin') || r.includes('directivo'),
                      puedeAgendarSinRestricciones: r.includes('admin') || r.includes('directivo') || r.includes('convivencia') || r.includes('coordinaci')
                  };
              }
              const isAdmin = permisos.esAdminGeneral || permisos.puedeAgendarSinRestricciones; // Basic legacy map for Calendario

            
            // Extract from DB
            const allHorarios = await queryAll("SELECT * FROM horarios");
            const cursosSet = new Set();
            const misCursosSet = new Set();
            const asigSet = new Set();
            const profSet = new Set();
            
            const asigDict = {};
            const misAsignaturasPorCurso = {};
            const misDiasPorCurso = {};
            const diasPorCursoAsig = {};
            const todasAsigPorCurso = {};

            const diasOrden = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];
            const diaNombreMap = {
                'LUNES': 'Lunes',
                'MARTES': 'Martes',
                'MIERCOLES': 'Miércoles',
                'JUEVES': 'Jueves',
                'VIERNES': 'Viernes',
                'SABADO': 'Sábado',
                'DOMINGO': 'Domingo'
            };
            
            allHorarios.forEach(h => {
                if(h.curso) cursosSet.add(h.curso.trim());
                if(h.asignatura) asigSet.add(h.asignatura.trim());
                if(h.profesor) profSet.add(h.profesor.trim());
                
                const c = h.curso ? h.curso.trim() : '';
                const a = h.asignatura ? h.asignatura.trim() : '';
                const d = h.dia ? h.dia.trim().toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : '';
                
                if (!c || !a) return;

                if (!asigDict[c]) asigDict[c] = {};
                if (!todasAsigPorCurso[c]) todasAsigPorCurso[c] = new Set();
                todasAsigPorCurso[c].add(a);

                if (!diasPorCursoAsig[c]) diasPorCursoAsig[c] = {};
                if (!diasPorCursoAsig[c][a]) diasPorCursoAsig[c][a] = new Set();
                if (d) diasPorCursoAsig[c][a].add(d);
                
                const esMiClase = sonMismoProfesor(h.profesor, user);
                if (esMiClase) {
                    misCursosSet.add(c);
                    if (!misAsignaturasPorCurso[c]) misAsignaturasPorCurso[c] = new Set();
                    misAsignaturasPorCurso[c].add(a);
                    if (!misDiasPorCurso[c]) misDiasPorCurso[c] = new Set();
                    if (d) misDiasPorCurso[c].add(d);
                }
                
                if (isAdmin) {
                    // Admin: guardamos la asignatura en el día real en que tiene clases en ese curso
                    if (d) {
                        if (!asigDict[c][d]) asigDict[c][d] = new Set();
                        asigDict[c][d].add(a);
                    }
                } else {
                    // Solo los del profe actual en el día real
                    if (esMiClase && d) {
                        if (!asigDict[c][d]) asigDict[c][d] = new Set();
                        asigDict[c][d].add(a);
                    }
                }
            });

            // Convert Sets to Arrays and enrich with metadata
            const finalDict = {};
            for (let cur in asigDict) {
                finalDict[cur] = {};
                for (let dia in asigDict[cur]) {
                    finalDict[cur][dia] = Array.from(asigDict[cur][dia]).sort();
                }

                if (isAdmin) {
                    finalDict[cur]['_todas'] = Array.from(todasAsigPorCurso[cur] || []).sort();
                    
                    const diasMap = {};
                    const curAsigs = todasAsigPorCurso[cur] || new Set();
                    curAsigs.forEach(asigNombre => {
                        const dSet = (diasPorCursoAsig[cur] && diasPorCursoAsig[cur][asigNombre]) ? diasPorCursoAsig[cur][asigNombre] : new Set();
                        diasMap[asigNombre] = diasOrden.filter(diaKey => dSet.has(diaKey)).map(diaKey => diaNombreMap[diaKey] || diaKey);
                    });
                    finalDict[cur]['_diasAsig'] = diasMap;
                } else {
                    if (misAsignaturasPorCurso[cur]) {
                        finalDict[cur]['_todas'] = Array.from(misAsignaturasPorCurso[cur]).sort();
                    }
                    if (misDiasPorCurso[cur]) {
                        finalDict[cur]['_dias'] = Array.from(misDiasPorCurso[cur]).sort();
                    }
                }
            }

            // Asegurar que todos los cursos tengan entrada en finalDict
            cursosSet.forEach(cur => {
                if (!finalDict[cur]) {
                    finalDict[cur] = {};
                    if (isAdmin) {
                        finalDict[cur]['_todas'] = [];
                        finalDict[cur]['_diasAsig'] = {};
                    }
                }
            });

            const cursosFinales = (!isAdmin && misCursosSet.size > 0)
                ? Array.from(misCursosSet).sort()
                : Array.from(cursosSet).sort();

            const result = {
                usuario: { 
                    nombre: user.nombre, 
                    rol: user.rol, 
                    email: user.email,
                    permisos: permisos,
                    esAdmin: isAdmin
                },
                sistemaAbierto: true,
                profesoresBloqueados: [],
                cursos: cursosFinales,
                misCursos: Array.from(misCursosSet).sort(),
                asignaturasDict: finalDict,
                filtrosGlobales: {
                    cursos: Array.from(cursosSet).sort(),
                    asignaturas: Array.from(asigSet).sort(),
                    profesores: Array.from(profSet).sort()
                }
            };
            return res.json({ result });
        }
        
        if (functionName === 'getEventosCalendario') {
            const evaluaciones = await queryAll("SELECT * FROM evaluaciones");
            const eventos = evaluaciones.map(e => {
                const esBloqueo = !!(e.tipo && e.tipo.includes('BLOQUEO') || (e.asignatura && e.asignatura.toUpperCase() === 'ADMIN'));
                return {
                    id: e.id,
                    title: `${e.asignatura} - ${e.curso} (${e.tipo})`,
                    start: e.fecha,
                    extendedProps: {
                        curso: e.curso,
                        asignatura: e.asignatura,
                        tipo: e.tipo,
                        recurso: e.recurso,
                        detalles: e.detalles,
                        temario: e.temario || e.detalles || '',
                        profesor: esBloqueo ? 'Administración' : (e.profesor_nombre || e.profesor_email),
                        email: esBloqueo ? 'admin@colegio.edu' : e.profesor_email,
                        esBloqueo: esBloqueo
                    },
                    color: (() => {
                        if (esBloqueo) return '#dc3545';
                        if (!e.asignatura) return '#3788d8';
                        let hash = 0;
                        const nombre = e.asignatura.toUpperCase();
                        for (let i = 0; i < nombre.length; i++) {
                            hash = nombre.charCodeAt(i) + ((hash << 5) - hash);
                        }
                        const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
                        return '#' + '00000'.substring(0, 6 - c.length) + c;
                    })()
                };
            });

            // Cargar Bloqueos desde Calendario Anual (Eventos)
            const eventosInst = await queryAll("SELECT * FROM eventos WHERE bloques IS NOT NULL");
            eventosInst.forEach(ev => {
                const esTotal = ev.bloques === 'TODOS';
                const cursos = ev.cursos || 'TODOS';
                let tituloBase = esTotal ? '[BLOQUEADO] ' + ev.titulo : '[ATENCIÓN] ' + ev.titulo + ' (Bloques ' + ev.bloques + ')';
                let color = esTotal ? '#dc3545' : '#fd7e14';
                const f = ev.fecha.split(' ')[0]; // Handle '3/3/2026 12:00:00' format

                // Format fecha if needed
                let fechaFormateada = f;
                if(f.includes('/')) {
                   const parts = f.split('/');
                   fechaFormateada = `${parts[2]}-${parts[0].padStart(2,'0')}-${parts[1].padStart(2,'0')}`;
                }

                if (cursos === 'TODOS' || cursos.trim() === '') {
                    eventos.push({
                        id: 'bloqueo_' + ev.id,
                        title: tituloBase,
                        start: fechaFormateada,
                        allDay: true,
                        backgroundColor: color,
                        borderColor: color,
                        extendedProps: { esBloqueo: true, curso: 'TODOS' }
                    });
                } else {
                    const listaCursos = cursos.split(',').map(c => c.trim());
                    listaCursos.forEach((c, idx) => {
                        eventos.push({
                            id: 'bloqueo_' + ev.id + '_' + idx,
                            title: tituloBase + ' - ' + c,
                            start: fechaFormateada,
                            allDay: true,
                            backgroundColor: color,
                            borderColor: color,
                            extendedProps: { esBloqueo: true, curso: c }
                        });
                    });
                }
            });

            return res.json({ result: eventos });
        }
        
        if (functionName === 'agendarEvaluacion') {
            const datos = args[0];
            const rolNorm = user.rol.toLowerCase();

            // Usar rolesListAg para obtener permisos
            const rListAg2 = await queryAll("SELECT * FROM roles_config WHERE nombre = ?", [user.rol]);
            let tienePermisosEspeciales = false;
            if (rListAg2.length > 0) {
                try { 
                    const p2 = JSON.parse(rListAg2[0].permisos); 
                    tienePermisosEspeciales = p2.esAdminGeneral || p2.puedeAgendarSinRestricciones || p2.ignorarMalla;
                } catch(e){}
            } else {
                const rn = user.rol.toLowerCase();
                tienePermisosEspeciales = rn.includes('admin') || rn.includes('directivo') || rn.includes('convivencia') || rn.includes('coordinaci');
            }

            // 1. Deteccion de Electivos (Expansion de cursos afectados)
            const esElectivo = datos.asignatura.toUpperCase().includes('(ELECTIVO') || datos.asignatura.toUpperCase().includes('ELECTIVO');
            let cursosAfectados = [datos.curso.trim().toUpperCase()];
            if (esElectivo) {
                cursosAfectados = ['III° MEDIO A', 'III° MEDIO B', 'IV° MEDIO A', 'IV° MEDIO B'];
            }

            // 1.1 Si es profesor sin permisos de admin, validar que tenga ESE ramo ESE día según el horario
            if (!tienePermisosEspeciales) {
                const partesF = (datos.fecha || '').split('-');
                if (partesF.length === 3) {
                    const fDate = new Date(parseInt(partesF[0], 10), parseInt(partesF[1], 10) - 1, parseInt(partesF[2], 10));
                    const diasSem = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
                    const diaSem = diasSem[fDate.getDay()];
                    const diaSemNorm = diaSem.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

                    const hClases = await queryAll("SELECT * FROM horarios");
                    const tieneClase = hClases.some(h => {
                        if (!sonMismoProfesor(h.profesor, user)) return false;
                        const hDiaNorm = (h.dia || '').toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                        if (hDiaNorm !== diaSemNorm) return false;
                        const hAsig = (h.asignatura || '').trim().toUpperCase();
                        const dAsig = (datos.asignatura || '').trim().toUpperCase();
                        const hCurso = (h.curso || '').trim().toUpperCase();
                        const dCurso = (datos.curso || '').trim().toUpperCase();
                        return hAsig === dAsig && (hCurso === dCurso || esElectivo);
                    });

                    if (!tieneClase) {
                        throw new Error(`No tienes clases de la asignatura "${datos.asignatura}" en tu horario el día ${diaSem}. Solo puedes agendar evaluaciones en los días en que tienes clases.`);
                    }
                }
            }

            // 2. Validar Topes y Bloqueos Institucionales
              const eventosInstX = await queryAll("SELECT * FROM eventos WHERE fecha LIKE ? AND bloques IS NOT NULL", ["%" + datos.fecha + "%"]);
              const evaluacionesGuardadas = await queryAll("SELECT * FROM evaluaciones WHERE fecha LIKE ?", ["%" + datos.fecha + "%"]);
              
              const tiposDbList = await queryAll("SELECT * FROM config_tipos_evaluacion");
              const esPruebaTipo = (t) => {
                  const txt = (t || '').trim();
                  const found = tiposDbList.find(dbT => dbT.nombre.toLowerCase().trim() === txt.toLowerCase());
                  if (found) return found.es_prueba === 1;
                  const tUpper = txt.toUpperCase();
                  return tUpper.includes('PRUEBA') || tUpper.includes('SUMA') || tUpper.includes('EXAMEN') || tUpper.includes('ENSAYO');
              };

              if (esPruebaTipo(datos.tipo)) {
                  const temarioTxt = (datos.temario || '').trim();
                  if (!temarioTxt) {
                      throw new Error("El temario es obligatorio para las evaluaciones con categoría de prueba.");
                  }
              }

              const sumarParaTope = (t) => {
                  const txt = (t || '').trim();
                  const found = tiposDbList.find(dbT => dbT.nombre.trim() === txt);
                  if (found) return found.es_prueba === 1;
                  // Fallback to legacy string matching if type not in DB
                  const tUpper = txt.toUpperCase();
                  return tUpper.includes('PRUEBA') || tUpper.includes('EXPOSICI') || tUpper === 'ESCRITA';
              };

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

            
            
            

            if (datos.recurso && datos.recurso !== "Ninguno" && datos.recurso !== "") {
                const rolesListAg = await queryAll("SELECT * FROM roles_config WHERE nombre = ?", [user.rol]);
                  let pedirLabs = false;
                  if (rolesListAg.length > 0) {
                      try { pedirLabs = JSON.parse(rolesListAg[0].permisos).pedirLaboratorios; } catch(e){}
                  } else {
                      const r = user.rol.toLowerCase();
                      pedirLabs = r.includes('admin') || r.includes('directivo') || r.includes('coordinaci');
                  }
                  
                  if (!pedirLabs) {
                      throw new Error("Acceso denegado: Tu rol no tiene permisos para solicitar laboratorios u otros recursos físicos al agendar.");
                  }
                const bloqueadas = await queryAll("SELECT * FROM reservas WHERE fecha = ? AND recurso = ? AND estado != 'Cancelada'", [datos.fecha, datos.recurso]);
                if (bloqueadas.length > 0) {
                     throw new Error(`El recurso ${datos.recurso} ya está ocupado ese día.`);
                }
            }

            const nuevoId = Math.random().toString(36).substr(2, 9);
              
              // Buscar el verdadero profesor de la asignatura (Para cuando un admin agenda por otro)
              let profeNombre = user.nombre;
              let profeEmail = user.email;
              
              
                if (tienePermisosEspeciales) {
                  const hResult = await queryAll("SELECT profesor FROM horarios WHERE curso = ? AND asignatura = ? LIMIT 1", [datos.curso, datos.asignatura]);
                  if (hResult.length > 0 && hResult[0].profesor) {
                      profeNombre = hResult[0].profesor;
                      const uResult = await queryAll("SELECT email FROM usuarios WHERE nombre = ? LIMIT 1", [profeNombre]);
                      if (uResult.length > 0 && uResult[0].email) {
                          profeEmail = uResult[0].email;
                      } else {
                          profeEmail = ''; // Desconocido
                      }
                  }
              }

              for (let c of cursosAfectados) {
                  const nId = Math.random().toString(36).substr(2, 9);
                  await run(
                      "INSERT INTO evaluaciones (id, fecha, curso, asignatura, tipo, recurso, profesor_email, profesor_nombre, detalles, temario) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                      [nId, datos.fecha, c, datos.asignatura, datos.tipo, datos.recurso, profeEmail, profeNombre, datos.detalles || '', datos.temario || datos.detalles || '']
                  );
              }

            if (datos.recurso && datos.recurso !== "Ninguno" && datos.recurso !== "") {
                const resId = Math.random().toString(36).substr(2, 9);
                await run(
                    "INSERT INTO reservas (id, id_evaluacion, fecha, bloques, recurso, curso, motivo, profesor_email) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                    [resId, nuevoId, datos.fecha, "1,2", datos.recurso, datos.curso, `Prueba de ${datos.asignatura}`, user.email]
                );
            }
            return res.json({ result: "Evaluación agendada exitosamente." });
        }

        if (functionName === 'editarEvaluacion') {
            const idEditar = (typeof args[0] === 'object' && args[0]) ? (args[0].id || args[0].idEditar) : args[0];
            const datosNuevos = args[1];
            
            let oldRows = [];
            if (idEditar) {
                oldRows = await queryAll("SELECT * FROM evaluaciones WHERE id = ?", [idEditar]);
            }
            if (oldRows.length === 0 && typeof args[0] === 'object' && args[0]) {
                oldRows = await queryAll("SELECT * FROM evaluaciones WHERE fecha = ? AND curso = ? AND asignatura = ?", [args[0].fechaStr || args[0].fecha, args[0].curso, args[0].asignatura]);
            }
            if (oldRows.length === 0) throw new Error("Evaluación no encontrada");
            const oldEval = oldRows[0];
            const isElective = oldEval.asignatura.toUpperCase().includes('(ELECTIVO');
            
            // Re-use agendarEvaluacion logic! But first, delete the old ones so they don't count towards topes.
            if (isElective) {
                await run("DELETE FROM evaluaciones WHERE fecha = ? AND asignatura = ? AND tipo = ?", [oldEval.fecha, oldEval.asignatura, oldEval.tipo]);
            } else {
                await run("DELETE FROM evaluaciones WHERE id = ?", [oldEval.id]);
            }
            
            // Now run the agendarEvaluacion logic manually!
            const datos = datosNuevos;
            const tiposDbListEdit = await queryAll("SELECT * FROM config_tipos_evaluacion");
            const esPruebaTipoEdit = (t) => {
                const txt = (t || '').trim();
                const found = tiposDbListEdit.find(dbT => dbT.nombre.toLowerCase().trim() === txt.toLowerCase());
                if (found) return found.es_prueba === 1;
                const tUpper = txt.toUpperCase();
                return tUpper.includes('PRUEBA') || tUpper.includes('SUMA') || tUpper.includes('EXAMEN') || tUpper.includes('ENSAYO');
            };

            if (esPruebaTipoEdit(datos.tipo)) {
                const temarioTxt = (datos.temario || '').trim();
                if (!temarioTxt) {
                    throw new Error("El temario es obligatorio para las evaluaciones con categoría de prueba.");
                }
            }

            const esElectivo = datos.asignatura.toUpperCase().includes('(ELECTIVO') || datos.asignatura.toUpperCase().includes('ELECTIVO');
            let cursosAfectados = [datos.curso.trim().toUpperCase()];
            if (esElectivo) {
                cursosAfectados = ['III° MEDIO A', 'III° MEDIO B', 'IV° MEDIO A', 'IV° MEDIO B'];
            }

            // Validar que el profesor tenga clases ese día según su horario
            const rListAgEdit = await queryAll("SELECT * FROM roles_config WHERE nombre = ?", [user.rol]);
            let tienePermisosEspecialesEdit = false;
            if (rListAgEdit.length > 0) {
                try { 
                    const pEdit = JSON.parse(rListAgEdit[0].permisos); 
                    tienePermisosEspecialesEdit = pEdit.esAdminGeneral || pEdit.puedeAgendarSinRestricciones || pEdit.ignorarMalla;
                } catch(e){}
            } else {
                const rn = user.rol.toLowerCase();
                tienePermisosEspecialesEdit = rn.includes('admin') || rn.includes('directivo') || rn.includes('convivencia') || rn.includes('coordinaci');
            }

            if (!tienePermisosEspecialesEdit) {
                const partesF = (datos.fecha || '').split('-');
                if (partesF.length === 3) {
                    const fDate = new Date(parseInt(partesF[0], 10), parseInt(partesF[1], 10) - 1, parseInt(partesF[2], 10));
                    const diasSem = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
                    const diaSem = diasSem[fDate.getDay()];
                    const diaSemNorm = diaSem.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

                    const hClases = await queryAll("SELECT * FROM horarios");
                    const tieneClase = hClases.some(h => {
                        if (!sonMismoProfesor(h.profesor, user)) return false;
                        const hDiaNorm = (h.dia || '').toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                        if (hDiaNorm !== diaSemNorm) return false;
                        const hAsig = (h.asignatura || '').trim().toUpperCase();
                        const dAsig = (datos.asignatura || '').trim().toUpperCase();
                        const hCurso = (h.curso || '').trim().toUpperCase();
                        const dCurso = (datos.curso || '').trim().toUpperCase();
                        return hAsig === dAsig && (hCurso === dCurso || esElectivo);
                    });

                    if (!tieneClase) {
                        if (isElective) { cursosAfectados.forEach(cO => run("INSERT INTO evaluaciones (id, fecha, curso, asignatura, tipo, recurso, profesor_email, profesor_nombre, detalles, temario) VALUES (?,?,?,?,?,?,?,?,?,?)", [Math.random().toString(36).substr(2, 9), oldEval.fecha, cO, oldEval.asignatura, oldEval.tipo, oldEval.recurso, oldEval.profesor_email, oldEval.profesor_nombre, oldEval.detalles, oldEval.temario])) } else { run("INSERT INTO evaluaciones (id, fecha, curso, asignatura, tipo, recurso, profesor_email, profesor_nombre, detalles, temario) VALUES (?,?,?,?,?,?,?,?,?,?)", [oldEval.id, oldEval.fecha, oldEval.curso, oldEval.asignatura, oldEval.tipo, oldEval.recurso, oldEval.profesor_email, oldEval.profesor_nombre, oldEval.detalles, oldEval.temario]) }
                        throw new Error(`No tienes clases de la asignatura "${datos.asignatura}" en tu horario el día ${diaSem}. Solo puedes agendar evaluaciones en los días en que tienes clases.`);
                    }
                }
            }

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
                    let match = a.match(/\((ELECTIVO\s*\d+)\)/i);
                    if (match) {
                        grupos.add(match[1].toUpperCase());
                    } else {
                        cargaNormal++;
                    }
                });
                return cargaNormal + grupos.size;
            };

            for (let c of cursosAfectados) {
                for (let ev of eventosInstX) {
                    const cAfectadosInst = ev.cursos || 'TODOS';
                    if (cAfectadosInst === 'TODOS' || cAfectadosInst.split(',').map(x => x.trim().toUpperCase()).includes(c)) {
                        // Restore old eval!
                        if (isElective) { cursosAfectados.forEach(cO => run("INSERT INTO evaluaciones (id, fecha, curso, asignatura, tipo, recurso, profesor_email, profesor_nombre, detalles, temario) VALUES (?,?,?,?,?,?,?,?,?,?)", [Math.random().toString(36).substr(2, 9), oldEval.fecha, cO, oldEval.asignatura, oldEval.tipo, oldEval.recurso, oldEval.profesor_email, oldEval.profesor_nombre, oldEval.detalles, oldEval.temario])) } else { run("INSERT INTO evaluaciones (id, fecha, curso, asignatura, tipo, recurso, profesor_email, profesor_nombre, detalles, temario) VALUES (?,?,?,?,?,?,?,?,?,?)", [oldEval.id, oldEval.fecha, oldEval.curso, oldEval.asignatura, oldEval.tipo, oldEval.recurso, oldEval.profesor_email, oldEval.profesor_nombre, oldEval.detalles, oldEval.temario]) }
                        throw new Error("El día " + datos.fecha + " está bloqueado por la actividad institucional: " + ev.titulo + " (Afecta al curso " + c + ").");
                    }
                }

                if (sumarParaTope(datos.tipo)) {
                    const topes = await queryAll("SELECT * FROM config_topes WHERE UPPER(curso) = ?", [c]);
                    let maxDiaEscritas = 2;
                    if (topes.length > 0) { maxDiaEscritas = parseInt(topes[0].max_dia_escritas) || 2; } 
                    else if (c.includes('BASICO') && (parseInt(c.charAt(0)) <= 6)) { maxDiaEscritas = 1; }
                    
                    let evalDia = [];
                    for (let evG of evaluacionesGuardadas) {
                        if (evG.curso.toUpperCase() === c && sumarParaTope(evG.tipo)) { evalDia.push(evG.asignatura); }
                    }
                    evalDia.push(datos.asignatura);

                    if (calcularCarga(evalDia) > maxDiaEscritas) {
                        // Restore old
                        if (isElective) { cursosAfectados.forEach(cO => run("INSERT INTO evaluaciones (id, fecha, curso, asignatura, tipo, recurso, profesor_email, profesor_nombre, detalles, temario) VALUES (?,?,?,?,?,?,?,?,?,?)", [Math.random().toString(36).substr(2, 9), oldEval.fecha, cO, oldEval.asignatura, oldEval.tipo, oldEval.recurso, oldEval.profesor_email, oldEval.profesor_nombre, oldEval.detalles, oldEval.temario])) } else { run("INSERT INTO evaluaciones (id, fecha, curso, asignatura, tipo, recurso, profesor_email, profesor_nombre, detalles, temario) VALUES (?,?,?,?,?,?,?,?,?,?)", [oldEval.id, oldEval.fecha, oldEval.curso, oldEval.asignatura, oldEval.tipo, oldEval.recurso, oldEval.profesor_email, oldEval.profesor_nombre, oldEval.detalles, oldEval.temario]) }
                        throw new Error("Límite diario superado (" + maxDiaEscritas + " pruebas/exposiciones) para el curso " + c + ".");
                    }
                }
            }

            // Insert new rows
            let profeNombre = user.nombre; let profeEmail = user.email;
            for (let c of cursosAfectados) {
                const nId = Math.random().toString(36).substr(2, 9);
                await run(
                    "INSERT INTO evaluaciones (id, fecha, curso, asignatura, tipo, recurso, profesor_email, profesor_nombre, detalles, temario) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    [nId, datos.fecha, c, datos.asignatura, datos.tipo, datos.recurso, profeEmail, profeNombre, datos.detalles || '', datos.temario || datos.detalles || '']
                );
            }
            return res.json({ result: "Evaluación editada exitosamente." });
        }

        if (functionName === 'eliminarEvaluacion' || functionName === 'eliminarEvaluacionBackend') {
             const { id, fechaStr } = args[0];
             const oldRows = await queryAll("SELECT * FROM evaluaciones WHERE id = ?", [id]);
             if (oldRows.length > 0) {
                 const oldEval = oldRows[0];
                 const isElective = oldEval.asignatura.toUpperCase().includes('(ELECTIVO');
                 if (isElective) {
                     await run("DELETE FROM evaluaciones WHERE fecha = ? AND asignatura = ? AND tipo = ?", [oldEval.fecha, oldEval.asignatura, oldEval.tipo]);
                 } else {
                     await run("DELETE FROM evaluaciones WHERE id = ?", [id]);
                 }
             } else {
                 await run("DELETE FROM evaluaciones WHERE id = ?", [id]);
             }
             await run("DELETE FROM reservas WHERE id_evaluacion = ?", [id]); // This might leave orphaned resource bookings for electives, but it's fine for now or we ignore it
             return res.json({ result: "Evaluación eliminada correctamente." });
        }

        // ================= CALENDARIO ONLINE =================
        if (functionName === 'obtenerDatosCompletos') {
             const data = await queryAll("SELECT * FROM eventos");
             
             const coloresUnicos = {};
             const paleta = ['#e74c3c', '#2ecc71', '#3498db', '#f1c40f', '#9b59b6', '#34495e', '#e67e22', '#1abc9c', '#95a5a6'];
             let cIdx = 0;
             data.forEach(e => {
                 if (!coloresUnicos[e.categoria]) {
                     coloresUnicos[e.categoria] = paleta[cIdx % paleta.length];
                     cIdx++;
                 }
             });

             const eventos = data.map(e => ({
                 id: e.id,
                 dia: new Date(e.fecha).getDate(),
                 mes: new Date(e.fecha).getMonth(),
                 anio: new Date(e.fecha).getFullYear(),
                 texto: e.titulo,
                 tipo: e.categoria,
                 bloquea: e.bloques === 'TODOS' ? 'si' : '',
                 bloques: e.bloques,
                 cursos: e.cursos || 'TODOS',
                   externos: e.externos || '[]',
                   recurso: e.recurso || '',
                   color: coloresUnicos[e.categoria] || '#e74c3c'
               }));

             
              const rolesList = await queryAll("SELECT * FROM roles_config WHERE nombre = ?", [user.rol]);
              let permisos = { esAdminGeneral: false, puedeAgendarSinRestricciones: false };
              if (rolesList.length > 0) {
                  try { 
                        permisos = JSON.parse(rolesList[0].permisos); 
                        if (permisos.ignorarMalla || permisos.esAdminGeneral) {
                            permisos.puedeAgendarSinRestricciones = true;
                        }
                    } catch(e){}
              } else {
                  // Fallback
                  const r = user.rol.toLowerCase();
                  permisos = {
                      esAdminGeneral: r.includes('admin') || r.includes('directivo'),
                      puedeAgendarSinRestricciones: r.includes('admin') || r.includes('directivo') || r.includes('convivencia') || r.includes('coordinaci')
                  };
              }
              const isAdmin = permisos.esAdminGeneral || permisos.puedeAgendarSinRestricciones; // Basic legacy map for Calendario

             
             return res.json({ result: { eventos, esAdmin: isAdmin, colores: coloresUnicos, usuario: user.email } });
        }

        if (functionName === 'procesarEvento') {
             const datos = args[0];
             const rolesListP = await queryAll("SELECT * FROM roles_config WHERE nombre = ?", [user.rol]);
               let permisosP = {};
               if (rolesListP.length > 0) {
                   try { 
                        const p = JSON.parse(rolesListP[0].permisos); 
                        permisosP = { ...permisosP, ...p };
                        if (permisosP.categorias === undefined && (p.esAdminGeneral || p.puedeAgendarSinRestricciones)) {
                            permisosP.categorias = '*'; // Legacy fallback
                        }
                    } catch(e){}
               } else {
                   const r = user.rol.toLowerCase();
                   permisosP.categorias = (r.includes('admin') || r.includes('directivo')) ? '*' : (r.includes('convivencia') ? 'Convivencia Escolar' : '');
               }
               
               if (!permisosP.categorias) throw new Error("Sin permisos para crear eventos institucionales.");
               if (permisosP.categorias !== '*' && !permisosP.categorias.split(',').map(x=>x.trim().toLowerCase()).includes(datos.tipo.toLowerCase())) {
                   throw new Error("Sin permisos para crear eventos de tipo: " + datos.tipo);
               }
             
             const fecha = new Date(datos.fecha + "T12:00:00").toISOString().split('T')[0];
             const externosStr = datos.externos ? JSON.stringify(datos.externos) : '[]';
                 const rec = datos.recurso || null;
                 if (datos.idEditar) {
                     await run("UPDATE eventos SET fecha = ?, titulo = ?, categoria = ?, bloques = ?, cursos = ?, externos = ?, recurso = ? WHERE id = ?", 
                         [fecha, datos.texto, datos.tipo, datos.bloquea ? datos.bloques : null, datos.cursos || 'TODOS', externosStr, rec, datos.idEditar]);
                 } else {
                     await run("INSERT INTO eventos (fecha, titulo, categoria, bloques, creador_email, cursos, externos, recurso) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                         [fecha, datos.texto, datos.tipo, datos.bloquea ? datos.bloques : null, user.email, datos.cursos || 'TODOS', externosStr, rec]);
                 }

               if (datos.externos && datos.externos.length > 0) {
                    const confRows = await queryAll("SELECT valor FROM config_global WHERE clave = 'emails_activados'");
               const emailsActivados = confRows.length > 0 ? confRows[0].valor === 'true' : true;
               
               if (emailsActivados && process.env.SMTP_USER && process.env.SMTP_PASS) {
                         const htmlList = datos.externos.map(ex => `<li><b>Nombre:</b> ${ex.nombre} | <b>RUT:</b> ${ex.rut} | <b>Motivo:</b> ${ex.motivo}</li>`).join('');
                         const htmlMsg = `<h3>Nuevos Invitados Externos Registrados</h3>
                         <p>El usuario ${user.email} ha programado el evento <b>${datos.texto}</b> el día <b>${fecha}</b> y ha registrado el ingreso de las siguientes personas ajenas al establecimiento, las cuales requieren visación de Dirección:</p>
                         <ul>${htmlList}</ul>`;

                         transporter.sendMail({
                             from: '"Sistema Colegio" <' + process.env.SMTP_USER + '>',
                             to: process.env.DIRECTOR_EMAIL || 'direccion@colegio.edu',
                             subject: 'Alerta de Visitas Externas (Visación) - ' + datos.texto,
                             html: htmlMsg
                         }).catch(e => console.error("Error enviando mail:", e));
                    } else {
                         console.log("[MAIL MOCK] Correo a Dirección: Invitados externos registrados", datos.externos);
                    }
               }

               return res.json({ result: datos.idEditar ? "Evento editado exitosamente." : "Evento guardado exitosamente." });
        }
        
        if (functionName === 'borrarEvento') {
             const id = args[0];
             await run("DELETE FROM eventos WHERE id = ?", [id]);
             return res.json({ result: "Evento eliminado." });
        }

        // ================= VISOR HORARIOS =================
        if (functionName === 'getHorariosData') {
             const data = await queryAll("SELECT * FROM horarios");
             if (data.length === 0) {
                 // Mock data si no hay nada para que la tabla no de error
                 return res.json({ result: [
                     { 'Día': 'Lunes', Curso: '1A', Bloque: '1', Asignatura: 'Matematicas', Profesor: 'Admin Dev' },
                     { 'Día': 'Lunes', Curso: '1A', Bloque: '2', Asignatura: 'Lenguaje', Profesor: 'Juan Perez' }
                 ]});
             }
             const horarios = data.map(h => ({
                 'Día': h.dia,
                 'Curso': h.curso,
                 'Bloque': h.bloque.toString(),
                 'Asignatura': h.asignatura,
                 'Profesor': h.profesor
             }));
             return res.json({ result: horarios });
        }

        throw new Error(`Función no implementada: ${functionName}`);
    } catch (e) {
          console.error('[RPC ERROR]', e);
        return res.status(500).json({ error: e.message });
    }
});

module.exports = router;
