const fs = require('fs');
let html = fs.readFileSync('public/calendario.html', 'utf8');

const regexModal = /<div class="modal-overlay" id="modalEvento">[\s\S]*?<\/form>\s*<\/div>\s*<\/div>/;

const newModal = `<div class="modal-overlay" id="modalEvento">
    <div class="modal" style="max-width: 600px; padding: 25px;">
      <h3 id="modalTitle" style="margin-top:0; margin-bottom:20px; border-bottom: 2px solid #eee; padding-bottom: 10px; color: #2c3e50;">Evento</h3>
      <form id="eventoForm">
        <input type="hidden" name="idEditar" id="idEditar">
        
        <div style="display: flex; gap: 15px; margin-bottom: 15px;">
            <div style="flex: 1;">
                <label style="font-size:0.85em; font-weight:600; color: #555;">Fecha</label>
                <input type="date" name="fecha" id="inputFecha" class="form-control" required>
            </div>
            <div style="flex: 2;">
                <label style="font-size:0.85em; font-weight:600; color: #555;">Actividad / Motivo</label>
                <input type="text" name="texto" id="inputTexto" class="form-control" placeholder="Descripción breve..." required>
            </div>
        </div>

        <div style="display: flex; gap: 15px; margin-bottom: 15px;">
            <div style="flex: 1;">
                <label style="font-size:0.85em; font-weight:600; color: #555;">Categoría</label>
                <select name="tipo" id="selectTipo" class="form-control" onchange="toggleNuevaCat(this)"></select>
                <div id="areaNuevaCat" class="new-cat-wrapper hidden" style="margin-top: 5px;">
                  <input type="text" name="tipoNuevo" id="inputTipoNuevo" placeholder="Nombre" style="width: 100%; padding:5px; border:1px solid #ddd; font-size:0.9em; box-sizing: border-box;">
                  <input type="color" name="colorNuevo" id="inputColorNuevo" value="#3498db" style="width:100%; border:none; height:30px; cursor:pointer; margin-top: 5px;">
                </div>
            </div>
            <div style="flex: 1;">
                <label style="font-size:0.85em; font-weight:600; color: #555;">Ocupa Recurso Físico</label>
                <select name="recurso" id="selectRecurso" class="form-control">
                    <option value="">No, ninguno</option>
                </select>
            </div>
        </div>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; border: 1px solid #e9ecef; margin-bottom: 15px;">
            <label style="font-size:0.9em; font-weight:600; cursor:pointer; display: flex; align-items: center; gap: 8px; color: #d35400;">
              <input type="checkbox" id="checkBloquea" onchange="toggleBloques(); toggleCursosAfectados();"> 
              🛑 Bloquea Evaluaciones / Reservas en este horario
            </label>
            
            <div id="areaBloques" class="bloques-container hidden" style="margin-top: 15px; background: white; padding: 10px; border-radius: 4px; border: 1px solid #ddd;">
              <label style="width: 100%; font-weight: bold; margin-bottom: 8px; color: #333; font-size: 0.85em;">
                <input type="checkbox" id="checkTodosBloques" onchange="toggleTodosBloques()"> Todo el día (TODOS)
              </label>
              <div style="display:flex; flex-wrap:wrap; gap:10px; font-size: 0.85em;" id="checksBloquesIndividuales">
                <label><input type="checkbox" class="bloque-cb" value="1"> 1</label>
                <label><input type="checkbox" class="bloque-cb" value="2"> 2</label>
                <label><input type="checkbox" class="bloque-cb" value="3"> 3</label>
                <label><input type="checkbox" class="bloque-cb" value="4"> 4</label>
                <label><input type="checkbox" class="bloque-cb" value="5"> 5</label>
                <label><input type="checkbox" class="bloque-cb" value="6"> 6</label>
                <label><input type="checkbox" class="bloque-cb" value="7"> 7</label>
                <label><input type="checkbox" class="bloque-cb" value="8"> 8</label>
                <label><input type="checkbox" class="bloque-cb" value="9"> 9</label>
                <label><input type="checkbox" class="bloque-cb" value="10"> 10</label>
              </div>
            </div>
            
            <div id="areaCursosAfectados" style="display: none; margin-top: 10px; background: white; padding: 10px; border-radius: 4px; border: 1px solid #ddd;">
                <label style="font-size: 0.85em; font-weight: bold; margin-bottom: 8px; color: #333; display: block;">Cursos Afectados <small style="font-weight: normal; color: #777;">(Si es general, selecciona todos)</small></label>
                <div id="checkCursosContainer" style="font-size: 0.8em; width: 100%;"></div>
            </div>
            <input type="hidden" id="inputCursos" value="TODOS">
        </div>
          
        <div style="background: #fdfdfe; padding: 15px; border-radius: 6px; border: 1px solid #e9ecef; margin-bottom: 15px;">
            <label style="font-size: 0.9em; font-weight: 600; color: #2980b9; display: block; margin-bottom: 10px;">
                <i class="bi bi-people"></i> Invitados Externos (Requieren visación)
            </label>
            <div id="listaExternos" class="mb-2"></div>
            <button type="button" class="btn btn-sm btn-outline-secondary py-0" onclick="agregarFilaExterno()" style="font-size: 0.8em; padding: 4px 8px; cursor: pointer;">+ Añadir Persona Externa</button>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:10px; margin-top: 20px; border-top: 2px solid #eee; padding-top: 15px;">
          <button type="button" onclick="cerrarModal('modalEvento')" style="background:#f0f0f0; color:#333; border:none; padding:10px 15px; border-radius:4px; font-weight:600; cursor:pointer;">Cancelar</button>
          <button type="submit" id="btnGuardar" style="background:#2c3e50; color:white; border:none; padding:10px 20px; border-radius:4px; font-weight:600; cursor:pointer;">Guardar</button>
        </div>
      </form>
    </div>
  </div>`;

html = html.replace(regexModal, newModal);

// Also need to fetch recursos in `cargarTodo()` and fill `selectRecurso`, and send `recurso` in `procesarEvento`!
// Let's replace the script parts.
const regexCargarTodo = /function cargarTodo\(\) \{[\s\S]*?google\.script\.run\.withSuccessHandler\(procesarDatos\)\.obtenerDatosCompletos\(\);\s*\}/;
const replaceCargarTodo = `function cargarTodo() {
          document.getElementById('calendar-grid').innerHTML = '<p style="text-align:center; margin-top:50px; color:#777;">Cargando calendario...</p>';
          
          fetch('/api/recursos/config').then(r=>r.json()).then(recursos => {
              const sel = document.getElementById('selectRecurso');
              sel.innerHTML = '<option value="">No, ninguno</option>';
              recursos.forEach(r => sel.innerHTML += \`<option value="\${r.nombre}">\${r.nombre}</option>\`);
          });

          google.script.run.withSuccessHandler(procesarDatos).obtenerDatosCompletos();
      }`;
html = html.replace(regexCargarTodo, replaceCargarTodo);

// In `abrirModalEventos`:
const regexAbrir = /document\.querySelectorAll\('\.chk-curso'\)\.forEach\(chk => chk\.checked = true\);\s*if \(ev\.cursos && ev\.cursos !== 'TODOS'\) \{/;
const replaceAbrir = `document.getElementById('selectRecurso').value = ev.recurso || '';
            document.querySelectorAll('.chk-curso').forEach(chk => chk.checked = true);
            if (ev.cursos && ev.cursos !== 'TODOS') {`;
html = html.replace(regexAbrir, replaceAbrir);

const regexAbrirNuevo = /document\.querySelectorAll\('\.chk-curso'\)\.forEach\(chk => chk\.checked = true\);\s*toggleCursosAfectados\(\);\s*document\.getElementById\('modalTitle'\)\.innerText = "Nuevo Evento";/;
const replaceAbrirNuevo = `document.getElementById('selectRecurso').value = '';
              document.querySelectorAll('.chk-curso').forEach(chk => chk.checked = true); 
              toggleCursosAfectados();
              document.getElementById('modalTitle').innerText = "Nuevo Evento";`;
html = html.replace(regexAbrirNuevo, replaceAbrirNuevo);

// In `document.getElementById('eventoForm').onsubmit`
const regexOnSubmit = /externos: recopilarExternos\(\)\s*\}; google\.script\.run\.withSuccessHandler/;
const replaceOnSubmit = `externos: recopilarExternos(),
            recurso: this.recurso.value
        }; google.script.run.withSuccessHandler`;
html = html.replace(regexOnSubmit, replaceOnSubmit);

fs.writeFileSync('public/calendario.html', html, 'utf8');
console.log('modalEvento html updated');
