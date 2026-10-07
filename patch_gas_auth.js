const fs = require('fs');
let code = fs.readFileSync('server/index.js', 'utf8');

const injection = `
const crypto = require('crypto');
app.get('/api/auth/gas', (req, res) => {
    const { email, timestamp, sig } = req.query;
    if (!email || !timestamp || !sig) return res.status(400).send("Faltan parámetros de seguridad");
    
    // Evitar ataques de repetición (Replay Attacks) - El link caduca en 5 minutos
    const now = Date.now();
    if (now - parseInt(timestamp) > 5 * 60 * 1000) {
        return res.status(401).send("El link de autenticación ha expirado por seguridad.");
    }
    
    // Verificar que la firma provenga de tu Apps Script
    const data = email + "|" + timestamp;
    const GAS_SECRET = process.env.GAS_SECRET || 'tu_clave_super_secreta_123';
    const expectedSig = crypto.createHmac('sha256', GAS_SECRET).update(data).digest('hex');
                              
    if (sig !== expectedSig) {
        return res.status(401).send("Firma digital inválida (Posible falsificación detectada)");
    }
    
    // Autenticar al usuario
    db.get("SELECT * FROM usuarios WHERE email = ?", [email.toLowerCase()], (err, row) => {
        if (err || !row) return res.status(404).send("El correo de Google es válido, pero el usuario no está registrado en la base de datos del colegio.");
        
        req.login(row, (err) => {
            if (err) return res.status(500).send("Error interno al crear la sesión");
            res.redirect('/');
        });
    });
});
`;

const matchRoute = /app\.post\('\/api\/auth\/local'[\s\S]*?\}\);/;
code = code.replace(matchRoute, match => match + '\n' + injection);
fs.writeFileSync('server/index.js', code, 'utf8');
