const fs = require('fs');
let code = fs.readFileSync('c:/Users/TI/Documents/Horarios/Asignador_Index.html.txt', 'utf8');

// 1. Add Button
const btnFlexibleStr = `<button class="btn btn-sm btn-warning rounded-pill px-3 shadow-sm text-dark fw-semibold" id="btnGenerarFlexible" onclick="ejecutarMotor('FLEXIBLE')">
                <i class="bi bi-lightning-charge"></i> <span id="btnGenerarFlexibleText">Forzar Restantes</span>
            </button>`;
const newBtnsStr = btnFlexibleStr + `
            <button class="btn btn-sm text-white rounded-pill px-3 shadow-sm fw-bold border-0" id="btnAsistenteIA" onclick="abrirAsistenteIA()" style="background: linear-gradient(45deg, #6a11cb, #2575fc);">
                ✨ <span id="btnAsistenteIAText">Asistente IA</span>
            </button>`;
code = code.replace(btnFlexibleStr, newBtnsStr);

// 2. Add Modals (inject before </body>)
const geminiModals = `
  <!-- MODAL GEMINI API KEY -->
  <div class="modal fade" id="modalGeminiKey" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content border-0 shadow">
        <div class="modal-header text-white" style="background: linear-gradient(45deg, #6a11cb, #2575fc);">
          <h5 class="modal-title fw-bold">✨ Configurar Asistente IA</h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body p-4">
          <p class="text-muted">El Asistente utiliza la API de Google Gemini para buscar huecos y sugerir movimientos complejos.</p>
          <div class="mb-3">
            <label class="form-label fw-bold">API Key de Gemini</label>
            <input type="password" class="form-control" id="geminiApiKeyInput" placeholder="AIzaSy...">
            <small class="text-muted d-block mt-1">Tu clave se guarda de forma segura en tu navegador y no viaja a nuestros servidores.</small>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancelar</button>
          <button type="button" class="btn text-white fw-bold" onclick="guardarGeminiKeyYContinuar()" style="background: #2575fc;">Guardar y Continuar</button>
        </div>
      </div>
    </div>
  </div>

  <!-- MODAL GEMINI SUGERENCIAS -->
  <div class="modal fade" id="modalGeminiResults" tabindex="-1">
    <div class="modal-dialog modal-lg modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header text-white" style="background: linear-gradient(45deg, #11998e, #38ef7d);">
          <h5 class="modal-title fw-bold">✨ Sugerencias de Gemini</h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body p-4">
          <div id="geminiResultsContent"></div>
        </div>
        <div class="modal-footer">
          <span id="geminiStatusText" class="text-danger small me-auto"></span>
          <button type="button" class="btn btn-light" data-bs-dismiss="modal">Descartar</button>
          <button type="button" class="btn btn-success fw-bold" onclick="aplicarGeminiSugerencias()"><i class="bi bi-check2-circle"></i> Aplicar Movimientos</button>
        </div>
      </div>
    </div>
  </div>
`;

const bodyEndIdx = code.indexOf('</body>');
if (bodyEndIdx !== -1) {
  code = code.substring(0, bodyEndIdx) + geminiModals + '\n' + code.substring(bodyEndIdx);
}

// 3. Add JS Logic
const geminiJs = `
  // --- INTEGRACIÓN GEMINI AI ---
  let geminiSugerenciasPendientes = [];

  function abrirAsistenteIA() {
    let unassigned = DB_HORARIOS.filter(h => h.Día === '' && String(h.Asignatura).toLowerCase() !== 'consejo');
    if (unassigned.length === 0) {
      showAlert('No hay clases sin asignar para enviar a la IA.', 'info');
      return;
    }
    
    const key = localStorage.getItem('gemini_api_key');
    if (!key) {
      new bootstrap.Modal(document.getElementById('modalGeminiKey')).show();
      return;
    }
    solicitarAyudaGemini(key);
  }

  function guardarGeminiKeyYContinuar() {
    const key = document.getElementById('geminiApiKeyInput').value.trim();
    if (key) {
      localStorage.setItem('gemini_api_key', key);
      bootstrap.Modal.getInstance(document.getElementById('modalGeminiKey')).hide();
      solicitarAyudaGemini(key);
    }
  }

  async function solicitarAyudaGemini(apiKey) {
    const btn = document.getElementById('btnAsistenteIA');
    const txt = document.getElementById('btnAsistenteIAText');
    btn.disabled = true;
    txt.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Pensando...';
    
    // Preparar el estado reducido para ahorrar tokens
    const unassigned = DB_HORARIOS.filter(h => h.Día === '' && String(h.Asignatura).toLowerCase() !== 'consejo').map(h => ({
      id: h._rowIndex,
      curso: h.Curso,
      asignatura: h.Asignatura,
      profesor: h.Profesor
    }));

    // Tomar una muestra del tablero actual (clases asignadas)
    const assigned = DB_HORARIOS.filter(h => h.Día !== '').map(h => ({
      id: h._rowIndex,
      curso: h.Curso,
      dia: h.Día,
      bloque: h.Bloque,
      asignatura: h.Asignatura,
      profesor: h.Profesor
    }));

    const promptText = \`Eres un experto planificador escolar matemático.
Tu tarea es ubicar clases que no tienen horario, resolviendo conflictos intercambiando clases ya asignadas si es necesario.
Existen topes de profesores, tope de jornada (1 a 10) y restricciones generales.
Reglas: Ningún profesor puede estar en dos cursos el mismo día y bloque. Ningún curso puede tener dos materias el mismo día y bloque.

Clases por ubicar:
\${JSON.stringify(unassigned)}

Tablero actual:
\${JSON.stringify(assigned)}

REGLAS GENERALES:
\${JSON.stringify(REGLAS_GRALES)}

Debes devolver EXCLUSIVAMENTE un bloque JSON válido con el siguiente esquema, sin markdown adicional:
{
  "analisis": "Breve explicación de por qué fue difícil y qué movimientos sugieres.",
  "movimientos": [
    {
      "claseId": 123, 
      "nuevoDia": "Lunes",
      "nuevoBloque": 3,
      "accion": "Mover clase existente para hacer hueco" o "Asignar nueva clase"
    }
  ]
}
No devuelvas texto fuera del JSON.\`;

    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + apiKey, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json"
          }
        })
      });
      
      const data = await response.json();
      
      if (data.error) {
        if (data.error.code === 400 && data.error.message.includes("API key not valid")) {
          localStorage.removeItem('gemini_api_key');
          showAlert('API Key inválida. Por favor, ingrésala de nuevo.', 'danger');
        } else {
          showAlert('Error de Gemini: ' + data.error.message, 'danger');
        }
        btn.disabled = false;
        txt.innerText = 'Asistente IA';
        return;
      }
      
      let textRes = data.candidates[0].content.parts[0].text;
      const parsed = JSON.parse(textRes);
      
      geminiSugerenciasPendientes = parsed.movimientos || [];
      renderGeminiSugerencias(parsed.analisis, geminiSugerenciasPendientes);
      
    } catch (e) {
      showAlert('Falló la conexión con Gemini: ' + e.message, 'danger');
    }
    
    btn.disabled = false;
    txt.innerText = 'Asistente IA';
  }

  function renderGeminiSugerencias(analisis, movimientos) {
    const container = document.getElementById('geminiResultsContent');
    let html = \`<p class="fw-bold text-dark">🧠 Análisis de la IA:</p><p class="text-muted">\${analisis}</p><hr>\`;
    
    if (movimientos.length === 0) {
      html += \`<div class="alert alert-warning">La IA no logró encontrar una secuencia de movimientos válida.</div>\`;
    } else {
      html += \`<p class="fw-bold text-dark">📥 Movimientos Propuestos:</p><ul class="list-group list-group-flush mb-3">\`;
      movimientos.forEach(m => {
        const clase = DB_HORARIOS.find(h => h._rowIndex === m.claseId);
        let badge = clase && clase.Día === '' ? '<span class="badge bg-success">Nueva Asignación</span>' : '<span class="badge bg-warning text-dark">Reubicación</span>';
        let desc = clase ? \`\${clase.Curso} - \${clase.Asignatura} (\${clase.Profesor})\` : \`Clase ID: \${m.claseId} (No encontrada)\`;
        html += \`<li class="list-group-item d-flex justify-content-between align-items-start">
                   <div class="ms-2 me-auto">
                     <div class="fw-bold">\${desc} \${badge}</div>
                     Mover a: <strong class="text-primary">\${m.nuevoDia} - Bloque \${m.nuevoBloque}</strong><br>
                     <small class="text-muted">Motivo: \${m.accion}</small>
                   </div>
                 </li>\`;
      });
      html += \`</ul><div class="alert alert-info py-2 small"><i class="bi bi-shield-check"></i> El motor verificará estos movimientos contra las reglas duras antes de insertarlos.</div>\`;
    }
    
    container.innerHTML = html;
    new bootstrap.Modal(document.getElementById('modalGeminiResults')).show();
  }

  function aplicarGeminiSugerencias() {
    let exitoCount = 0;
    
    // Primero, hacemos un "desalojo" virtual de las clases que se van a reubicar
    geminiSugerenciasPendientes.forEach(m => {
      let clase = DB_HORARIOS.find(h => h._rowIndex === m.claseId);
      if (clase) {
        clase._oldDia = clase.Día;
        clase._oldBloque = clase.Bloque;
        clase.Día = '';
        clase.Bloque = '';
      }
    });

    // Luego, intentamos ubicarlas en el nuevo destino y verificamos
    geminiSugerenciasPendientes.forEach(m => {
      let clase = DB_HORARIOS.find(h => h._rowIndex === m.claseId);
      if (clase && m.nuevoDia && m.nuevoBloque) {
        clase.Día = m.nuevoDia;
        clase.Bloque = Number(m.nuevoBloque);
        
        let errores = verificarConflictos(clase, true); // Ignoramos soft rules
        if (errores.length > 0) {
          // Revertir
          clase.Día = clase._oldDia !== undefined ? clase._oldDia : '';
          clase.Bloque = clase._oldBloque !== undefined ? clase._oldBloque : '';
          console.log("IA Falló en: " + clase.Asignatura + " - " + errores.join(", "));
        } else {
          clase._modificadoXMotor = true;
          exitoCount++;
        }
      }
    });
    
    bootstrap.Modal.getInstance(document.getElementById('modalGeminiResults')).hide();
    showAlert(\`IA Finalizada: Se lograron inyectar \${exitoCount} de \${geminiSugerenciasPendientes.length} sugerencias con éxito.\`, 'success');
    renderGrid();
    actualizarContadores();
  }
`;

const scriptEndIdx = code.lastIndexOf('</script>');
if (scriptEndIdx !== -1) {
  code = code.substring(0, scriptEndIdx) + '\n' + geminiJs + '\n' + code.substring(scriptEndIdx);
}

fs.writeFileSync('c:/Users/TI/Documents/Horarios/Asignador_Index.html.txt', code);
console.log('Gemini Integration applied successfully.');
