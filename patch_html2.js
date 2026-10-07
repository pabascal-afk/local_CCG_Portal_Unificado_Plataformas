const fs = require('fs');
let code = fs.readFileSync('public/evaluaciones.html', 'utf8');

const regex = /<div class="modal-body bg-light">[\s\S]*?<div class="modal-footer border-0 bg-light">/;

const newFormBody = `<div class="modal-body bg-light p-4">
          <input type="hidden" id="inFecha">

          <div class="row g-3 mb-3">
              <div class="col-md-6">
                <label class="fw-medium text-secondary mb-1"><i class="bi bi-people"></i> Curso</label>
                <select class="form-select border-2 shadow-sm" id="inCurso" required onchange="actualizarAsignaturas()">
                   <option value="">-- Selecciona --</option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="fw-medium text-secondary mb-1"><i class="bi bi-book"></i> Asignatura</label>
                <select class="form-select border-2 shadow-sm" id="inAsig" required>
                   <option value="">Selecciona un curso primero</option>
                </select>
              </div>
          </div>
          
          <div class="row g-3 mb-3">
              <div class="col-md-6">
                <label class="fw-medium text-secondary mb-1"><i class="bi bi-ui-checks"></i> Tipo de Evaluación</label>
                <select class="form-select border-2 shadow-sm" id="inTipo" required>
                  <option value="">Cargando tipos...</option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="fw-medium text-secondary mb-1"><i class="bi bi-door-open"></i> Recurso (Opcional)</label>
                <select class="form-select border-2 shadow-sm" id="inRecurso">
                  <option value="Ninguno">No, ninguno</option>
                  <option value="Laboratorio de Computación">Lab. de Computación</option>
                  <option value="Laboratorio Móvil 1">Laboratorio Móvil 1</option>
                  <option value="Laboratorio Móvil 2">Laboratorio Móvil 2</option>
                  <option value="Laboratorio de Ciencias">Lab. de Ciencias</option>
                  <option value="Auditorio">Auditorio</option>
                </select>
              </div>
          </div>

          <div class="mb-2">
            <label class="fw-medium text-secondary mb-1"><i class="bi bi-card-text"></i> Contenidos / Detalles <small class="text-muted">(Opcional)</small></label>
            <textarea id="inDetalles" class="form-control border-2 shadow-sm" rows="3" placeholder="Ej: Unidad 1. Traer materiales de arte..."></textarea>
          </div>
        </div>
        <div class="modal-footer border-0 bg-light">`;

code = code.replace(regex, newFormBody);

fs.writeFileSync('public/evaluaciones.html', code, 'utf8');
console.log("modalAgenda rediseñado");
