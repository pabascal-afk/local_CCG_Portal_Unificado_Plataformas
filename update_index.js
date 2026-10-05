const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

// 1. Add "Mi Perfil" modal HTML before </body>
const perfilModal = `
  <!-- Modal Perfil Preferencias -->
  <div class="modal fade" id="modalPerfil" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title fw-bold"><i class="bi bi-person-gear"></i> Mi Perfil y Preferencias</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <h6 class="fw-bold mb-3">Notificaciones por Correo</h6>
          <div class="form-check mb-2">
            <input class="form-check-input" type="checkbox" id="chkPrefReserva">
            <label class="form-check-label small">Enviarme confirmación al guardar una Reserva de Recursos</label>
          </div>
          <div class="form-check mb-2">
            <input class="form-check-input" type="checkbox" id="chkPrefEdicion">
            <label class="form-check-label small">Avisarme si un Admin edita/cancela mis reservas</label>
          </div>
          <div class="form-check mb-2">
            <input class="form-check-input" type="checkbox" id="chkPrefRecordatorio">
            <label class="form-check-label small">Recordatorio 24hrs antes de una evaluación</label>
          </div>
          <div class="form-check mb-4">
            <input class="form-check-input" type="checkbox" id="chkPrefAviso">
            <label class="form-check-label small">Notificarme por correo de Avisos de Alta Importancia</label>
          </div>
          <button class="btn btn-primary w-100" onclick="guardarPreferencias()">Guardar Configuración</button>
        </div>
      </div>
    </div>
  </div>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
`;
html = html.replace('</body>', perfilModal + '\n</body>');

// 2. Update navigation sidebar to include Dashboard
const navStart = `<ul class="nav flex-column mb-auto">`;
const navDashboard = `<li class="nav-item">
        <a href="#" class="nav-link" onclick="loadApp('dashboard', this)" id="nav-dashboard">
          <i class="bi bi-grid-1x2"></i> Inicio / Muro
        </a>
      </li>`;
html = html.replace(navStart, navStart + "\n      " + navDashboard);

// 3. Add "Mi Perfil" button to info-usuario
const infoRegex = /<div class="p-3 text-center text-secondary" style="font-size: 0\.8rem;" id="info-usuario">[\s\S]*?<\/div>/;
const infoReplacement = `<div class="p-3 text-center text-secondary" style="font-size: 0.8rem;" id="info-usuario-container">
      <div id="info-usuario" class="mb-2 text-white">Cargando usuario...</div>
      <button class="btn btn-sm btn-outline-light w-100" onclick="abrirPerfil()"><i class="bi bi-gear"></i> Mi Perfil</button>
    </div>`;
html = html.replace(infoRegex, infoReplacement);

// 4. Update JS loadApp map
const mapRegex = /evaluaciones: "\/evaluaciones\.html",/;
const mapReplacement = `dashboard: "/dashboard.html",
            evaluaciones: "/evaluaciones.html",`;
html = html.replace(mapRegex, mapReplacement);

// 5. Change default app to dashboard
const defRegex = /document\.getElementById\('nav-evaluaciones'\)\.click\(\);/;
const defReplacement = `document.getElementById('nav-dashboard').click();`;
html = html.replace(defRegex, defReplacement);

// 6. Add JS for Perfil logic
const scriptEndRegex = /<\/script>\n<\/body>/;
const jsLogic = `
    let modalPerfilObj;
    function abrirPerfil() {
        if(!modalPerfilObj) modalPerfilObj = new bootstrap.Modal(document.getElementById('modalPerfil'));
        fetch('/api/perfil/preferencias').then(r=>r.json()).then(data => {
            document.getElementById('chkPrefReserva').checked = data.nueva_reserva;
            document.getElementById('chkPrefEdicion').checked = data.edicion_admin;
            document.getElementById('chkPrefRecordatorio').checked = data.recordatorio_eval;
            document.getElementById('chkPrefAviso').checked = data.nuevo_aviso;
            modalPerfilObj.show();
        });
    }

    function guardarPreferencias() {
        const pref = {
            nueva_reserva: document.getElementById('chkPrefReserva').checked,
            edicion_admin: document.getElementById('chkPrefEdicion').checked,
            recordatorio_eval: document.getElementById('chkPrefRecordatorio').checked,
            nuevo_aviso: document.getElementById('chkPrefAviso').checked
        };
        fetch('/api/perfil/preferencias', {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({preferencias: pref})
        }).then(r=>r.json()).then(data => {
            modalPerfilObj.hide();
            Swal.fire('Guardado', data.message, 'success');
        });
    }
`;
html = html.replace(scriptEndRegex, jsLogic + "\n  </script>\n</body>");

fs.writeFileSync('public/index.html', html, 'utf8');
console.log('index.html actualizado con Dashboard y Perfil');
