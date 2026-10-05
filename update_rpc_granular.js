const fs = require('fs');
let code = fs.readFileSync('server/api/rpc.js', 'utf8');

// 1. getConfigFrontend
const configRegex = /const rolesList = await queryAll\("SELECT \* FROM roles_config WHERE nombre = \?", \[user\.rol\]\);[\s\S]*?const isAdmin = permisos\.esAdminGeneral \|\| permisos\.puedeAgendarSinRestricciones; \/\/ Basic legacy map para Calendario/g;

const configReplacement = `const rolesList = await queryAll("SELECT * FROM roles_config WHERE nombre = ?", [user.rol]);
              let permisos = { 
                  gestionarUsuarios: false, exportarBD: false, apagarSistema: false, 
                  ignorarMalla: false, pedirLaboratorios: false, bloquearRecursos: false, 
                  bloquearDias: false, categorias: '' 
              };
              if (rolesList.length > 0) {
                  try { permisos = { ...permisos, ...JSON.parse(rolesList[0].permisos) }; } catch(e){}
              } else {
                  // Fallback
                  const r = user.rol.toLowerCase();
                  if (r.includes('admin') || r.includes('directivo')) {
                      permisos = { gestionarUsuarios: true, exportarBD: true, apagarSistema: true, ignorarMalla: true, pedirLaboratorios: true, bloquearRecursos: true, bloquearDias: true, categorias: '*' };
                  } else if (r.includes('convivencia') || r.includes('coordinaci')) {
                      permisos.ignorarMalla = true; permisos.pedirLaboratorios = true; permisos.bloquearDias = true;
                      permisos.categorias = r.includes('convivencia') ? 'Convivencia Escolar' : '*';
                  }
              }
              
              // Retro-compatibilidad para el frontend
              permisos.esAdminGeneral = permisos.gestionarUsuarios || permisos.exportarBD || permisos.apagarSistema;
              permisos.puedeAgendarSinRestricciones = permisos.ignorarMalla;
              
              const isAdmin = permisos.categorias && permisos.categorias.length > 0;`;
code = code.replace(configRegex, configReplacement);

// 2. procesarEvento
const procesarRegex = /const rolesListP = await queryAll\("SELECT \* FROM roles_config WHERE nombre = \?", \[user\.rol\]\);[\s\S]*?if \(!isAdmin && datos\.tipo !== 'Convivencia Escolar'\) \{[\s\S]*?throw new Error\("Sin permisos para crear eventos institucionales\."\);\s*\}/;

const procesarReplacement = `const rolesListP = await queryAll("SELECT * FROM roles_config WHERE nombre = ?", [user.rol]);
               let permisosP = { categorias: '' };
               if (rolesListP.length > 0) {
                   try { permisosP = JSON.parse(rolesListP[0].permisos); } catch(e){}
               } else {
                   const r = user.rol.toLowerCase();
                   permisosP.categorias = (r.includes('admin') || r.includes('directivo')) ? '*' : (r.includes('convivencia') ? 'Convivencia Escolar' : '');
               }
               
               if (!permisosP.categorias) throw new Error("Sin permisos para crear eventos institucionales.");
               if (permisosP.categorias !== '*' && !permisosP.categorias.split(',').map(x=>x.trim().toLowerCase()).includes(datos.tipo.toLowerCase())) {
                   throw new Error("Sin permisos para crear eventos de tipo: " + datos.tipo);
               }`;
code = code.replace(procesarRegex, procesarReplacement);

// 3. agendarEvaluacion Labs check
const agendarRegex = /if \(rolNorm === 'profesor'\) \{\s*throw new Error\("Acceso denegado: Solo Coordinación Pedagógica o Directivos pueden solicitar laboratorios\."\);\s*\}/;

const agendarReplacement = `const rolesListAg = await queryAll("SELECT * FROM roles_config WHERE nombre = ?", [user.rol]);
                  let pedirLabs = false;
                  if (rolesListAg.length > 0) {
                      try { pedirLabs = JSON.parse(rolesListAg[0].permisos).pedirLaboratorios; } catch(e){}
                  } else {
                      const r = user.rol.toLowerCase();
                      pedirLabs = r.includes('admin') || r.includes('directivo') || r.includes('coordinaci');
                  }
                  
                  if (!pedirLabs) {
                      throw new Error("Acceso denegado: Tu rol no tiene permisos para solicitar laboratorios u otros recursos físicos al agendar.");
                  }`;
code = code.replace(agendarRegex, agendarReplacement);

fs.writeFileSync('server/api/rpc.js', code, 'utf8');
console.log('rpc.js actualizado con lógica granular');
