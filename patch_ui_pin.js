const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

const regexModal = /<h6 class="fw-bold mb-3 mt-1"><i class="bi bi-pin-angle"><\/i> Pestaña de Inicio<\/h6>/;
const replaceModal = `<h6 class="fw-bold mb-3 mt-3"><i class="bi bi-shield-lock"></i> Acceso de Emergencia (Sin Internet)</h6>
            <div class="mb-4">
              <label class="form-label small">PIN Maestro Local</label>
              <input type="password" id="inputPinLocal" class="form-control form-control-sm" placeholder="1234">
              <small class="text-muted">Con este PIN podrás ingresar desde cualquier red local si falla Google.</small>
            </div>
            <h6 class="fw-bold mb-3 mt-1"><i class="bi bi-pin-angle"></i> Pestaña de Inicio</h6>`;

html = html.replace(regexModal, replaceModal);

const regexAbrir = /document\.getElementById\('selectPrefTab'\)\.value = data\.default_tab \|\| 'dashboard';/;
const replaceAbrir = `document.getElementById('selectPrefTab').value = data.default_tab || 'dashboard';
            document.getElementById('inputPinLocal').value = data.pin_actual || '';`;
html = html.replace(regexAbrir, replaceAbrir);

const regexGuardarBody = /body: JSON\.stringify\(\{ preferencias: pref \}\)/;
const replaceGuardarBody = `body: JSON.stringify({ preferencias: pref, pin: document.getElementById('inputPinLocal').value })`;
html = html.replace(regexGuardarBody, replaceGuardarBody);

fs.writeFileSync('public/index.html', html, 'utf8');
console.log('index.html updated with pin UI');
