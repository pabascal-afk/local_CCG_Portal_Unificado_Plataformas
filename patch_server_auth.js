const fs = require('fs');
let code = fs.readFileSync('server/index.js', 'utf8');

const injection = `
app.post('/api/auth/local', (req, res) => {
    // 1. Verify Local Origin
    const ip = req.ip || req.connection.remoteAddress;
    const isLocal = ip === '::1' || ip === '127.0.0.1' || ip.includes('::ffff:127.0.0.1') || 
                    ip.includes('192.168.') || ip.includes('10.');
                    
    if (!isLocal) {
        return res.status(403).json({ error: 'Acceso denegado. Este método solo está permitido dentro de la red local física del colegio.' });
    }
    
    // 2. Validate PIN
    const { email, pin } = req.body;
    if (pin !== (process.env.MASTER_PIN || '1234')) {
        return res.status(401).json({ error: 'PIN de emergencia incorrecto.' });
    }
    
    // 3. Authenticate User
    db.get("SELECT * FROM usuarios WHERE email = ?", [email.toLowerCase()], (err, row) => {
        if (err || !row) return res.status(404).json({ error: 'No se encontró un usuario con ese correo en la base de datos local.' });
        
        req.login(row, (err) => {
            if (err) return res.status(500).json({ error: 'Error interno de sesión.' });
            return res.json({ success: true, redirect: '/' });
        });
    });
});
`;

// Insert after app.get('/api/auth/logout', ...)
const insertRegex = /app\.get\('\/api\/auth\/logout', \(req, res\) => \{[\s\S]*?res\.redirect\('\/login\.html'\);\s*\}\);\s*\}\);/;
// Wait, the previous code in index.js for logout is:
// app.get('/api/auth/logout', (req, res) => {
//    req.logout(() => {
//      res.redirect('/login.html');
//    });
//  });
// Let's replace that exact block and append our injection.
const matchLogout = /app\.get\('\/api\/auth\/logout'[\s\S]*?\}\);/;
code = code.replace(matchLogout, match => match + '\n' + injection);

fs.writeFileSync('server/index.js', code, 'utf8');
console.log('index.js updated');
