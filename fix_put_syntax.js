const fs = require('fs');
let code = fs.readFileSync('server/index.js', 'utf8');

const regex = /app\.put\('\/api\/perfil\/preferencias'[\s\S]*?app\.get\('\/api\/perfil\/preferencias'/;
const replacement = `app.put('/api/perfil/preferencias', (req, res) => {
    const email = req.isAuthenticated() ? req.user.email : 'dev@colegio.edu';
    const { preferencias, pin } = req.body;
    
    db.run("UPDATE usuarios SET preferencias_mail = ? WHERE email = ?", [JSON.stringify(preferencias), email], function(err) {
        if (err) return res.status(500).json({error: err.message});
        
        if (pin !== undefined) {
            db.run("UPDATE usuarios SET pin = ? WHERE email = ?", [pin, email], function(err) {
                if (err) return res.status(500).json({error: err.message});
                res.json({ message: 'Preferencias guardadas' });
            });
        } else {
            res.json({ message: 'Preferencias guardadas' });
        }
    });
});

app.get('/api/perfil/preferencias'`;

code = code.replace(regex, replacement);
fs.writeFileSync('server/index.js', code, 'utf8');
console.log('Fixed syntax in server/index.js');
