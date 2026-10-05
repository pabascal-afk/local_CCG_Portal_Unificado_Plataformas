const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

// 1. Update DOMContentLoaded
const regexDCL = /document\.getElementById\('nav-dashboard'\)\.click\(\);/g;
const replaceDCL = `fetch('/api/perfil/preferencias').then(r=>r.json()).then(pref => {
               const defaultTab = pref.default_tab || 'dashboard';
               const navBtn = document.getElementById('nav-' + defaultTab);
               if (navBtn) navBtn.click();
               else document.getElementById('nav-dashboard').click();
            });`;
html = html.replace(regexDCL, replaceDCL);

// 2. Add select box to modal HTML
const regexModal = /<h6 class="fw-bold mb-3">Notificaciones por Correo<\/h6>/;
const replaceModal = `<h6 class="fw-bold mb-3 mt-1"><i class="bi bi-pin-angle"></i> Pestaña de Inicio</h6>
            <div class="mb-4">
              <select class="form-select" id="selectPrefTab">
                 <option value="dashboard">Inicio / Muro</option>
                 <option value="evaluaciones">Calendario de Pruebas</option>
                 <option value="calendario">Calendario Académico</option>
                 <option value="horarios">Visor de Horarios</option>
                 <option value="recursos">Reserva de Recursos</option>
              </select>
              <small class="text-muted">Esta pestaña se abrirá automáticamente al iniciar sesión.</small>
            </div>
            
            <h6 class="fw-bold mb-3">Notificaciones por Correo</h6>`;
html = html.replace(regexModal, replaceModal);

// 3. Update abrirPerfil
const regexAbrir = /document\.getElementById\('chkPrefAviso'\)\.checked = data\.nuevo_aviso;/;
const replaceAbrir = `document.getElementById('chkPrefAviso').checked = data.nuevo_aviso;
            document.getElementById('selectPrefTab').value = data.default_tab || 'dashboard';`;
html = html.replace(regexAbrir, replaceAbrir);

// 4. Update guardarPreferencias
const regexGuardar = /nuevo_aviso: document\.getElementById\('chkPrefAviso'\)\.checked\s*\};/;
const replaceGuardar = `nuevo_aviso: document.getElementById('chkPrefAviso').checked,
            default_tab: document.getElementById('selectPrefTab').value
        };`;
html = html.replace(regexGuardar, replaceGuardar);


fs.writeFileSync('public/index.html', html, 'utf8');
console.log('index.html updated with default tab logic');
