const fs = require('fs');
let code = fs.readFileSync('server/api/rpc.js', 'utf8');

// 1. obtenerDatosCompletos (add cursos property to map)
code = code.replace(/bloques: e\.bloques,/, "bloques: e.bloques,\n                 cursos: e.cursos || 'TODOS',");

// 2. procesarEvento (add cursos to insert/update)
const procRegex = /if \(datos\.idEditar\) \{\s*await run\("UPDATE eventos SET fecha = \?, titulo = \?, categoria = \?, bloques = \? WHERE id = \?",\s*\[fecha, datos\.texto, datos\.tipo, datos\.bloquea \? datos\.bloques : null, datos\.idEditar\]\);\s*return res\.json\(\{ result: "Evento editado exitosamente\." \}\);\s*\} else \{\s*await run\("INSERT INTO eventos \(fecha, titulo, categoria, bloques, creador_email\) VALUES \(\?, \?, \?, \?, \?\)",\s*\[fecha, datos\.texto, datos\.tipo, datos\.bloquea \? datos\.bloques : null, user\.email\]\);\s*return res\.json\(\{ result: "Evento guardado exitosamente\." \}\);\s*\}/;

const procReplace = `if (datos.idEditar) {
                 await run("UPDATE eventos SET fecha = ?, titulo = ?, categoria = ?, bloques = ?, cursos = ? WHERE id = ?", 
                     [fecha, datos.texto, datos.tipo, datos.bloquea ? datos.bloques : null, datos.cursos || 'TODOS', datos.idEditar]);
                 return res.json({ result: "Evento editado exitosamente." });
             } else {
                 await run("INSERT INTO eventos (fecha, titulo, categoria, bloques, creador_email, cursos) VALUES (?, ?, ?, ?, ?, ?)",
                     [fecha, datos.texto, datos.tipo, datos.bloquea ? datos.bloques : null, user.email, datos.cursos || 'TODOS']);
                 return res.json({ result: "Evento guardado exitosamente." });
             }`;
code = code.replace(procRegex, procReplace);

// 3. getEventosCalendario (generate multiple bloqueos if Cursos != TODOS)
const evtRegex = /if \(functionName === 'getEventosCalendario'\) \{[\s\S]*?return res\.json\(\{ result: eventos \}\);\n        \}/;

const evtReplace = `if (functionName === 'getEventosCalendario') {
            const evaluaciones = await queryAll("SELECT * FROM evaluaciones");
            const eventos = evaluaciones.map(e => ({
                id: e.id,
                title: \`\${e.asignatura} - \${e.curso} (\${e.tipo})\`,
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
                   fechaFormateada = \`\${parts[2]}-\${parts[0].padStart(2,'0')}-\${parts[1].padStart(2,'0')}\`;
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
        }`;

code = code.replace(evtRegex, evtReplace);

fs.writeFileSync('server/api/rpc.js', code, 'utf8');
console.log('RPC modificado para Cursos Afectados');
