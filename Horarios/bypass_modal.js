const fs = require('fs');
let code = fs.readFileSync('c:/Users/TI/Documents/Horarios/Asignador_Index.html.txt', 'utf8');

// Change in solicitarAyudaGemini
code = code.replace(
  'renderGeminiSugerencias(parsed.analisis, geminiSugerenciasPendientes);',
  `if(parsed.analisis) { showAlert('🤖 IA: ' + parsed.analisis, 'info'); }
      aplicarGeminiSugerencias();`
);

// Remove the modal hide from aplicarGeminiSugerencias
code = code.replace(
  "bootstrap.Modal.getInstance(document.getElementById('modalGeminiResults')).hide();",
  '// Modal bypassed for blind execution'
);

fs.writeFileSync('c:/Users/TI/Documents/Horarios/Asignador_Index.html.txt', code);
console.log('Done');
