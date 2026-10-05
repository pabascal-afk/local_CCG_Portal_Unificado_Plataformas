const fs = require('fs');
let html = fs.readFileSync('public/calendario.html', 'utf8');

// 1. Replace the inputCursos text box and checkbox label
const regexCursosHTML = /<div class="mb-3 d-flex align-items-center">\s*<input type="checkbox" id="checkBloquea"[^>]+>\s*<label[^>]+>Bloquea Evaluaciones.*?<\/label>\s*<\/div>\s*<input type="text" name="cursosAfectados" id="inputCursos"[^>]+>/g;

const replacementCursosHTML = `<div class="mb-3 d-flex align-items-center">
              <input type="checkbox" id="checkBloquea" class="form-check-input mt-0 me-2" onchange="toggleBloques(); toggleCursosAfectados();">
              <label class="fw-bold">Bloquea Evaluaciones</label>
            </div>
            <div id="areaCursosAfectados" class="hidden mb-3 border p-2 rounded bg-light" style="display: none;">
              <label class="fw-bold small mb-2 d-block">Selecciona los cursos afectados (Si seleccionas todos, bloquea el colegio entero):</label>
              <div id="checkCursosContainer" class="d-flex flex-wrap gap-2"></div>
            </div>
            <input type="hidden" id="inputCursos" value="TODOS">`;

html = html.replace(regexCursosHTML, replacementCursosHTML);

// 2. Add JavaScript to load courses and toggle
const regexJS = /function toggleBloques\(\) \{/g;
const replacementJS = `
      function toggleCursosAfectados() {
          const check = document.getElementById('checkBloquea');
          const area = document.getElementById('areaCursosAfectados');
          if(check.checked) area.style.display = 'block';
          else area.style.display = 'none';
      }

      function renderizarCheckboxesCursos(cursosDB) {
          const container = document.getElementById('checkCursosContainer');
          container.innerHTML = '';
          const cursosUnicos = new Set(cursosDB);
          
          Array.from(cursosUnicos).sort().forEach(curso => {
              container.innerHTML += \`<div class="form-check form-check-inline">
                  <input class="form-check-input chk-curso" type="checkbox" value="\${curso}" checked>
                  <label class="form-check-label">\${curso}</label>
              </div>\`;
          });
      }

      function recopilarCursosAfectados() {
          const checks = document.querySelectorAll('.chk-curso');
          if (checks.length === 0) return 'TODOS';
          
          let todosChecked = true;
          const seleccionados = [];
          checks.forEach(c => {
              if (c.checked) seleccionados.push(c.value);
              else todosChecked = false;
          });

          if (todosChecked) return 'TODOS';
          if (seleccionados.length === 0) return 'NINGUNO';
          return seleccionados.join(', ');
      }

      function function toggleBloques() {`; // keep original signature broken intentionally? No, fix regex!

html = html.replace(regexJS, replacementJS.replace('function function', 'function'));

// 3. Update eventoForm.onsubmit
const onsubmitRegex = /cursos: document\.getElementById\('inputCursos'\)\.value/g;
const onsubmitReplacement = `cursos: document.getElementById('checkBloquea').checked ? recopilarCursosAfectados() : ''`;
html = html.replace(onsubmitRegex, onsubmitReplacement);

// 4. Update modal open to load the checkboxes
const modalOpenRegex = /document\.getElementById\('inputCursos'\)\.value = ev\.cursos \|\| 'TODOS'; \} else \{ document\.getElementById\('inputCursos'\)\.value = 'TODOS';/g;
const modalOpenReplacement = `// Set checkboxes state
          document.querySelectorAll('.chk-curso').forEach(chk => chk.checked = true);
          if (ev.cursos && ev.cursos !== 'TODOS') {
              const afectados = ev.cursos.split(',').map(s => s.trim());
              document.querySelectorAll('.chk-curso').forEach(chk => {
                  chk.checked = afectados.includes(chk.value);
              });
          }
          toggleCursosAfectados();
          } else { 
            document.querySelectorAll('.chk-curso').forEach(chk => chk.checked = true); 
            toggleCursosAfectados();
          `;
html = html.replace(modalOpenRegex, modalOpenReplacement);

// 5. Trigger course fetch on load
const fetchRegex = /google\.script\.run\.withSuccessHandler\(\(respuesta\) => \{/g;
const fetchReplacement = `google.script.run.withSuccessHandler((respuesta) => {
          // Extraer cursos únicos de todos los eventos
          const cursosTotales = [];
          respuesta.eventos.forEach(e => {
              if (e.extendedProps && e.extendedProps.curso) cursosTotales.push(e.extendedProps.curso);
          });
          // Also fetch actual courses from getConfigFrontend via fetch to polyfill
          fetch('/api/rpc/getConfigFrontend', {method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({args:[]})})
             .then(r=>r.json()).then(data => {
                 if(data.result && data.result.cursos) {
                     renderizarCheckboxesCursos(data.result.cursos);
                 }
             });
          `;
html = html.replace(fetchRegex, fetchReplacement);

fs.writeFileSync('public/calendario.html', html, 'utf8');
console.log('Calendario.html actualizado con checkboxes de cursos procedimentales');
