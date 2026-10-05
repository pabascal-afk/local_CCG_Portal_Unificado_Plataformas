const fs = require('fs');

let codeHtml = fs.readFileSync('c:/Users/TI/Documents/Horarios/Asignador_Index.html.txt', 'utf8');

// 1. CSS Injection
const cssMarker = '</style>';
const cssInject = `
    .step-indicator { display: none; }
    .step-indicator.active { display: block; }
    .wizard-badge { 
        cursor: pointer; 
        transition: all 0.2s;
        border: 2px solid transparent;
        opacity: 0.6;
    }
    .wizard-badge.selected {
        border-color: #198754;
        background-color: #d1e7dd !important;
        color: #0f5132 !important;
        opacity: 1;
        transform: scale(1.05);
    }
</style>`;
codeHtml = codeHtml.replace(cssMarker, cssInject);

// 2. Modify Nuevo Profesor button
const oldBtn = '<button class="btn btn-sm btn-success" onclick="agregarFilaPerfil()"><i class="bi bi-plus-circle"></i> Nuevo Profesor</button>';
const newBtn = '<button class="btn btn-sm btn-success shadow-sm" onclick="abrirWizardProfesor()"><i class="bi bi-magic"></i> ✨ Crear Perfil (Asistente)</button>';
codeHtml = codeHtml.replace(oldBtn, newBtn);

// 3. Inject Modal Wizard HTML (before Modal Reglas)
const modalMarker = '<!-- Modal Perfiles Académicos -->';
const modalInject = `<!-- Modal Wizard Profesor -->
<div class="modal fade" id="modalWizardProfesor" tabindex="-1" data-bs-backdrop="static" style="z-index: 1060;">
  <div class="modal-dialog modal-lg modal-dialog-centered">
    <div class="modal-content shadow-lg border-0">
      <div class="modal-header text-white" style="background: linear-gradient(45deg, #18bc9c, #3498db);">
        <h5 class="modal-title fw-bold"><i class="bi bi-magic"></i> Asistente de Perfil</h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" onclick="reiniciarWizard()"></button>
      </div>
      <div class="modal-body bg-light">
          <!-- Paso 1 -->
          <div class="step-indicator active" id="wizardStep1">
              <h4 class="text-center mb-4 text-primary">Paso 1: Datos Básicos</h4>
              <div class="row px-5">
                  <div class="col-md-6 mb-3">
                      <label class="form-label fw-bold">Nombre del Docente</label>
                      <input type="text" id="wizNombre" class="form-control form-control-lg" placeholder="Ej: Juan Pérez">
                  </div>
                  <div class="col-md-6 mb-3">
                      <label class="form-label fw-bold">Horas Máximas (Contrato)</label>
                      <input type="number" id="wizHoras" class="form-control form-control-lg" placeholder="Ej: 44">
                  </div>
              </div>
          </div>
          
          <!-- Paso 2 -->
          <div class="step-indicator" id="wizardStep2">
              <h4 class="text-center mb-3 text-primary">Paso 2: Cursos Permitidos</h4>
              <p class="text-center text-muted small mb-4">Selecciona los cursos en los que este docente puede enseñar.</p>
              <div id="wizContenedorCursos" class="d-flex flex-wrap gap-2 justify-content-center px-4">
                  <!-- Badges -->
              </div>
          </div>
          
          <!-- Paso 3 -->
          <div class="step-indicator" id="wizardStep3">
              <h4 class="text-center mb-3 text-primary">Paso 3: Asignaturas Permitidas</h4>
              <p class="text-center text-muted small mb-4">Selecciona las materias de su especialidad.</p>
              <div id="wizContenedorAsignaturas" class="d-flex flex-wrap gap-2 justify-content-center px-4">
                  <!-- Badges -->
              </div>
          </div>
          
          <!-- Paso 4 -->
          <div class="step-indicator" id="wizardStep4">
              <h4 class="text-center mb-4 text-success"><i class="bi bi-check-circle-fill"></i> ¡Todo Listo!</h4>
              <div class="card border-success mx-5 shadow-sm">
                  <div class="card-body">
                      <h5 class="card-title text-center fw-bold text-dark" id="wizResumenNombre">-</h5>
                      <hr>
                      <p><strong>Carga Máxima:</strong> <span id="wizResumenHoras">-</span> horas</p>
                      <p><strong>Cursos Asignados:</strong> <span id="wizResumenCursos" class="text-primary">-</span></p>
                      <p><strong>Materias Asignadas:</strong> <span id="wizResumenAsignaturas" class="text-primary">-</span></p>
                  </div>
              </div>
          </div>
          
      </div>
      <div class="modal-footer d-flex justify-content-between bg-white border-top-0">
          <button class="btn btn-outline-secondary" id="btnWizAtras" onclick="cambiarPasoWizard(-1)" style="visibility: hidden;"><i class="bi bi-arrow-left"></i> Anterior</button>
          <button class="btn btn-primary" id="btnWizSiguiente" onclick="cambiarPasoWizard(1)">Siguiente <i class="bi bi-arrow-right"></i></button>
          <button class="btn btn-success" id="btnWizFinalizar" onclick="finalizarWizard()" style="display: none;"><i class="bi bi-plus-circle"></i> Agregar a Tabla</button>
      </div>
    </div>
  </div>
</div>

<!-- Modal Perfiles Académicos -->`;
codeHtml = codeHtml.replace(modalMarker, modalInject);


// 4. Inject Javascript
const jsMarker = '// --- MODULO DESDE CERO Y AUTO-ASIGNACION ---';
const jsInject = `// --- MODULO DESDE CERO Y AUTO-ASIGNACION ---

// WIZARD LOGIC
let currentWizStep = 1;
const TOTAL_WIZ_STEPS = 4;

function abrirWizardProfesor() {
    let cursosSet = new Set();
    let asigSet = new Set();
    DB_HORARIOS.forEach(h => {
        if (h.Curso && h.Curso.trim() !== '') cursosSet.add(h.Curso.trim());
        if (h.Asignatura && h.Asignatura.trim() !== '') asigSet.add(h.Asignatura.trim());
    });
    
    let cursosArr = Array.from(cursosSet).sort();
    let asigArr = Array.from(asigSet).sort();
    
    const contCursos = document.getElementById('wizContenedorCursos');
    contCursos.innerHTML = '';
    cursosArr.forEach(c => {
        let div = document.createElement('div');
        div.className = 'badge bg-secondary wizard-badge fs-6 p-2';
        div.textContent = c;
        div.onclick = function() { this.classList.toggle('selected'); };
        contCursos.appendChild(div);
    });
    
    const contAsig = document.getElementById('wizContenedorAsignaturas');
    contAsig.innerHTML = '';
    asigArr.forEach(a => {
        let div = document.createElement('div');
        div.className = 'badge bg-secondary wizard-badge fs-6 p-2';
        div.textContent = a;
        div.onclick = function() { this.classList.toggle('selected'); };
        contAsig.appendChild(div);
    });
    
    reiniciarWizard();
    const modalWiz = new bootstrap.Modal(document.getElementById('modalWizardProfesor'));
    modalWiz.show();
}

function cambiarPasoWizard(direccion) {
    if (direccion === 1 && currentWizStep === 1) {
        if (document.getElementById('wizNombre').value.trim() === '') {
            showAlert('Por favor, ingresa el nombre del docente.', 'warning');
            return;
        }
    }
    document.getElementById('wizardStep' + currentWizStep).classList.remove('active');
    currentWizStep += direccion;
    if (currentWizStep === TOTAL_WIZ_STEPS) generarResumenWizard();
    document.getElementById('wizardStep' + currentWizStep).classList.add('active');
    
    document.getElementById('btnWizAtras').style.visibility = currentWizStep === 1 ? 'hidden' : 'visible';
    
    if (currentWizStep === TOTAL_WIZ_STEPS) {
        document.getElementById('btnWizSiguiente').style.display = 'none';
        document.getElementById('btnWizFinalizar').style.display = 'block';
    } else {
        document.getElementById('btnWizSiguiente').style.display = 'block';
        document.getElementById('btnWizFinalizar').style.display = 'none';
    }
}

function generarResumenWizard() {
    document.getElementById('wizResumenNombre').textContent = document.getElementById('wizNombre').value.trim();
    document.getElementById('wizResumenHoras').textContent = document.getElementById('wizHoras').value.trim() || 'Sin límite';
    
    let cursosSel = Array.from(document.getElementById('wizContenedorCursos').querySelectorAll('.selected')).map(el => el.textContent).join(', ');
    document.getElementById('wizResumenCursos').textContent = cursosSel || 'Todos los cursos';
    
    let asigSel = Array.from(document.getElementById('wizContenedorAsignaturas').querySelectorAll('.selected')).map(el => el.textContent).join(', ');
    document.getElementById('wizResumenAsignaturas').textContent = asigSel || 'Todas las materias';
}

function reiniciarWizard() {
    currentWizStep = 1;
    document.getElementById('wizNombre').value = '';
    document.getElementById('wizHoras').value = '';
    document.querySelectorAll('.step-indicator').forEach(el => el.classList.remove('active'));
    document.getElementById('wizardStep1').classList.add('active');
    document.getElementById('btnWizAtras').style.visibility = 'hidden';
    document.getElementById('btnWizSiguiente').style.display = 'block';
    document.getElementById('btnWizFinalizar').style.display = 'none';
}

function finalizarWizard() {
    let nom = document.getElementById('wizNombre').value.trim();
    let hrs = document.getElementById('wizHoras').value.trim();
    let cur = Array.from(document.getElementById('wizContenedorCursos').querySelectorAll('.selected')).map(el => el.textContent).join(',');
    let asi = Array.from(document.getElementById('wizContenedorAsignaturas').querySelectorAll('.selected')).map(el => el.textContent).join(',');
    
    agregarFilaPerfil(nom, hrs, cur, asi);
    
    bootstrap.Modal.getInstance(document.getElementById('modalWizardProfesor')).hide();
    showAlert('Perfil agregado exitosamente a la tabla. Recuerda "Guardar Perfiles" al final.', 'success');
}
`;
codeHtml = codeHtml.replace(jsMarker, jsInject);

fs.writeFileSync('c:/Users/TI/Documents/Horarios/Asignador_Index.html.txt', codeHtml);
console.log('Wizard fully installed.');
