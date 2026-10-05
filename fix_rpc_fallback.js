const fs = require('fs');
let code = fs.readFileSync('server/api/rpc.js', 'utf8');

const regex = /try \{ permisosP = JSON\.parse\(rolesListP\[0\]\.permisos\); \} catch\(e\)\{\}/g;
const replacement = `try { 
                        const p = JSON.parse(rolesListP[0].permisos); 
                        permisosP = { ...permisosP, ...p };
                        if (permisosP.categorias === undefined && (p.esAdminGeneral || p.puedeAgendarSinRestricciones)) {
                            permisosP.categorias = '*'; // Legacy fallback
                        }
                    } catch(e){}`;

code = code.replace(regex, replacement);

fs.writeFileSync('server/api/rpc.js', code, 'utf8');
console.log('rpc.js corregido con legacy fallback para categorias');
