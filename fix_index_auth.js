const fs = require('fs');
let code = fs.readFileSync('server/index.js', 'utf8');

// The mangled block starts with app.post('/api/auth/local' and ends somewhere below.
// Let's just surgically replace the whole section from app.post('/api/auth/local' up to the trailing `// ==========================================`

const startIdx = code.indexOf("app.post('/api/auth/local'");
const endIdx = code.indexOf("// ==========================================", startIdx);

const cleanBlock = `
app.post('/api/auth/local', (req, res) => {
    // 1. Verify Local Origin
    const ip = req.ip || req.connection.remoteAddress;
    const isLocal = ip === '::1' || ip === '127.0.0.1' || ip.includes('::ffff:127.0.0.1') || 
                    ip.includes('192.168.') || ip.includes('10.');
                    
    if (!isLocal) {
        return res.status(403).json({ error: 'Acceso denegado. Este método solo está permitido dentro de la red local física del colegio.' });
    }
    
    // 2. Validate and Authenticate User
    const { email, pin } = req.body;
    db.get("SELECT * FROM usuarios WHERE email = ?", [email.toLowerCase()], (err, row) => {
        if (err || !row) return res.status(404).json({ error: 'No se encontró un usuario con ese correo en la base de datos local.' });
        
        if (!row.pin) {
            return res.status(401).json({ error: 'Este usuario no tiene un PIN configurado. Ingresa primero con Google para configurarlo.' });
        }
        
        if (row.pin !== pin) {
            return res.status(401).json({ error: 'PIN local incorrecto.' });
        }
        
        req.login(row, (err) => {
            if (err) return res.status(500).json({ error: 'Error interno de sesión.' });
            return res.json({ success: true, redirect: '/' });
        });
    });
});

const crypto = require('crypto');

app.get('/api/auth/gas-url', (req, res) => {
    res.json({ url: process.env.GAS_WEB_APP_URL || '' });
});

app.get('/api/auth/gas', (req, res) => {
    const { email, timestamp, sig } = req.query;
    if (!email || !timestamp || !sig) return res.status(400).send("Faltan parámetros de seguridad");
    
    const now = Date.now();
    if (now - parseInt(timestamp) > 5 * 60 * 1000) {
        return res.status(401).send("El link de autenticación ha expirado por seguridad.");
    }
    
    const data = email + "|" + timestamp;
    const GAS_SECRET = process.env.GAS_SECRET || 'tu_clave_super_secreta_123';
    const expectedSig = crypto.createHmac('sha256', GAS_SECRET).update(data).digest('hex');
                              
    if (sig !== expectedSig) {
        return res.status(401).send("Firma digital inválida (Posible falsificación detectada)");
    }
    
    db.get("SELECT * FROM usuarios WHERE email = ?", [email.toLowerCase()], (err, row) => {
        if (err || !row) return res.status(404).send("El correo de Google es válido, pero el usuario no está registrado en la base de datos del colegio.");
        
        req.login(row, (err) => {
            if (err) return res.status(500).send("Error interno al crear la sesión");
            res.redirect('/');
        });
    });
});

`;

code = code.substring(0, startIdx) + cleanBlock + "\n\n" + code.substring(endIdx);
fs.writeFileSync('server/index.js', code, 'utf8');
