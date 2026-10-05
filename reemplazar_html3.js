const fs = require('fs');
let html = fs.readFileSync('Calendario Pruebas/Frontend.html', 'utf8');

const htmlToInsert = `
            <div class="mb-3">
              <label class="fw-medium">Tipo de Evaluación</label>
                <select class="form-select" id="inTipo" required>
                  <option value="">-- Selecciona --</option>
                  <option value="📝 Prueba">📝 Prueba</option>
                  <option value="🗣️ Exposición Oral">🗣️ Exposición Oral</option>
                  <option value="🛠️ Trabajo">🛠️ Trabajo</option>
                  <option value="🔄 Ev. de Proceso">🔄 Ev. de Proceso</option>
                  <option value="📚 Quiz">📚 Quiz</option>
                </select>
            </div>
`;

html = html.replace('<div class="mb-3">\n              <label class="fw-medium">¿Requiere recurso especial?</label>', htmlToInsert + '\n            <div class="mb-3">\n              <label class="fw-medium">¿Requiere recurso especial?</label>');

fs.writeFileSync('Calendario Pruebas/Frontend.html', html, 'utf8');
console.log('Frontend HTML tipo restaurado.');
