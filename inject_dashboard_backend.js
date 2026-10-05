const fs = require('fs');
let code = fs.readFileSync('server/index.js', 'utf8');

const dashboardAPI = `
// --- DASHBOARD API ---
app.get('/api/dashboard/me', (req, res) => {
    const userEmail = req.isAuthenticated() ? req.user.email : 'dev@colegio.edu';
    // Mapeo simple: tomamos todo antes del @ o un nombre genérico
    const baseName = userEmail.split('@')[0];

    const data = {
        evaluaciones: [],
        reservas: [],
        eventos: [],
        avisos: []
    };

    // 1. Avisos
    db.all("SELECT * FROM avisos_muro ORDER BY id DESC LIMIT 10", (err, avisos) => {
        if (!err) data.avisos = avisos;
        
        // 2. Reservas
        db.all("SELECT * FROM reservas WHERE estado != 'Cancelada' AND profesor_email = ? AND fecha >= date('now') ORDER BY fecha ASC", [userEmail], (err, reservas) => {
            if (!err) data.reservas = reservas;

            // 3. Evaluaciones (Buscamos coincidencias básicas por nombre)
            db.all("SELECT * FROM horarios WHERE eval1 IS NOT NULL OR eval2 IS NOT NULL OR eval3 IS NOT NULL", (err, evals) => {
                if (!err) {
                    // Filter matching professor (case insensitive basic match)
                    data.evaluaciones = evals.filter(e => e.profesor && e.profesor.toLowerCase().includes(baseName.toLowerCase().replace('.', ' ')));
                }

                res.json(data);
            });
        });
    });
});

app.post('/api/avisos', (req, res) => {
    const { titulo, mensaje, importancia } = req.body;
    const autor = req.isAuthenticated() ? req.user.email : 'Admin';
    db.run("INSERT INTO avisos_muro (titulo, mensaje, autor, importancia) VALUES (?, ?, ?, ?)", [titulo, mensaje, autor, importancia || 'Normal'], function(err) {
        if (err) return res.status(500).json({error: err.message});
        res.json({ message: 'Aviso publicado', id: this.lastID });
    });
});

app.delete('/api/avisos/:id', (req, res) => {
    db.run("DELETE FROM avisos_muro WHERE id = ?", [req.params.id], function(err) {
        if (err) return res.status(500).json({error: err.message});
        res.json({ message: 'Aviso borrado' });
    });
});

app.put('/api/perfil/preferencias', (req, res) => {
    const email = req.isAuthenticated() ? req.user.email : 'dev@colegio.edu';
    const { preferencias } = req.body;
    db.run("UPDATE usuarios SET preferencias_mail = ? WHERE email = ?", [JSON.stringify(preferencias), email], function(err) {
        if (err) return res.status(500).json({error: err.message});
        res.json({ message: 'Preferencias guardadas' });
    });
});

app.get('/api/perfil/preferencias', (req, res) => {
    const email = req.isAuthenticated() ? req.user.email : 'dev@colegio.edu';
    db.get("SELECT preferencias_mail FROM usuarios WHERE email = ?", [email], (err, row) => {
        if (err || !row || !row.preferencias_mail) return res.json({ nueva_reserva: true, edicion_admin: true, nuevo_aviso: false, recordatorio_eval: true });
        try {
            res.json(JSON.parse(row.preferencias_mail));
        } catch(e) {
            res.json({ nueva_reserva: true, edicion_admin: true, nuevo_aviso: false, recordatorio_eval: true });
        }
    });
});
`;

code = code.replace("// Importar rutas de evaluaciones", dashboardAPI + "\n\n// Importar rutas de evaluaciones");

const reservaRegex = /res\.json\(\{ message: 'Reserva guardada', id \}\);\s*\}\);/;
const reservaReplacement = `
        // Chequear preferencias_mail
        db.get("SELECT preferencias_mail FROM usuarios WHERE email = ?", [profesor_email], (err, row) => {
            let mandarEmail = true;
            if (row && row.preferencias_mail) {
                try { mandarEmail = JSON.parse(row.preferencias_mail).nueva_reserva !== false; } catch(e){}
            }
            if (mandarEmail) {
                enviarCorreoConfirmacion({ recurso, fecha, bloques: bloques.join(','), motivo }, profesor_email);
            }
        });
        res.json({ message: 'Reserva guardada', id });
      });
`;
code = code.replace(reservaRegex, reservaReplacement);

fs.writeFileSync('server/index.js', code, 'utf8');
console.log('Endpoints y lógica de email inyectados');
