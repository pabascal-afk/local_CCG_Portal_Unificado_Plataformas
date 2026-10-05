const fs = require('fs');
let code = fs.readFileSync('server/api/rpc.js', 'utf8');

const regex1 = /if \(user\.rol\.toLowerCase\(\)\.includes\('admin'\) \|\| user\.rol\.toLowerCase\(\)\.includes\('directivo'\) \|\| user\.rol\.toLowerCase\(\)\.includes\('convivencia'\)\) \{/g;
const replacement1 = `
                // Usar rolesListAg para obtener permisos frescos
                const rListAg2 = await queryAll("SELECT * FROM roles_config WHERE nombre = ?", [user.rol]);
                let tienePermisosEspeciales = false;
                if (rListAg2.length > 0) {
                    try { 
                        const p2 = JSON.parse(rListAg2[0].permisos); 
                        tienePermisosEspeciales = p2.esAdminGeneral || p2.puedeAgendarSinRestricciones || p2.ignorarMalla;
                    } catch(e){}
                } else {
                    const rn = user.rol.toLowerCase();
                    tienePermisosEspeciales = rn.includes('admin') || rn.includes('directivo') || rn.includes('convivencia') || rn.includes('coordinaci');
                }
                if (tienePermisosEspeciales) {`;

code = code.replace(regex1, replacement1);

fs.writeFileSync('server/api/rpc.js', code, 'utf8');
console.log('Fixed admin lookup mapping in rpc.js');
