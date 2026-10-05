const fs = require('fs');
let html = fs.readFileSync('Calendario Pruebas/Frontend.html', 'utf8');

const htmlToInsert = `
            <div class="mb-3">
              <label class="fw-medium">¿Requiere recurso especial?</label>
              <select class="form-select" id="inRecurso">
                <option value="Ninguno">No, ninguno</option>
                <option value="Laboratorio de Computación">Laboratorio de Computación</option>
                <option value="Laboratorio Móvil 1">Laboratorio Móvil 1</option>
                <option value="Laboratorio Móvil 2">Laboratorio Móvil 2</option>
                <option value="Laboratorio de Ciencias">Laboratorio de Ciencias</option>
                <option value="Auditorio">Auditorio</option>
              </select>
            </div>
`;

html = html.replace('</select>\r\n            </div>\r\n            \r\n            <div class="mb-3">\r\n              <label class="fw-medium">Contenidos', '</select>\n            </div>\n' + htmlToInsert + '            <div class="mb-3">\n              <label class="fw-medium">Contenidos');

html = html.replace("tipo: document.getElementById('inTipo').value,", "tipo: document.getElementById('inTipo').value,\n          recurso: document.getElementById('inRecurso').value,");

// also update the edit mode pre-fill
html = html.replace("document.getElementById('inTipo').value = evaluacionSeleccionada.tipo;", "document.getElementById('inTipo').value = evaluacionSeleccionada.tipo;\n            if(evaluacionSeleccionada.recurso) document.getElementById('inRecurso').value = evaluacionSeleccionada.recurso;");

fs.writeFileSync('Calendario Pruebas/Frontend.html', html, 'utf8');
console.log('Frontend modificado con exito.');
