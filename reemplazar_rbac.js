const fs = require('fs');
let code = fs.readFileSync('Calendario Pruebas/Backend.gs', 'utf8');

const regex = /\/\/ NUEVO: Validar Disponibilidad de Recurso\s+const bloquesClase = horariosClase.map\(h => h.bloque.toString\(\)\);\s+if \(datos.recurso && datos.recurso !== "Ninguno" && datos.recurso !== ""\) {/;

const replacement = `// NUEVO: Validar Disponibilidad de Recurso
  const bloquesClase = horariosClase.map(h => h.bloque.toString());
  if (datos.recurso && datos.recurso !== "Ninguno" && datos.recurso !== "") {
    const rolNorm = usuario.rol.toLowerCase().trim();
    if (rolNorm === 'profesor') {
      throw new Error("Acceso denegado: Solo Coordinación Pedagógica o Directivos pueden solicitar laboratorios o el auditorio para evaluaciones.");
    }`;

code = code.replace(regex, replacement);

fs.writeFileSync('Calendario Pruebas/Backend.gs', code, 'utf8');
console.log('RBAC enforced en agendarEvaluacion.');
