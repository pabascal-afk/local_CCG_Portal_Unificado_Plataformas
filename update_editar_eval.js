const fs = require('fs');
let code = fs.readFileSync('server/api/rpc.js', 'utf8');

const regex = /if \(functionName === 'eliminarEvaluacion'\) \{/;
const replacement = `if (functionName === 'editarEvaluacion') {
            const idEditar = args[0];
            const datosNuevos = args[1];
            
            // Buscar profesor real si es admin
            let profeNombre = user.nombre;
            let profeEmail = user.email;
            
            if (user.rol.toLowerCase().includes('admin') || user.rol.toLowerCase().includes('directivo') || user.rol.toLowerCase().includes('convivencia')) {
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

        if (functionName === 'eliminarEvaluacion') {`;

code = code.replace(regex, replacement);

fs.writeFileSync('server/api/rpc.js', code, 'utf8');
console.log('editarEvaluacion implementado');
