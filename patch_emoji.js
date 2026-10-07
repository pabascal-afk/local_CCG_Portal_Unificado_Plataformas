const fs = require('fs');
let code = fs.readFileSync('public/evaluaciones.html', 'utf8');

const targetForm = `<form id="formNuevoTipo" class="d-flex gap-2">
              <input type="text" class="form-control" id="inNuevoTipo" placeholder="Ej: 🗣️ Disertaci&oacute;n" required>`;

const newForm = `<form id="formNuevoTipo" class="d-flex gap-2">
              <select class="form-select text-center fs-5 px-1" id="inNuevoEmoji" style="width: 70px;" required title="Selecciona un icono">
                  <option value="📝">📝</option>
                  <option value="🗣️">🗣️</option>
                  <option value="📂">📂</option>
                  <option value="🔄">🔄</option>
                  <option value="⏱️">⏱️</option>
                  <option value="💻">💻</option>
                  <option value="📖">📖</option>
                  <option value="🏃">🏃</option>
                  <option value="🎨">🎨</option>
                  <option value="🎵">🎵</option>
                  <option value="🧪">🧪</option>
                  <option value="🧠">🧠</option>
                  <option value="📐">📐</option>
                  <option value="⭐">⭐</option>
              </select>
              <input type="text" class="form-control" id="inNuevoTipo" placeholder="Nombre (Ej: Exposición Oral)" required>`;

code = code.replace(targetForm, newForm);

// Now update the JS logic
const targetJS = `const nombre = document.getElementById('inNuevoTipo').value.trim();`;
const newJS = `const emoji = document.getElementById('inNuevoEmoji').value;
            const nombre = emoji + " " + document.getElementById('inNuevoTipo').value.trim();`;

code = code.replace(targetJS, newJS);

fs.writeFileSync('public/evaluaciones.html', code, 'utf8');
console.log("Emoji selector añadido");
