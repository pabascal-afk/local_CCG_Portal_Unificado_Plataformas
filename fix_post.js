const fs = require('fs');
let code = fs.readFileSync('server/index.js', 'utf8');

// Find start and end of app.post('/api/reservas')
const startIndex = code.indexOf("app.post('/api/reservas'");
const nextRoute = code.indexOf("app.delete('/api/reservas/:id'");

const replacement = `app.post('/api/reservas', (req, res) => {
    const { fecha, bloques, recurso, motivo } = req.body;
    const profesor_email = req.isAuthenticated() ? req.user.email : 'dev@colegio.edu';
    
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
            
            const id = Math.random().toString(36).substr(2, 9);
            db.run("INSERT INTO reservas (id, fecha, bloques, recurso, motivo, profesor_email) VALUES (?, ?, ?, ?, ?, ?)", 
              [id, fecha, bloques.join(','), recurso, motivo, profesor_email], function(err) {
              if (err) return res.status(500).json({error: err.message});
              
                  // Chequear preferencias_mail
                  db.get("SELECT preferencias_mail FROM usuarios WHERE email = ?", [profesor_email], (err, row) => {
                      let mandarEmail = true;
                      if (row && row.preferencias_mail) {
                          try { mandarEmail = JSON.parse(row.preferencias_mail).nueva_reserva !== false; } catch(e){}
                      }
                      if (mandarEmail) {
                          // enviarCorreoConfirmacion({ recurso, fecha, bloques: bloques.join(','), motivo }, profesor_email);
                      }
                  });
                  res.json({ message: 'Reserva guardada', id });
            });
        });
    });
});

`;

code = code.substring(0, startIndex) + replacement + code.substring(nextRoute);
fs.writeFileSync('server/index.js', code, 'utf8');
console.log('Replaced whole app.post');
