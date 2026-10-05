const fs = require('fs');
let code = fs.readFileSync('server/index.js', 'utf8');

const regex = /db\.all\("SELECT \* FROM eventos WHERE fecha = \? AND \(bloques = 'TODOS' OR bloques IS NOT NULL\)", \[fecha\], \(err, evRows\) => \{[\s\S]*?const id = Math.random\(\)/;
const replacement = `db.all("SELECT * FROM eventos WHERE fecha = ? AND (bloques = 'TODOS' OR bloques IS NOT NULL)", [fecha], (err, evRows) => {
            if (err) return res.status(500).json({error: err.message});
            
            for (let ev of evRows) {
                // Si el evento tiene recurso asignado y no es el que estamos pidiendo, no bloquea
                if (ev.recurso && ev.recurso !== recurso) continue;

                if (ev.bloques === 'TODOS' || ev.bloques === '') {
                     return res.status(400).json({error: \`Día bloqueado por evento institucional: \${ev.titulo}\`});
                }
                const evB = ev.bloques.split(',');
                for (let b of bloques) {
                    if (evB.includes(b.toString())) {
                        return res.status(400).json({error: \`El bloque \${b} está bloqueado por el evento: \${ev.titulo}\`});
                    }
                }
            }
            
            const id = Math.random()`;

code = code.replace(regex, replacement);
fs.writeFileSync('server/index.js', code, 'utf8');
console.log('index.js updated');
