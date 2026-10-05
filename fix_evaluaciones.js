const fs = require('fs');
let html = fs.readFileSync('public/evaluaciones.html', 'utf8');

if (!html.includes('id="inCurso"')) {
    const missingHTML = `
              <div class="mb-3">
                <label class="fw-medium">Curso</label>
                <select class="form-select" id="inCurso" required onchange="actualizarAsignaturas()">
                   <option value="">-- Selecciona --</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="fw-medium">Asignatura</label>
                <select class="form-select" id="inAsig" required>
                   <option value="">Selecciona un curso primero</option>
                </select>
              </div>
`;
    html = html.replace('<input type="hidden" id="inFecha">', '<input type="hidden" id="inFecha">\n' + missingHTML);
    fs.writeFileSync('public/evaluaciones.html', html, 'utf8');
    console.log('Selectores inCurso y inAsig inyectados.');
}
