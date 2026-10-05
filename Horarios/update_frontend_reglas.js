const fs = require('fs');
let code = fs.readFileSync('c:/Users/TI/Documents/Horarios/Asignador_Index.html.txt', 'utf8');

// 1. Add Toolbar Button
const btnExportStr = '<button class="btn btn-sm btn-outline-dark rounded-pill px-3" onclick="exportarReportes()"><span id="btnExportText"><i class="bi bi-file-earmark-spreadsheet"></i> Exportar</span></button>';
const newBtnStr = '<button class="btn btn-sm btn-outline-primary rounded-pill px-3" onclick="abrirModalReglas()"><i class="bi bi-gear"></i> Reglas</button>\n            ' + btnExportStr;
code = code.replace(btnExportStr, newBtnStr);

// 2. Add Modal HTML
const modalHtml = `
  <!-- MODAL GESTOR DE REGLAS -->
  <div class="modal fade" id="modalReglas" tabindex="-1">
    <div class="modal-dialog modal-xl modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header bg-primary text-white">
          <h5 class="modal-title fw-bold"><i class="bi bi-gear"></i> Gestión de Reglas</h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body p-4 bg-light">
          
          <ul class="nav nav-tabs mb-3" id="reglasTabs" role="tablist">
            <li class="nav-item" role="presentation">
              <button class="nav-link active fw-bold" id="grales-tab" data-bs-toggle="tab" data-bs-target="#tabGrales" type="button" role="tab">Reglas Generales</button>
            </li>
            <li class="nav-item" role="presentation">
              <button class="nav-link fw-bold" id="profes-tab" data-bs-toggle="tab" data-bs-target="#tabProfes" type="button" role="tab">Reglas de Profesores</button>
            </li>
          </ul>

          <div class="tab-content" id="reglasTabContent">
            <!-- PESTAÑA GENERALES -->
            <div class="tab-pane fade show active" id="tabGrales" role="tabpanel">
              <div class="d-flex justify-content-between mb-2">
                <span class="text-muted small">Configura excepciones, topes de bloques por día o reglas de bloques dobles.</span>
                <button class="btn btn-sm btn-success" onclick="addReglaGral()"><i class="bi bi-plus-circle"></i> Añadir Regla</button>
              </div>
              <div class="table-responsive bg-white rounded border">
                <table class="table table-sm table-hover align-middle mb-0" id="tableReglasGrales">
                  <thead class="table-light">
                    <tr>
                      <th style="width: 25%">Asignatura (o TODAS/GLOBAL)</th>
                      <th style="width: 25%">Condición</th>
                      <th style="width: 40%">Valores</th>
                      <th style="width: 10%" class="text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody></tbody>
                </table>
              </div>
            </div>

            <!-- PESTAÑA PROFESORES -->
            <div class="tab-pane fade" id="tabProfes" role="tabpanel">
              <div class="d-flex justify-content-between mb-2">
                <span class="text-muted small">Configura días libres, bloques bloqueados y horas máximas de contrato.</span>
                <button class="btn btn-sm btn-success" onclick="addReglaProf()"><i class="bi bi-plus-circle"></i> Añadir Profesor</button>
              </div>
              <div class="table-responsive bg-white rounded border">
                <table class="table table-sm table-hover align-middle mb-0" id="tableReglasProfes">
                  <thead class="table-light">
                    <tr>
                      <th style="width: 25%">Nombre Profesor</th>
                      <th style="width: 25%">Días Libres (separados por coma)</th>
                      <th style="width: 25%">Bloques Bloqueados (Lunes:1,2)</th>
                      <th style="width: 15%">Horas Máximas Semanales</th>
                      <th style="width: 10%" class="text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody></tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
        <div class="modal-footer d-flex justify-content-between">
          <span class="text-danger small" id="reglasStatusText"></span>
          <div>
            <button type="button" class="btn btn-light border shadow-sm" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-primary shadow-sm" id="btnGuardarReglas" onclick="guardarReglasDesdeUI()"><i class="bi bi-cloud-upload"></i> Guardar en Sheets</button>
          </div>
        </div>
      </div>
    </div>
  </div>
`;

// Inject before script tag closes
const modalHook = '<!-- FIN MODALES -->';
// Let's just find `</script>` and inject right before it, and also the modal HTML right before the `<script>` starts.
// Actually, `</body>` is a good place.
const bodyEndIdx = code.indexOf('</body>');
if (bodyEndIdx !== -1) {
  code = code.substring(0, bodyEndIdx) + modalHtml + '\n' + code.substring(bodyEndIdx);
}

// 3. Add JS Functions
const jsLogic = `
  // --- GESTIÓN DE REGLAS ---
  let tempReglasGrales = [];
  let tempReglasProfes = [];

  function abrirModalReglas() {
    tempReglasGrales = JSON.parse(JSON.stringify(REGLAS_GRALES));
    tempReglasProfes = JSON.parse(JSON.stringify(REGLAS_PROFES));
    renderReglasTables();
    document.getElementById('reglasStatusText').innerText = '';
    const modal = new bootstrap.Modal(document.getElementById('modalReglas'));
    modal.show();
  }

  function renderReglasTables() {
    const tbodyG = document.querySelector('#tableReglasGrales tbody');
    tbodyG.innerHTML = '';
    tempReglasGrales.forEach((r, idx) => {
      tbodyG.innerHTML += \`
        <tr>
          <td><input type="text" class="form-control form-control-sm border-0 bg-transparent" value="\${r.Asignatura || ''}" onchange="updateRG(\${idx}, 'Asignatura', this.value)"></td>
          <td>
            <select class="form-select form-select-sm border-0 bg-transparent" onchange="updateRG(\${idx}, 'Condición', this.value)">
              <option value="MAX_POR_DIA" \${r.Condición==='MAX_POR_DIA'?'selected':''}>MAX_POR_DIA</option>
              <option value="BLOQUES_DOBLES" \${r.Condición==='BLOQUES_DOBLES'?'selected':''}>BLOQUES_DOBLES</option>
              <option value="SOLO_BLOQUES" \${r.Condición==='SOLO_BLOQUES'?'selected':''}>SOLO_BLOQUES</option>
              <option value="SOLO_DIA" \${r.Condición==='SOLO_DIA'?'selected':''}>SOLO_DIA</option>
              <option value="NUNCA_BLOQUES" \${r.Condición==='NUNCA_BLOQUES'?'selected':''}>NUNCA_BLOQUES</option>
              <option value="MAX_SEGUIDAS" \${r.Condición==='MAX_SEGUIDAS'?'selected':''}>MAX_SEGUIDAS</option>
              <option value="REQUIERE_TALLER" \${r.Condición==='REQUIERE_TALLER'?'selected':''}>REQUIERE_TALLER</option>
            </select>
          </td>
          <td><input type="text" class="form-control form-control-sm border-0 bg-transparent" value="\${r.Valores || ''}" onchange="updateRG(\${idx}, 'Valores', this.value)"></td>
          <td class="text-center"><button class="btn btn-sm text-danger" onclick="deleteRG(\${idx})"><i class="bi bi-trash"></i></button></td>
        </tr>
      \`;
    });

    const tbodyP = document.querySelector('#tableReglasProfes tbody');
    tbodyP.innerHTML = '';
    tempReglasProfes.forEach((r, idx) => {
      tbodyP.innerHTML += \`
        <tr>
          <td><input type="text" class="form-control form-control-sm border-0 bg-transparent" value="\${r['Nombre Profesor'] || ''}" onchange="updateRP(\${idx}, 'Nombre Profesor', this.value)"></td>
          <td><input type="text" class="form-control form-control-sm border-0 bg-transparent" value="\${r['Días Libres'] || ''}" onchange="updateRP(\${idx}, 'Días Libres', this.value)" placeholder="Ej: Lunes, Martes"></td>
          <td><input type="text" class="form-control form-control-sm border-0 bg-transparent" value="\${r['Bloques Bloqueados'] || ''}" onchange="updateRP(\${idx}, 'Bloques Bloqueados', this.value)" placeholder="Ej: Lunes:1,2; Viernes:9,10"></td>
          <td><input type="number" class="form-control form-control-sm border-0 bg-transparent" value="\${r['Horas Máximas Semanales'] || ''}" onchange="updateRP(\${idx}, 'Horas Máximas Semanales', this.value)"></td>
          <td class="text-center"><button class="btn btn-sm text-danger" onclick="deleteRP(\${idx})"><i class="bi bi-trash"></i></button></td>
        </tr>
      \`;
    });
  }

  function updateRG(idx, field, val) { tempReglasGrales[idx][field] = val; }
  function updateRP(idx, field, val) { tempReglasProfes[idx][field] = val; }
  
  function deleteRG(idx) { tempReglasGrales.splice(idx, 1); renderReglasTables(); }
  function deleteRP(idx) { tempReglasProfes.splice(idx, 1); renderReglasTables(); }
  
  function addReglaGral() {
    tempReglasGrales.push({ Asignatura: '', Condición: 'MAX_POR_DIA', Valores: '' });
    renderReglasTables();
  }
  function addReglaProf() {
    tempReglasProfes.push({ 'Nombre Profesor': '', 'Días Libres': '', 'Bloques Bloqueados': '', 'Horas Máximas Semanales': '' });
    renderReglasTables();
  }

  function guardarReglasDesdeUI() {
    const btn = document.getElementById('btnGuardarReglas');
    const status = document.getElementById('reglasStatusText');
    
    // Filtrar filas vacías (sin asignatura o profesor)
    tempReglasGrales = tempReglasGrales.filter(r => String(r.Asignatura).trim() !== '');
    tempReglasProfes = tempReglasProfes.filter(r => String(r['Nombre Profesor']).trim() !== '');

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...';
    status.innerText = 'Actualizando hojas en Google Sheets...';

    google.script.run.withSuccessHandler(() => {
      // Actualizar variables globales locales
      REGLAS_GRALES = JSON.parse(JSON.stringify(tempReglasGrales));
      REGLAS_PROFES = JSON.parse(JSON.stringify(tempReglasProfes));
      
      btn.disabled = false;
      btn.innerHTML = '<i class="bi bi-cloud-upload"></i> Guardar en Sheets';
      status.innerText = '';
      
      showAlert('Las reglas se han guardado exitosamente en Google Sheets. Se aplicarán en la próxima corrida del motor.', 'success');
      bootstrap.Modal.getInstance(document.getElementById('modalReglas')).hide();
    }).withFailureHandler((err) => {
      btn.disabled = false;
      btn.innerHTML = '<i class="bi bi-cloud-upload"></i> Guardar en Sheets';
      status.innerText = 'Error: ' + err.message;
    }).guardarReglas(tempReglasGrales, tempReglasProfes);
  }
`;

const scriptEndIdx = code.lastIndexOf('</script>');
if (scriptEndIdx !== -1) {
  code = code.substring(0, scriptEndIdx) + '\n' + jsLogic + '\n' + code.substring(scriptEndIdx);
}

fs.writeFileSync('c:/Users/TI/Documents/Horarios/Asignador_Index.html.txt', code);
console.log('Frontend modifications applied successfully.');
