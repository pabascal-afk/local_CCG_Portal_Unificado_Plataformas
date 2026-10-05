const fs = require('fs');
let code = fs.readFileSync('server/api/rpc.js', 'utf8');

const regexConfig = /const isAdmin = user\.rol\.toLowerCase\(\)\.includes\('admin'\) \|\| user\.rol\.toLowerCase\(\)\.includes\('directivo'\) \|\| user\.rol\.toLowerCase\(\)\.includes\('convivencia'\);/g;

const replacementConfig = `const r = user.rol.toLowerCase();
              const isAdmin = r.includes('admin') || r.includes('directivo') || r.includes('convivencia');
              const permisos = {
                  esAdminGeneral: r.includes('admin') || r.includes('directivo'),
                  puedeAgendarSinRestricciones: r.includes('admin') || r.includes('directivo') || r.includes('convivencia') || r.includes('coordinaci')
              };`;

code = code.replace(regexConfig, replacementConfig);

// In getConfigFrontend, return `permisos` inside `usuario`
const regexResult = /usuario: \{ \s*nombre: user\.nombre, \s*rol: user\.rol, \s*email: user\.email \s*\}/;
const replacementResult = `usuario: { 
                    nombre: user.nombre, 
                    rol: user.rol, 
                    email: user.email,
                    permisos: permisos
                }`;
code = code.replace(regexResult, replacementResult);

// Also we need to fix the `isAdmin` boolean used right below in getConfigFrontend for building asigDict
// `if(isAdmin)` should probably be `if(permisos.puedeAgendarSinRestricciones)`
const regexIsAdminDict = /if\(isAdmin\) \{/g;
const replacementIsAdminDict = `if(permisos && permisos.puedeAgendarSinRestricciones) {`;
code = code.replace(regexIsAdminDict, replacementIsAdminDict);


fs.writeFileSync('server/api/rpc.js', code, 'utf8');
console.log('Permisos añadidos a getConfigFrontend');
