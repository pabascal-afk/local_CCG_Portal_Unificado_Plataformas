const fs = require('fs');
let html = fs.readFileSync('public/calendario.html', 'utf8');

const oldRender = /function renderizarCheckboxesCursos\(cursosDB\) \{[\s\S]*?\}\s*function recopilarCursosAfectados\(\)/;

const newRender = `function renderizarCheckboxesCursos(cursosDB) {
          const container = document.getElementById('checkCursosContainer');
          
          let ui = \`
            <div class="mb-2 d-flex justify-content-between align-items-center w-100" style="border-bottom: 1px solid #ddd; padding-bottom: 5px;">
               <span class="text-muted fw-bold">Selector Rápido:</span>
               <div>
                 <button type="button" class="btn btn-sm btn-outline-success py-0 px-2 fw-bold" onclick="document.querySelectorAll('.chk-curso').forEach(c => c.checked = true);">Todos</button>
                 <button type="button" class="btn btn-sm btn-outline-danger py-0 px-2 fw-bold" onclick="document.querySelectorAll('.chk-curso').forEach(c => c.checked = false);">Ninguno</button>
               </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; width: 100%;">
          \`;

          const cursosUnicos = Array.from(new Set(cursosDB)).sort();
          
          cursosUnicos.forEach(curso => {
              ui += \`<div class="form-check m-0">
                  <input class="form-check-input chk-curso" type="checkbox" value="\${curso}" checked>
                  <label class="form-check-label">\${curso}</label>
              </div>\`;
          });
          
          ui += \`</div>\`;
          container.innerHTML = ui;
      }

      function recopilarCursosAfectados()`;

html = html.replace(oldRender, newRender);

// Also we need to remove the "d-flex flex-wrap" classes from checkCursosContainer so it doesn't break the grid width
const containerRegex = /<div id="checkCursosContainer" class="d-flex flex-wrap gap-2" style="font-size: 0\.8em;"><\/div>/;
const containerReplacement = `<div id="checkCursosContainer" style="font-size: 0.8em; width: 100%;"></div>`;
html = html.replace(containerRegex, containerReplacement);


fs.writeFileSync('public/calendario.html', html, 'utf8');
console.log('UI checkboxes actualizada a 2 columnas con selector rapido');
