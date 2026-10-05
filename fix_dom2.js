const fs = require('fs');
let html = fs.readFileSync('public/calendario.html', 'utf8');

// The areaBloques div ends after the <div id="checksBloquesIndividuales"> ... </div></div>
// Let's match up to <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:15px;">
const regex = /<\/div>\s*<\/div>\s*<div style="display:flex; justify-content:flex-end; gap:8px; margin-top:15px;">/;
const replacement = `</div>
          </div>
          <div id="areaCursosAfectados" class="mb-3 border p-2 rounded bg-light" style="display: none; margin-top: 10px;">
              <label class="fw-bold small mb-2 d-block">Selecciona los cursos afectados (Si seleccionas todos, bloquea el colegio entero):</label>
              <div id="checkCursosContainer" class="d-flex flex-wrap gap-2" style="font-size: 0.8em;"></div>
          </div>
          <input type="hidden" id="inputCursos" value="TODOS">
          <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:15px;">`;

html = html.replace(regex, replacement);
fs.writeFileSync('public/calendario.html', html, 'utf8');
console.log('Ahora SI inyectado DOM de areaCursosAfectados');
