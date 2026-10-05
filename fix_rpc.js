const fs = require('fs');
let code = fs.readFileSync('server/api/rpc.js', 'utf8');

const regex = /if \(functionName === 'getConfigFrontend'\) \{[\s\S]*?return res\.json\(\{ result \}\);\n        \}/;

const replacement = `if (functionName === 'getConfigFrontend') {
            const result = {
                usuario: { 
                    nombre: user.nombre || 'Admin Dev', 
                    rol: user.rol, 
                    email: user.email 
                },
                sistemaAbierto: true,
                profesoresBloqueados: [],
                cursos: ["1A", "1B", "2A", "2B", "3A", "3B", "4A", "4B"],
                asignaturasDict: {
                    "1A": { "Lunes": ["Matemáticas"], "Martes": ["Lenguaje"] },
                    "1B": { "Lunes": ["Historia"], "Martes": ["Ciencias"] }
                },
                filtrosGlobales: {
                    cursos: ["1A", "1B", "2A", "2B", "3A", "3B", "4A", "4B"],
                    asignaturas: ["Matemáticas", "Lenguaje", "Historia", "Ciencias"],
                    profesores: ["Admin Dev", "Juan Perez", "Maria Gomez"]
                }
            };
            return res.json({ result });
        }`;

code = code.replace(regex, replacement);
fs.writeFileSync('server/api/rpc.js', code, 'utf8');
console.log('getConfigFrontend fix aplicado.');
