const fs = require('fs');
let html = fs.readFileSync('public/evaluaciones.html', 'utf8');

const regex = /if \(configuracionGlobal\.usuario\.rol\.toLowerCase\(\) !== 'admin' && configuracionGlobal\.usuario\.rol\.toLowerCase\(\) !== 'administrador'\) \{/g;
const replacement = `const userEsAdmin = (configuracionGlobal.usuario.permisos && (configuracionGlobal.usuario.permisos.esAdminGeneral || configuracionGlobal.usuario.permisos.puedeAgendarSinRestricciones));
        if (!userEsAdmin) {`;

html = html.replace(regex, replacement);

fs.writeFileSync('public/evaluaciones.html', html, 'utf8');
console.log('Fixed admin role string match in evaluaciones.html');
