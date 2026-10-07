const fs = require('fs');
let code = fs.readFileSync('public/evaluaciones.html', 'utf8');

const targetAdmin = `<button class="btn btn-warning btn-sm fw-bold ms-2" onclick="abrirModalAuditoria()">Auditor&iacute;a Art. 51</button>`;
const newAdminBtn = targetAdmin + `\n        <button class="btn btn-outline-info btn-sm fw-semibold" onclick="abrirModalTipos()">⚙️ Tipos de Evaluaci&oacute;n</button>`;

code = code.replace(targetAdmin, newAdminBtn);

const modalsContainer = `<!-- MODAL GESTOR DE TIPOS DE EVALUACION -->
  <div class="modal fade" id="modalTipos" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content border-0 shadow-lg">
        <div class="modal-header bg-info text-white border-0">
          <h5 class="modal-title fw-bold">⚙️ Tipos de Evaluaci&oacute;n</h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body bg-light p-4">
          <p class="text-muted small mb-3">Los tipos marcados como <b>"Prueba"</b> sumar&aacute;n para el c&aacute;lculo del tope de evaluaciones diarias por curso.</p>
          <div class="table-responsive bg-white border rounded shadow-sm mb-3">
              <table class="table table-hover align-middle mb-0" id="tableTipos">
                  <thead class="table-light">
                      <tr>
                          <th>Nombre del Tipo</th>
                          <th class="text-center">Suma Tope?</th>
                          <th class="text-end">Acci&oacute;n</th>
                      </tr>
                  </thead>
                  <tbody>
                      <!-- Tipos aqui -->
                  </tbody>
              </table>
          </div>
          <form id="formNuevoTipo" class="d-flex gap-2">
              <input type="text" class="form-control" id="inNuevoTipo" placeholder="Ej: 🗣️ Disertaci&oacute;n" required>
              <div class="form-check form-switch d-flex align-items-center mb-0 px-2" title="Suma para topes de evaluaciones por día">
                  <input class="form-check-input" type="checkbox" role="switch" id="inNuevoSuma" style="margin-left: 0;">
              </div>
              <button type="submit" class="btn btn-primary fw-bold">+</button>
          </form>
        </div>
      </div>
    </div>
  </div>`;

// Insert modal at the end of body
code = code.replace("</body>", modalsContainer + "\n</body>");

fs.writeFileSync('public/evaluaciones.html', code, 'utf8');
console.log("Modal Tipos inyectado");
