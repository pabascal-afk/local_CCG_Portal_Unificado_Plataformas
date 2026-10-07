const fs = require('fs');
let code = fs.readFileSync('public/evaluaciones.html', 'utf8');

const targetOldForm = `<div class="modal-body bg-light">
          <input type="hidden" id="inFecha">

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

          
          
            
            <div class="mb-3">
              <label class="fw-medium">Tipo de Evaluación</label>
                <select class="form-select" id="inTipo" required>
                  <option value="">-- Selecciona --</option>
                  <option value="📝 Prueba">📝 Prueba</option>
                  <option value="🗣️ Exposición Oral">🗣️ Exposición Oral</option>
                  <option value="📂 Trabajo">📂 Trabajo</option>
                  <option value="🔄 Ev. de Proceso">🔄 Ev. de Proceso</option>
                  <option value="⏱️ Quiz">⏱️ Quiz</option>
                </select>
            </div>

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
            <div class="mb-3">
              <label class="fw-medium">Contenidos / Detalles <small class="text-muted">(Opcional)</small></label>
            <textarea id="inDetalles" class="form-control" rows="3" placeholder="Ej: Unidad 1. Traer materiales..."></textarea>
          </div>
        </div>`;

// Note: text encoding could be an issue due to how the terminal reads it.
// I will use regex to replace everything between `<div class="modal-body bg-light">` and `</div>\n          <div class="modal-footer border-0 bg-light">`

