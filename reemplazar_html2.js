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

// regex approach
html = html.replace(/<div class="mb-3">[\s\S]*?<label class="fw-medium">Contenidos \/ Detalles/, htmlToInsert + '            <div class="mb-3">\n              <label class="fw-medium">Contenidos / Detalles');

fs.writeFileSync('Calendario Pruebas/Frontend.html', html, 'utf8');
console.log('Frontend HTML modificado.');
