const fs = require('fs');
let code = fs.readFileSync('server/api/rpc.js', 'utf8');

const regex = /const r = user\.rol\.toLowerCase\(\);\s*const isAdmin = r\.includes\('admin'\) \|\| r\.includes\('directivo'\) \|\| r\.includes\('convivencia'\);\s*return res\.json\(\{ result: \{ eventos, esAdmin: isAdmin, colores: coloresUnicos, usuario: user\.email \} \}\);/g;

const replacement = `const rolesListOB = await queryAll("SELECT * FROM roles_config WHERE nombre = ?", [user.rol]);
               let permisosOB = { categorias: '' };
               if (rolesListOB.length > 0) {
                   try { permisosOB = JSON.parse(rolesListOB[0].permisos); } catch(e){}
               } else {
                   const r = user.rol.toLowerCase();
                   permisosOB.categorias = (r.includes('admin') || r.includes('directivo')) ? '*' : (r.includes('convivencia') ? 'Convivencia Escolar' : '');
               }
               const puedeCrearEventos = permisosOB.categorias && permisosOB.categorias.trim().length > 0;
               return res.json({ result: { eventos, esAdmin: puedeCrearEventos, colores: coloresUnicos, usuario: user.email } });`;

code = code.replace(regex, replacement);
fs.writeFileSync('server/api/rpc.js', code, 'utf8');
console.log('obtenerDatosCompletos actualizado para leer categorias');
