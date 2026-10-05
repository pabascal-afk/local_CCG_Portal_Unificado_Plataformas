const fs = require('fs');
let code = fs.readFileSync('server/api/rpc.js', 'utf8');

const regex = /if \(datos\.recurso && datos\.recurso !== "Ninguno" && datos\.recurso !== ""\) \{/;
const replacement = `
            // Validar Bloqueos Institucionales
            const eventosInst = await queryAll("SELECT * FROM eventos WHERE fecha LIKE ? AND bloques IS NOT NULL", [\`%\${datos.fecha}%\`]);
            for (let ev of eventosInst) {
                const cursosAfectados = ev.cursos || 'TODOS';
                if (cursosAfectados === 'TODOS' || cursosAfectados.split(',').map(c => c.trim()).includes(datos.curso)) {
                    throw new Error(\`El día \${datos.fecha} está bloqueado por la actividad institucional: \${ev.titulo}\`);
                }
            }

            if (datos.recurso && datos.recurso !== "Ninguno" && datos.recurso !== "") {`;

code = code.replace(regex, replacement);
fs.writeFileSync('server/api/rpc.js', code, 'utf8');
console.log('Agregada validación de bloqueos en agendarEvaluacion');
