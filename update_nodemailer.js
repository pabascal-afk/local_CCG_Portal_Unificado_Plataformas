const fs = require('fs');
let code = fs.readFileSync('server/index.js', 'utf8');

// 1. Add nodemailer and transport
const imports = `const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

async function enviarCorreoConfirmacion(reserva, profesorEmail) {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log('[MAIL MOCK] Correo de confirmación no enviado porque faltan SMTP_USER o SMTP_PASS en .env. Datos:', reserva);
        return;
    }
    const html = \`
        <h2>Reserva de Recurso Confirmada</h2>
        <p>Hola, tu reserva se ha ingresado exitosamente en el sistema.</p>
        <ul>
            <li><b>Recurso:</b> \${reserva.recurso}</li>
            <li><b>Fecha:</b> \${reserva.fecha}</li>
            <li><b>Bloques:</b> \${reserva.bloques}</li>
            <li><b>Motivo:</b> \${reserva.motivo}</li>
        </ul>
        <p>Gracias por usar la plataforma unificada.</p>
    \`;
    try {
        await transporter.sendMail({
            from: '"Sistema Colegio" <' + process.env.SMTP_USER + '>',
            to: profesorEmail,
            subject: 'Confirmación de Reserva - ' + reserva.recurso,
            html: html
        });
        console.log('Correo enviado a:', profesorEmail);
    } catch(e) {
        console.error('Error enviando correo:', e);
    }
}
`;

code = code.replace("const path = require('path');", "const path = require('path');\n" + imports);

// 2. Call it in app.post('/api/reservas')
const postReservasRegex = /db\.run\("INSERT INTO reservas[\s\S]*?res\.json\(\{ message: 'Reserva guardada exitosamente' \}\);\s*\}\);/;
const postReservasReplacement = `db.run("INSERT INTO reservas (fecha, recurso, bloques, profesor_email, motivo, estado) VALUES (?, ?, ?, ?, ?, 'Confirmada')",
    [fecha, recurso, bloquesStr, profesorEmail, motivo], function(err) {
      if (err) return res.status(500).json({error: err.message});
      
      const reservaObj = { recurso, fecha, bloques: bloquesStr, motivo };
      enviarCorreoConfirmacion(reservaObj, profesorEmail);

      res.json({ message: 'Reserva guardada exitosamente' });
    });`;

code = code.replace(postReservasRegex, postReservasReplacement);

fs.writeFileSync('server/index.js', code, 'utf8');
console.log('Nodemailer integrado en server/index.js');
