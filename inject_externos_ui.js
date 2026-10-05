const fs = require('fs');
let html = fs.readFileSync('public/calendario.html', 'utf8');

const regexArea = /<input type="hidden" id="inputCursos" value="TODOS">/;
const replacementArea = `<input type="hidden" id="inputCursos" value="TODOS">
          
          <!-- Externos UI -->
          <div class="mt-3 p-2 border rounded" style="background: #fdfdfe;">
            <label class="fw-bold small d-block mb-1 text-secondary"><i class="bi bi-people"></i> Invitados Externos (Requieren visación)</label>
            <div id="listaExternos" class="mb-2"></div>
            <button type="button" class="btn btn-sm btn-outline-secondary py-0" onclick="agregarFilaExterno()">+ Añadir Persona Externa</button>
          </div>
`;
html = html.replace(regexArea, replacementArea);

const regexJs = /function toggleCursosAfectados\(\) \{/;
const replacementJs = `
        function agregarFilaExterno(nombre='', rut='', motivo='') {
            const container = document.getElementById('listaExternos');
            const id = 'ext_' + Date.now() + Math.floor(Math.random()*1000);
            const html = \`
              <div class="d-flex gap-2 mb-2 align-items-center fila-externo" id="\${id}">
                <input type="text" class="form-control form-control-sm ext-nombre" placeholder="Nombre Completo" value="\${nombre}" required>
                <input type="text" class="form-control form-control-sm ext-rut" placeholder="RUT" value="\${rut}" required style="width: 120px;">
                <input type="text" class="form-control form-control-sm ext-motivo" placeholder="A qué viene" value="\${motivo}" required>
                <button type="button" class="btn btn-sm btn-danger py-0 px-2" onclick="document.getElementById('\${id}').remove()">X</button>
              </div>
            \`;
            container.insertAdjacentHTML('beforeend', html);
        }

        function recopilarExternos() {
            const filas = document.querySelectorAll('.fila-externo');
            const externos = [];
            filas.forEach(f => {
                externos.push({
                    nombre: f.querySelector('.ext-nombre').value,
                    rut: f.querySelector('.ext-rut').value,
                    motivo: f.querySelector('.ext-motivo').value
                });
            });
            return externos;
        }

        function toggleCursosAfectados() {`;
html = html.replace(regexJs, replacementJs);

// Find the form submission logic to include externos
const regexSubmit = /cursos: document\.getElementById\('checkBloquea'\)\.checked \? recopilarCursosAfectados\(\) : '' \};/;
const replacementSubmit = `cursos: document.getElementById('checkBloquea').checked ? recopilarCursosAfectados() : '',
          externos: recopilarExternos()
        };`;
html = html.replace(regexSubmit, replacementSubmit);

// When editing an event, we need to clear the list and re-populate it
const regexEdit = /const m = \(ev\.mes \+ 1\)\.toString\(\)\.padStart\(2,'0'\);/;
const replacementEdit = `const m = (ev.mes + 1).toString().padStart(2,'0');
          document.getElementById('listaExternos').innerHTML = '';
          if(ev.externos) {
              try { 
                  const extList = typeof ev.externos === 'string' ? JSON.parse(ev.externos) : ev.externos;
                  extList.forEach(ex => agregarFilaExterno(ex.nombre, ex.rut, ex.motivo));
              } catch(e){}
          }`;
html = html.replace(regexEdit, replacementEdit);

// Clear form completely on New Event
const regexNewEvent = /document\.getElementById\('modalTitle'\)\.innerText = "Nuevo Evento";/;
const replacementNewEvent = `document.getElementById('modalTitle').innerText = "Nuevo Evento";
              document.getElementById('listaExternos').innerHTML = '';`;
html = html.replace(regexNewEvent, replacementNewEvent);


fs.writeFileSync('public/calendario.html', html, 'utf8');
console.log('UI de invitados externos inyectada en calendario.html');
