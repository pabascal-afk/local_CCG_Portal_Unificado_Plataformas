const fs = require('fs');
let code = fs.readFileSync('server/api/rpc.js', 'utf8');

const regex = /const nuevoId = Math\.random\(\)\.toString\(36\)\.substr\(2, 9\);\s*await run\(\s*"INSERT INTO evaluaciones \(id, fecha, curso, asignatura, tipo, recurso, profesor_email, profesor_nombre, detalles\) VALUES \(\?, \?, \?, \?, \?, \?, \?, \?, \?\)",\s*\[nuevoId, datos\.fecha, datos\.curso, datos\.asignatura, datos\.tipo, datos\.recurso, user\.email, user\.nombre, datos\.detalles\]\s*\);/;

const replacement = `const nuevoId = Math.random().toString(36).substr(2, 9);
              
              // Buscar el verdadero profesor de la asignatura (Para cuando un admin agenda por otro)
              let profeNombre = user.nombre;
              let profeEmail = user.email;
              
              if (user.rol.toLowerCase().includes('admin') || user.rol.toLowerCase().includes('directivo') || user.rol.toLowerCase().includes('convivencia')) {
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
              );`;

code = code.replace(regex, replacement);

fs.writeFileSync('server/api/rpc.js', code, 'utf8');
console.log('agendarEvaluacion modificado para buscar el profesor real');
