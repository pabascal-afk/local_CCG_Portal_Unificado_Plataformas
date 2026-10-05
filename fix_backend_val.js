const fs = require('fs');
let code = fs.readFileSync('server/index.js', 'utf8');

const regex = /app\.post\('\/api\/reservas', \(req, res\) => \{[\s\S]*?\/\/ TODO: Agregar validacin de choque de horarios aqu[\s\S]*?const id = Math\.random\(\)\.toString\(36\)\.substr\(2, 9\);/;

const replacement = `app.post('/api/reservas', (req, res) => {
    const { fecha, bloques, recurso, motivo } = req.body;
    
    db.all("SELECT * FROM reservas WHERE fecha = ? AND recurso = ? AND estado != 'Cancelada'", [fecha, recurso], (err, rows) => {
        if (err) return res.status(500).json({error: err.message});
        
        for (let row of rows) {
            const dbBloques = row.bloques.split(',');
            for (let b of bloques) {
                if (dbBloques.includes(b.toString())) {
                    return res.status(400).json({error: \`El bloque \${b} ya está reservado.\`});
                }
            }
        }
        
        db.all("SELECT * FROM eventos WHERE fecha = ? AND (bloques = 'TODOS' OR bloques IS NOT NULL)", [fecha], (err, evRows) => {
            if (err) return res.status(500).json({error: err.message});
            
            for (let ev of evRows) {
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
            
            const id = Math.random().toString(36).substr(2, 9);`;

code = code.replace(regex, replacement);

// Also need to close the nested callbacks correctly...
const tailRegex = /res\.json\(\{ message: 'Reserva guardada', id \}\);\s*\}\);\s*\}\);/
const tailReplacement = `res.json({ message: 'Reserva guardada', id });
        });
        }); // close evRows
    }); // close rows
});`;

code = code.replace(tailRegex, tailReplacement);

fs.writeFileSync('server/index.js', code, 'utf8');
console.log('Backend validation added to /api/reservas');
