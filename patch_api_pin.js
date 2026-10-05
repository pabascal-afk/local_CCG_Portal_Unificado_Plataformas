const fs = require('fs');
let code = fs.readFileSync('server/index.js', 'utf8');

const regexPut = /app\.put\('\/api\/perfil\/preferencias', \(req, res\) => \{[\s\S]*?db\.run\("UPDATE usuarios SET preferencias_mail = \? WHERE email = \?", \[JSON\.stringify\(preferencias\), email\], function\(err\) \{/;
const replacePut = `app.put('/api/perfil/preferencias', (req, res) => {
    const email = req.isAuthenticated() ? req.user.email : 'dev@colegio.edu';
    const { preferencias, pin } = req.body;
    
    // First update the JSON
    db.run("UPDATE usuarios SET preferencias_mail = ? WHERE email = ?", [JSON.stringify(preferencias), email], function(err) {
        if (err) return res.status(500).json({error: err.message});
        
        // Then optionally update the pin if provided
        if (pin !== undefined) {
            db.run("UPDATE usuarios SET pin = ? WHERE email = ?", [pin, email], function(err) {
                if (err) return res.status(500).json({error: err.message});
                res.json({ message: 'Preferencias guardadas' });
            });
        } else {
            res.json({ message: 'Preferencias guardadas' });
        }
    });`;
code = code.replace(regexPut, replacePut);

const regexGet = /db\.get\("SELECT preferencias_mail FROM usuarios WHERE email = \?", \[email\], \(err, row\) => \{/;
const replaceGet = `db.get("SELECT preferencias_mail, pin FROM usuarios WHERE email = ?", [email], (err, row) => {`;
code = code.replace(regexGet, replaceGet);

const regexGetResp = /res\.json\(JSON\.parse\(row\.preferencias_mail\)\);/;
const replaceGetResp = `
            const p = JSON.parse(row.preferencias_mail);
            p.pin_actual = row.pin || '';
            res.json(p);`;
code = code.replace(regexGetResp, replaceGetResp);

fs.writeFileSync('server/index.js', code, 'utf8');
console.log('preferencias api updated with pin');
