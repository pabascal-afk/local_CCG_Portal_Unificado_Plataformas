const fs = require('fs');
let code = fs.readFileSync('c:/Users/TI/Documents/Horarios/Asignador_Index.html.txt', 'utf8');

// 1. Change condition at the beginning of Phase 1
code = code.replace(/if \(modo === 'LECTIVAS' \|\| modo === 'NO_LECTIVAS'\) \{/, 
  "let isFlexible = (modo === 'FLEXIBLE');\n      if (modo === 'LECTIVAS' || modo === 'NO_LECTIVAS' || modo === 'FLEXIBLE') {");

// 2. Change condition at the beginning of Phase 2
code = code.replace(/if \(modo === 'LECTIVAS' && noUbicadas\.length > 0\) \{/, 
  "if ((modo === 'LECTIVAS' || modo === 'FLEXIBLE') && noUbicadas.length > 0) {");

// 3. Inject isFlexible into verificarConflictos inside Phase 1 and Phase 2.
code = code.replace(/let errores1 = verificarConflictos\(clase\);/g, "let errores1 = verificarConflictos(clase, isFlexible);");
code = code.replace(/let errores2 = verificarConflictos\(clasePar\);/g, "let errores2 = verificarConflictos(clasePar, isFlexible);");
code = code.replace(/let errsRebotada = verificarConflictos\(claseRebotada\);/g, "let errsRebotada = verificarConflictos(claseRebotada, isFlexible);");
code = code.replace(/errsPar = verificarConflictos\(claseParRebotada\);/g, "errsPar = verificarConflictos(claseParRebotada, isFlexible);");
code = code.replace(/verificarConflictos\(estorbo\)\.length/g, "verificarConflictos(estorbo, isFlexible).length");
code = code.replace(/verificarConflictos\(ePar\)\.length/g, "verificarConflictos(ePar, isFlexible).length");
code = code.replace(/verificarConflictos\(se\)\.length/g, "verificarConflictos(se, isFlexible).length");

// 4. Remove Phase 3 entirely.
const p3Start = code.indexOf("// FASE 3: ASIGNACIÓN FLEXIBILIZADA");
const p3End = code.indexOf("let clasesCambiadas = DB_HORARIOS");
if (p3Start !== -1 && p3End !== -1) {
  code = code.substring(0, p3Start) + code.substring(p3End);
}

fs.writeFileSync('c:/Users/TI/Documents/Horarios/Asignador_Index.html.txt', code);
console.log("Modifications applied successfully.");
