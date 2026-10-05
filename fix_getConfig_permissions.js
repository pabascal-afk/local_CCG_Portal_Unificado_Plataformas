const fs = require('fs');
let code = fs.readFileSync('server/api/rpc.js', 'utf8');

const regex = /try \{ permisos = JSON\.parse\(rolesList\[0\]\.permisos\); \} catch\(e\)\{\}/g;
const replacement = `try { 
                        permisos = JSON.parse(rolesList[0].permisos); 
                        if (permisos.ignorarMalla || permisos.esAdminGeneral) {
                            permisos.puedeAgendarSinRestricciones = true;
                        }
                    } catch(e){}`;

code = code.replace(regex, replacement);

fs.writeFileSync('server/api/rpc.js', code, 'utf8');
console.log('Added fallback to getConfigFrontend permissions in rpc.js');
