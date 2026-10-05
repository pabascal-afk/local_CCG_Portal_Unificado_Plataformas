const fs = require('fs');
let html = fs.readFileSync('public/calendario.html', 'utf8');

// 1. Remove the old inputCursos div entirely
const oldCursosRegex = /<div style="margin-top: 10px; padding: 10px; background: #fff3cd; border-radius: 5px; border: 1px solid #ffe69c;">[\s\S]*?<\/small>\s*<\/div>/g;
html = html.replace(oldCursosRegex, '');

// 2. Inject areaCursosAfectados BELOW areaBloques
const areaBloquesRegex = /<\/div>\s*<div class="form-group" style="margin-top: 15px; text-align: right;">/g;
const areaCursosAfectadosHTML = `</div>
          
          <div id="areaCursosAfectados" class="mb-3 border p-2 rounded bg-light" style="display: none; margin-top: 10px;">
              <label class="fw-bold small mb-2 d-block">Selecciona los cursos afectados (Si seleccionas todos, bloquea el colegio entero):</label>
              <div id="checkCursosContainer" class="d-flex flex-wrap gap-2" style="font-size: 0.8em;"></div>
          </div>
          <input type="hidden" id="inputCursos" value="TODOS">
          
          <div class="form-group" style="margin-top: 15px; text-align: right;">`;
html = html.replace(areaBloquesRegex, areaCursosAfectadosHTML);

// 3. Fix toggleBloques() to also trigger toggleCursosAfectados()
const checkBloqueaRegex = /<input type="checkbox" id="checkBloquea" onchange="toggleBloques\(\)">/;
const checkBloqueaReplacement = `<input type="checkbox" id="checkBloquea" onchange="toggleBloques(); toggleCursosAfectados();">`;
html = html.replace(checkBloqueaRegex, checkBloqueaReplacement);

fs.writeFileSync('public/calendario.html', html, 'utf8');
console.log('DOM inyectado correctamente');
