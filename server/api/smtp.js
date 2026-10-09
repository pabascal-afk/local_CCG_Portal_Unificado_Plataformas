const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const envPath = path.join(__dirname, '../../.env');

function getEnvVars() {
    if (!fs.existsSync(envPath)) return {};
    const content = fs.readFileSync(envPath, 'utf8');
    const vars = {};
    content.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            vars[parts[0].trim()] = parts.slice(1).join('=').trim();
        }
    });
    return vars;
}

function updateEnvVar(key, value) {
    let content = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (regex.test(content)) {
        content = content.replace(regex, `${key}=${value}`);
    } else {
        content += `\n${key}=${value}`;
    }
    fs.writeFileSync(envPath, content.trim() + '\n', 'utf8');
    process.env[key] = value; // Update running process
}

// Get current SMTP config (mask password)
router.get('/', (req, res) => {
    const env = getEnvVars();
    res.json({
        host: env.SMTP_HOST || 'smtp.gmail.com',
        port: env.SMTP_PORT || '465',
        secure: env.SMTP_SECURE === 'true',
        user: env.SMTP_USER || '',
        hasPassword: !!env.SMTP_PASS
    });
});

// Save SMTP config
router.post('/', (req, res) => {
    const { host, port, secure, user, pass } = req.body;
    updateEnvVar('SMTP_HOST', host);
    updateEnvVar('SMTP_PORT', port);
    updateEnvVar('SMTP_SECURE', secure);
    updateEnvVar('SMTP_USER', user);
    if (pass) {
        updateEnvVar('SMTP_PASS', pass);
    }
    res.json({ success: true, message: 'Configuración guardada' });
});

// Test SMTP Connection
router.post('/test', async (req, res) => {
    const { host, port, secure, user, pass } = req.body;
    const testPass = pass || process.env.SMTP_PASS; // Use existing if not changed

    const transporter = nodemailer.createTransport({
        host: host,
        port: parseInt(port),
        secure: secure === true || secure === 'true',
        auth: { user: user, pass: testPass },
    tls: { rejectUnauthorized: false }
    });

    try {
        await transporter.verify();
        
        // Optional: send a test email
        await transporter.sendMail({
            from: `"Test Sistema" <${user}>`,
            to: user,
            subject: 'Prueba de Servidor de Correos',
            html: '<p>Esta es una prueba generada automáticamente. El servidor SMTP está correctamente configurado.</p>'
        });
        
        res.json({ success: true, message: 'Conexión exitosa y correo de prueba enviado.' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
