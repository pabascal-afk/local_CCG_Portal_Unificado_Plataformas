const fs = require('fs');
let code = fs.readFileSync('server/api/rpc.js', 'utf8');

// Ensure nodemailer is available
if (!code.includes("require('nodemailer')")) {
    code = code.replace("const sqlite3 = require('sqlite3').verbose();", "const sqlite3 = require('sqlite3').verbose();\nconst nodemailer = require('nodemailer');");
    code = code.replace("const path = require('path');", "const path = require('path');\nconst transporter = nodemailer.createTransport({service: 'gmail', auth: {user: process.env.SMTP_USER, pass: process.env.SMTP_PASS}});");
}

const updateRegex = /if \(datos\.idEditar\) \{[\s\S]*?return res\.json\(\{ result: "Evento guardado exitosamente\." \}\);\s*\}/;

const updateReplacement = `const externosStr = datos.externos ? JSON.stringify(datos.externos) : '[]';
               if (datos.idEditar) {
                   await run("UPDATE eventos SET fecha = ?, titulo = ?, categoria = ?, bloques = ?, cursos = ?, externos = ? WHERE id = ?", 
                       [fecha, datos.texto, datos.tipo, datos.bloquea ? datos.bloques : null, datos.cursos || 'TODOS', externosStr, datos.idEditar]);
               } else {
                   await run("INSERT INTO eventos (fecha, titulo, categoria, bloques, creador_email, cursos, externos) VALUES (?, ?, ?, ?, ?, ?, ?)",
                       [fecha, datos.texto, datos.tipo, datos.bloquea ? datos.bloques : null, user.email, datos.cursos || 'TODOS', externosStr]);
               }

               if (datos.externos && datos.externos.length > 0) {
                    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
                         const htmlList = datos.externos.map(ex => \`<li><b>Nombre:</b> \${ex.nombre} | <b>RUT:</b> \${ex.rut} | <b>Motivo:</b> \${ex.motivo}</li>\`).join('');
                         const htmlMsg = \`<h3>Nuevos Invitados Externos Registrados</h3>
                         <p>El usuario \${user.email} ha programado el evento <b>\${datos.texto}</b> el día <b>\${fecha}</b> y ha registrado el ingreso de las siguientes personas ajenas al establecimiento, las cuales requieren visación de Dirección:</p>
                         <ul>\${htmlList}</ul>\`;

                         transporter.sendMail({
                             from: '"Sistema Colegio" <' + process.env.SMTP_USER + '>',
                             to: process.env.DIRECTOR_EMAIL || 'direccion@colegio.edu',
                             subject: 'Alerta de Visitas Externas (Visación) - ' + datos.texto,
                             html: htmlMsg
                         }).catch(e => console.error("Error enviando mail:", e));
                    } else {
                         console.log("[MAIL MOCK] Correo a Dirección: Invitados externos registrados", datos.externos);
                    }
               }

               return res.json({ result: datos.idEditar ? "Evento editado exitosamente." : "Evento guardado exitosamente." });`;

code = code.replace(updateRegex, updateReplacement);

fs.writeFileSync('server/api/rpc.js', code, 'utf8');
console.log('rpc.js actualizado con lógica de invitados externos');
