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
            const asigSet = new Set();
            const profSet = new Set();
            
            const asigDict = {};
            
            allHorarios.forEach(h => {
                if(h.curso) cursosSet.add(h.curso.trim());
                if(h.asignatura) asigSet.add(h.asignatura.trim());
                if(h.profesor) profSet.add(h.profesor.trim());
                
                const c = h.curso ? h.curso.trim() : '';
                const a = h.asignatura ? h.asignatura.trim() : '';
                const d = h.dia ? h.dia.trim().toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : '';
                
                if(!asigDict[c]) asigDict[c] = {};
                
                // Si es admin, puede elegir cualquier asignatura cualquier da, as que guardamos todas en "TODAS"
                if(permisos && permisos.puedeAgendarSinRestricciones) {
                   const dias = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'];
                   dias.forEach(diaNormal => {
                       if(!asigDict[c][diaNormal]) asigDict[c][diaNormal] = new Set();
                       if(a) asigDict[c][diaNormal].add(a);
                   });
                } else {
                   // Solo los del profe actual
                   if(h.profesor && h.profesor.trim().toLowerCase() === user.nombre.toLowerCase()) {
                       if(!asigDict[c][d]) asigDict[c][d] = new Set();
                       if(a) asigDict[c][d].add(a);
                   }
                }
            });

            // Convert Sets to Arrays
            const finalDict = {};
            for(let cur in asigDict) {
                finalDict[cur] = {};
                for(let dia in asigDict[cur]) {
                    finalDict[cur][dia] = Array.from(asigDict[cur][dia]);
                }
            }

            const result = {
                usuario: { 
                    nombre: user.nombre, 
                    rol: user.rol, 
                    email: user.email,
                    permisos: permisos
                },
                sistemaAbierto: true,
                profesoresBloqueados: [],
                cursos: Array.from(cursosSet).sort(),
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
            const eventos = evaluaciones.map(e => ({
                id: e.id,
                title: `${e.asignatura} - ${e.curso} (${e.tipo})`,
                start: e.fecha,
                extendedProps: {
                    curso: e.curso,
                    asignatura: e.asignatura,
                    tipo: e.tipo,
                    recurso: e.recurso,
                    detalles: e.detalles,
                    profesor: e.profesor_nombre || e.profesor_email,
                    email: e.profesor_email,
                    esBloqueo: e.tipo && e.tipo.includes('BLOQUEO')
                },
                color: (() => {
                    if (e.tipo && e.tipo.includes('BLOQUEO')) return '#dc3545';
                    if (!e.asignatura) return '#3788d8';
                    let hash = 0;
                    const nombre = e.asignatura.toUpperCase();
                    for (let i = 0; i < nombre.length; i++) {
                        hash = nombre.charCodeAt(i) + ((hash << 5) - hash);
                    }
                    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
                    return '#' + '00000'.substring(0, 6 - c.length) + c;
                })()
            }));

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
            
            
            // Validar Bloqueos Institucionales
            const eventosInst = await queryAll("SELECT * FROM eventos WHERE fecha LIKE ? AND bloques IS NOT NULL", [`%${datos.fecha}%`]);
            for (let ev of eventosInst) {
                const cursosAfectados = ev.cursos || 'TODOS';
                if (cursosAfectados === 'TODOS' || cursosAfectados.split(',').map(c => c.trim()).includes(datos.curso)) {
                    throw new Error(`El día ${datos.fecha} está bloqueado por la actividad institucional: ${ev.titulo}`);
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
              
              
                // Usar rolesListAg para obtener permisos frescos
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

              await run(
                  "INSERT INTO evaluaciones (id, fecha, curso, asignatura, tipo, recurso, profesor_email, profesor_nombre, detalles) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                  [nuevoId, datos.fecha, datos.curso, datos.asignatura, datos.tipo, datos.recurso, profeEmail, profeNombre, datos.detalles]
              );

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
            const idEditar = args[0];
            const datosNuevos = args[1];
            
            // Buscar profesor real si es admin
            let profeNombre = user.nombre;
            let profeEmail = user.email;
            
            
                // Usar rolesListAg para obtener permisos frescos
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
                if (tienePermisosEspeciales) {
                const hResult = await queryAll("SELECT profesor FROM horarios WHERE curso = ? AND asignatura = ? LIMIT 1", [datosNuevos.curso, datosNuevos.asignatura]);
                if (hResult.length > 0 && hResult[0].profesor) {
                    profeNombre = hResult[0].profesor;
                    const uResult = await queryAll("SELECT email FROM usuarios WHERE nombre = ? LIMIT 1", [profeNombre]);
                    if (uResult.length > 0 && uResult[0].email) {
                        profeEmail = uResult[0].email;
                    }
                }
            }

            // Actualizar Evaluacion
            await run(
                "UPDATE evaluaciones SET fecha = ?, curso = ?, asignatura = ?, tipo = ?, recurso = ?, detalles = ?, profesor_nombre = ?, profesor_email = ? WHERE id = ?",
                [datosNuevos.fecha, datosNuevos.curso, datosNuevos.asignatura, datosNuevos.tipo, datosNuevos.recurso, datosNuevos.detalles, profeNombre, profeEmail, idEditar]
            );

            // Eliminar reservas viejas si habia, y crear la nueva
            await run("DELETE FROM reservas WHERE id_evaluacion = ?", [idEditar]);
            if (datosNuevos.recurso && datosNuevos.recurso !== "Ninguno" && datosNuevos.recurso !== "") {
                 const bloques = datosNuevos.fecha.includes("Lunes") || datosNuevos.fecha.includes("Miércoles") ? "1, 2" : "3, 4";
                 await run(
                      "INSERT INTO reservas (fecha, recurso, bloques, profesor_email, motivo, id_evaluacion) VALUES (?, ?, ?, ?, ?, ?)",
                      [datosNuevos.fecha, datosNuevos.recurso, bloques, profeEmail, "Evaluación de " + datosNuevos.asignatura, idEditar]
                 );
            }

            return res.json({ result: "Evaluación actualizada correctamente." });
        }

        if (functionName === 'eliminarEvaluacion' || functionName === 'eliminarEvaluacionBackend') {
             const { id, fechaStr } = args[0]; // Object argument
             await run("DELETE FROM evaluaciones WHERE id = ?", [id]);
             await run("DELETE FROM reservas WHERE id_evaluacion = ?", [id]);
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
