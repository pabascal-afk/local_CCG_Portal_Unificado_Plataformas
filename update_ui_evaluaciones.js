const fs = require('fs');
let html = fs.readFileSync('public/evaluaciones.html', 'utf8');

const regex = /if \(config\.usuario\.rol\.toLowerCase\(\) === 'admin' \|\| config\.usuario\.rol\.toLowerCase\(\) === 'administrador'\) \{/g;
const replacement = `if (config.usuario.permisos && config.usuario.permisos.esAdminGeneral) {`;

html = html.replace(regex, replacement);

const regex2 = /const esAdmin = \(configuracionGlobal\.usuario\.rol\.toLowerCase\(\) === 'admin' \|\| configuracionGlobal\.usuario\.rol\.toLowerCase\(\) === 'administrador'\);/g;
const replacement2 = `const esAdmin = (configuracionGlobal.usuario.permisos && configuracionGlobal.usuario.permisos.esAdminGeneral) || configuracionGlobal.usuario.permisos.puedeAgendarSinRestricciones;`;
html = html.replace(regex2, replacement2);

fs.writeFileSync('public/evaluaciones.html', html, 'utf8');
console.log('UI de Evaluaciones actualizada');
