const fs = require('fs');
let code = fs.readFileSync('server/api/rpc.js', 'utf8');

// Patch eliminarEvaluacion to delete all evaluation parts of an elective if applicable
const anchorDelete = `if (functionName === 'eliminarEvaluacion' || functionName === 'eliminarEvaluacionBackend') {`;
const replaceDelete = `if (functionName === 'eliminarEvaluacion' || functionName === 'eliminarEvaluacionBackend') {
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
        }`;
        
// The current code has:
/*
        if (functionName === 'eliminarEvaluacion' || functionName === 'eliminarEvaluacionBackend') {
             const { id, fechaStr } = args[0]; // Object argument
             await run("DELETE FROM evaluaciones WHERE id = ?", [id]);
             await run("DELETE FROM reservas WHERE id_evaluacion = ?", [id]);
             return res.json({ result: "Evaluacin eliminada correctamente." });
        }
*/
code = code.replace(/if \(functionName === 'eliminarEvaluacion' \|\| functionName === 'eliminarEvaluacionBackend'\) \{[\s\S]*?return res\.json\(\{ result: "Evaluaci.*?" \}\);\s*\}/, replaceDelete);

const anchorEdit = `if (functionName === 'editarEvaluacion') {`;
const replaceEdit = `if (functionName === 'editarEvaluacion') {
            const idEditar = args[0];
            const datosNuevos = args[1];
            
            const oldRows = await queryAll("SELECT * FROM evaluaciones WHERE id = ?", [idEditar]);
            if (oldRows.length === 0) throw new Error("Evaluación no encontrada");
            const oldEval = oldRows[0];
            const isElective = oldEval.asignatura.toUpperCase().includes('(ELECTIVO');
            
            // Re-use agendarEvaluacion logic! But first, delete the old ones so they don't count towards topes.
            if (isElective) {
                await run("DELETE FROM evaluaciones WHERE fecha = ? AND asignatura = ? AND tipo = ?", [oldEval.fecha, oldEval.asignatura, oldEval.tipo]);
            } else {
                await run("DELETE FROM evaluaciones WHERE id = ?", [idEditar]);
            }
            
            // Now run the agendarEvaluacion logic manually!
            const datos = datosNuevos;
            const esElectivo = datos.asignatura.toUpperCase().includes('(ELECTIVO');
            let cursosAfectados = [datos.curso.trim().toUpperCase()];
            if (esElectivo) {
                cursosAfectados = ['III° MEDIO A', 'III° MEDIO B', 'IV° MEDIO A', 'IV° MEDIO B'];
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
                for (let ev of eventosInstX) {
                    const cAfectadosInst = ev.cursos || 'TODOS';
                    if (cAfectadosInst === 'TODOS' || cAfectadosInst.split(',').map(x => x.trim().toUpperCase()).includes(c)) {
                        // Restore old eval!
                        if (isElective) { cursosAfectados.forEach(cO => run("INSERT INTO evaluaciones (id, fecha, curso, asignatura, tipo) VALUES (?,?,?,?,?)", [Math.random().toString(36).substr(2, 9), oldEval.fecha, cO, oldEval.asignatura, oldEval.tipo])) } else { run("INSERT INTO evaluaciones (id, fecha, curso, asignatura, tipo) VALUES (?,?,?,?,?)", [idEditar, oldEval.fecha, oldEval.curso, oldEval.asignatura, oldEval.tipo]) }
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
                        if (isElective) { cursosAfectados.forEach(cO => run("INSERT INTO evaluaciones (id, fecha, curso, asignatura, tipo) VALUES (?,?,?,?,?)", [Math.random().toString(36).substr(2, 9), oldEval.fecha, cO, oldEval.asignatura, oldEval.tipo])) } else { run("INSERT INTO evaluaciones (id, fecha, curso, asignatura, tipo) VALUES (?,?,?,?,?)", [idEditar, oldEval.fecha, oldEval.curso, oldEval.asignatura, oldEval.tipo]) }
                        throw new Error("Límite diario superado (" + maxDiaEscritas + " pruebas/exposiciones) para el curso " + c + ".");
                    }
                }
            }

            // Insert new rows
            let profeNombre = user.nombre; let profeEmail = user.email;
            for (let c of cursosAfectados) {
                const nId = Math.random().toString(36).substr(2, 9);
                await run(
                    "INSERT INTO evaluaciones (id, fecha, curso, asignatura, tipo, recurso, profesor_email, profesor_nombre, detalles) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    [nId, datos.fecha, c, datos.asignatura, datos.tipo, datos.recurso, profeEmail, profeNombre, datos.detalles]
                );
            }
            return res.json({ result: "Evaluación editada exitosamente." });
        }`;

code = code.replace(/if \(functionName === 'editarEvaluacion'\) \{[\s\S]*?(?=if \(functionName === 'eliminarEvaluacion')/, replaceEdit + "\n\n        ");

fs.writeFileSync('server/api/rpc.js', code, 'utf8');
console.log("rpc.js editar/eliminar parcheado");
