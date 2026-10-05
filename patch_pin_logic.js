const fs = require('fs');
let code = fs.readFileSync('server/index.js', 'utf8');

// Replace the PIN validation logic
const oldLogic = `// 2. Validate PIN
    const { email, pin } = req.body;
    if (pin !== (process.env.MASTER_PIN || '1234')) {
        return res.status(401).json({ error: 'PIN de emergencia incorrecto.' });
    }
    
    // 3. Authenticate User
    db.get("SELECT * FROM usuarios WHERE email = ?", [email.toLowerCase()], (err, row) => {
        if (err || !row) return res.status(404).json({ error: 'No se encontró un usuario con ese correo en la base de datos local.' });`;

const newLogic = `// 2. Validate and Authenticate User
    const { email, pin } = req.body;
    db.get("SELECT * FROM usuarios WHERE email = ?", [email.toLowerCase()], (err, row) => {
        if (err || !row) return res.status(404).json({ error: 'No se encontró un usuario con ese correo en la base de datos local.' });
        
        if (!row.pin) {
            return res.status(401).json({ error: 'Este usuario no tiene un PIN configurado. Ingresa primero con Google para configurarlo.' });
        }
        
        if (row.pin !== pin) {
            return res.status(401).json({ error: 'PIN local incorrecto.' });
        }`;

code = code.replace(oldLogic, newLogic);
fs.writeFileSync('server/index.js', code, 'utf8');
console.log('Local auth updated to use user pin');
