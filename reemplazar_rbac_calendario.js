const fs = require('fs');
let code = fs.readFileSync('Calendario Online/Código.gs.txt', 'utf8');

// The central spreadsheet ID where RBAC is stored
const replacement = `const SPREADSHEET_ID_RBAC = 'TU_SPREADSHEET_ID_AQUI';

function verificarPermisoEvento(categoria) {
  const emailActual = Session.getActiveUser().getEmail().toLowerCase();
  if (!emailActual) throw new Error("Usuario desconocido.");
  
  const ssRBAC = SpreadsheetApp.openById(SPREADSHEET_ID_RBAC);
  const sheetUsuarios = ssRBAC.getSheetByName('Usuarios_Autorizados');
  if (!sheetUsuarios) return false;
  
  const data = sheetUsuarios.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] && data[i][0].toString().trim().toLowerCase() === emailActual) {
      const rol = data[i][1] ? data[i][1].toString().trim().toLowerCase() : 'profesor';
      
      if (rol === 'administrador' || rol === 'directivo general') return true;
      
      if (rol === 'convivencia escolar') {
         if (categoria && categoria.toLowerCase().includes('convivencia')) {
             return true;
         } else {
             throw new Error("Solo tienes permisos para crear eventos de Convivencia Escolar.");
         }
      }
    }
  }
  return false;
}`;

// Replace esAdministrador logic
code = code.replace(/function esAdministrador\(\) \{[\s\S]*?return false;\n  \}\n\}/, replacement);

// Replace its usage in procesarEvento
code = code.replace(/if \(\!esAdministrador\(\)\) throw new Error\(">\" Sin permisos de administrador\."\);/, `if (!verificarPermisoEvento(datos.tipo)) throw new Error("Sin permisos para crear/editar este tipo de evento.");`);

// Replace its usage in borrarEvento
code = code.replace(/if \(\!esAdministrador\(\)\) throw new Error\(">\" Sin permisos\."\);/, `if (!verificarPermisoEvento('general')) throw new Error("Solo directivos pueden borrar eventos.");`);

// In obtenerDatosCompletos it returns esAdmin: esAdministrador()
code = code.replace(/esAdmin: esAdministrador\(\)/, `esAdmin: verificarPermisoEvento('convivencia escolar') // simplificacion para UI`);

fs.writeFileSync('Calendario Online/Código.gs.txt', code, 'utf8');
console.log('RBAC enforced en Calendario Online.');
