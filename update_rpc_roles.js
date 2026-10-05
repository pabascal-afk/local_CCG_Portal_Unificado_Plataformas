const fs = require('fs');
let code = fs.readFileSync('server/api/rpc.js', 'utf8');

// Replace permissions extraction in getConfigFrontend
const configRegex = /const r = user\.rol\.toLowerCase\(\);\s*const isAdmin = r\.includes\('admin'\) \|\| r\.includes\('directivo'\) \|\| r\.includes\('convivencia'\);\s*const permisos = \{\s*esAdminGeneral: r\.includes\('admin'\) \|\| r\.includes\('directivo'\),\s*puedeAgendarSinRestricciones: r\.includes\('admin'\) \|\| r\.includes\('directivo'\) \|\| r\.includes\('convivencia'\) \|\| r\.includes\('coordinaci'\)\s*\};/g;

const configReplacement = `
              const rolesList = await queryAll("SELECT * FROM roles_config WHERE nombre = ?", [user.rol]);
              let permisos = { esAdminGeneral: false, puedeAgendarSinRestricciones: false };
              if (rolesList.length > 0) {
                  try { permisos = JSON.parse(rolesList[0].permisos); } catch(e){}
              } else {
                  // Fallback
                  const r = user.rol.toLowerCase();
                  permisos = {
                      esAdminGeneral: r.includes('admin') || r.includes('directivo'),
                      puedeAgendarSinRestricciones: r.includes('admin') || r.includes('directivo') || r.includes('convivencia') || r.includes('coordinaci')
                  };
              }
              const isAdmin = permisos.esAdminGeneral || permisos.puedeAgendarSinRestricciones; // Basic legacy map for Calendario
`;

code = code.replace(configRegex, configReplacement);

// Fix isAdmin inside procesarEvento!
const procesarRegex = /const isAdmin = user\.rol\.toLowerCase\(\)\.includes\('admin'\) \|\| user\.rol\.toLowerCase\(\)\.includes\('directivo'\);/g;
const procesarReplacement = `const rolesListP = await queryAll("SELECT * FROM roles_config WHERE nombre = ?", [user.rol]);
               let isAdmin = false;
               if (rolesListP.length > 0) {
                   try { const p = JSON.parse(rolesListP[0].permisos); isAdmin = p.esAdminGeneral; } catch(e){}
               } else {
                   isAdmin = user.rol.toLowerCase().includes('admin') || user.rol.toLowerCase().includes('directivo');
               }`;

code = code.replace(procesarRegex, procesarReplacement);

fs.writeFileSync('server/api/rpc.js', code, 'utf8');
console.log('rpc.js lee de roles_config');
