const fs = require('fs');
let code = fs.readFileSync('public/dashboard.html', 'utf8');

const targetRender = "<span class=\"fw-bold text-primary\">${ev.curso} - ${ev.asignatura} <span class='badge bg-info ms-2'>${ev.fecha}</span></span><br>";
const replacementRender = "<span class=\"fw-bold text-primary\">${ev.curso} - ${ev.asignatura} <span class='badge bg-info ms-2'>${ev.fecha}</span></span>\n  ${ev.estado_doc === 'Enviada' ? \"<span class='badge bg-success float-end mt-1'>Enviada</span>\" : `<button class='btn btn-sm btn-outline-primary float-end p-1 ms-2' onclick='abrirModalEnvio(\"${ev.id}\", \"${ev.curso}\", \"${ev.asignatura}\")'><i class='bi bi-paperclip'></i> Enviar</button>`}<br>";
code = code.replace(targetRender, replacementRender);

const targetHeader = '<div class="card-header"><i class="bi bi-calendar-check"></i> Mis Próximas Evaluaciones</div>';
const replacementHeader = `<div class="card-header d-flex justify-content-between align-items-center">
  <span><i class="bi bi-calendar-check"></i> Mis Próximas Evaluaciones</span>
  <button class="btn btn-sm btn-link p-0" onclick="abrirModalTodasEvals()">Ver todas</button>
</div>`;
code = code.replace(targetHeader, replacementHeader);

const modalHtml = `
  <!-- Modal Enviar Documento -->
  <div class="modal fade" id="modalEnvio" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title fw-bold">Adjuntar y Enviar Evaluación</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <p class="small text-muted mb-4">Esta evaluación será enviada automáticamente al Coordinador Pedagógico correspondiente a <b id="lblEnvioCursoAsig"></b>.</p>
          <input type="hidden" id="inEnvioId">
          <div class="mb-3">
            <label class="form-label fw-bold small">Enlace Google Docs (Opcional)</label>
            <input type="url" id="inEnvioLink" class="form-control" placeholder="https://docs.google.com/...">
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold small">O Adjuntar Archivo (Word/PDF)</label>
            <input type="file" id="inEnvioFile" class="form-control">
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold small">Instrucciones para Coordinación/Impresión</label>
            <textarea id="inEnvioInstr" class="form-control" rows="3" placeholder="Ej: Imprimir 30 copias a color..."></textarea>
          </div>
          <button class="btn btn-primary w-100" id="btnEnviarEv" onclick="enviarEvaluacionDoc()">Enviar a Coordinación</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal Todas Evaluaciones -->
  <div class="modal fade" id="modalTodasEvals" tabindex="-1">
    <div class="modal-dialog modal-lg modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title fw-bold">Todas mis Evaluaciones</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body" id="todasEvals-container">
          Cargando...
        </div>
      </div>
    </div>
  </div>
`;

code = code.replace("<!-- Modal Nuevo Aviso -->", modalHtml + "\n  <!-- Modal Nuevo Aviso -->");

const scriptHtml = `
    let modalEnvio;
    let modalTodas;
    document.addEventListener('DOMContentLoaded', () => {
       modalEnvio = new bootstrap.Modal(document.getElementById('modalEnvio'));
       modalTodas = new bootstrap.Modal(document.getElementById('modalTodasEvals'));
    });

    function abrirModalEnvio(id, curso, asig) {
        document.getElementById('inEnvioId').value = id;
        document.getElementById('lblEnvioCursoAsig').innerText = curso + ' - ' + asig;
        document.getElementById('inEnvioLink').value = '';
        document.getElementById('inEnvioFile').value = '';
        document.getElementById('inEnvioInstr').value = '';
        modalEnvio.show();
    }

    async function enviarEvaluacionDoc() {
        const id = document.getElementById('inEnvioId').value;
        const link = document.getElementById('inEnvioLink').value;
        const fileInput = document.getElementById('inEnvioFile');
        const instr = document.getElementById('inEnvioInstr').value;

        if (!link && fileInput.files.length === 0) {
            return Swal.fire("Error", "Debes ingresar un enlace o adjuntar un archivo.", "error");
        }

        const formData = new FormData();
        formData.append('link_doc', link);
        formData.append('instrucciones', instr);
        if (fileInput.files.length > 0) {
            formData.append('archivo', fileInput.files[0]);
        }

        const btn = document.getElementById('btnEnviarEv');
        btn.disabled = true;
        btn.innerText = "Enviando correo...";

        try {
            const res = await fetch('/api/envios/enviar/' + id, {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            
            btn.disabled = false;
            btn.innerText = "Enviar a Coordinación";

            if (res.ok) {
                modalEnvio.hide();
                Swal.fire("Éxito", data.message, "success");
                cargarDashboard(); 
                if(modalTodas._isShown) abrirModalTodasEvals(); // refresh
            } else {
                Swal.fire("Error", data.error, "error");
            }
        } catch (e) {
            btn.disabled = false;
            btn.innerText = "Enviar a Coordinación";
            Swal.fire("Error de red", e.message, "error");
        }
    }

    async function abrirModalTodasEvals() {
        modalTodas.show();
        const cont = document.getElementById('todasEvals-container');
        cont.innerHTML = '<p class="text-center mt-4">Cargando...</p>';
        try {
            const res = await fetch('/api/evaluaciones/mis-evaluaciones-todas');
            if(res.ok) {
                const data = await res.json();
                if(data.length === 0) {
                    cont.innerHTML = '<p class="text-center text-muted">No tienes evaluaciones.</p>';
                    return;
                }
                cont.innerHTML = data.map(ev => "<div class='item-resumen p-2 border-bottom'><span class='fw-bold text-primary'>" + ev.curso + " - " + ev.asignatura + " <span class='badge bg-info ms-2'>" + ev.fecha + "</span></span>" + (ev.estado_doc === 'Enviada' ? "<span class='badge bg-success float-end mt-1'>Enviada</span>" : "<button class='btn btn-sm btn-outline-primary float-end p-1 ms-2' onclick='modalTodas.hide(); abrirModalEnvio(\"" + ev.id + "\", \"" + ev.curso + "\", \"" + ev.asignatura + "\")'><i class='bi bi-paperclip'></i> Enviar</button>") + "<br><span class='small text-muted'>Tipo: " + ev.tipo + "</span></div>").join('');
            } else {
                const d = await fetch('/api/dashboard/me').then(r=>r.json());
                cont.innerHTML = d.evaluaciones.map(ev => "<div class='item-resumen p-2 border-bottom'><span class='fw-bold text-primary'>" + ev.curso + " - " + ev.asignatura + " <span class='badge bg-info ms-2'>" + ev.fecha + "</span></span>" + (ev.estado_doc === 'Enviada' ? "<span class='badge bg-success float-end mt-1'>Enviada</span>" : "<button class='btn btn-sm btn-outline-primary float-end p-1 ms-2' onclick='modalTodas.hide(); abrirModalEnvio(\"" + ev.id + "\", \"" + ev.curso + "\", \"" + ev.asignatura + "\")'><i class='bi bi-paperclip'></i> Enviar</button>") + "<br><span class='small text-muted'>Tipo: " + ev.tipo + "</span></div>").join('');
            }
        } catch(e) {
            cont.innerHTML = '<p class="text-danger">Error cargando evaluaciones</p>';
        }
    }
`;

code = code.replace("async function cargarDashboard() {", scriptHtml + "\n\n    async function cargarDashboard() {");

fs.writeFileSync('public/dashboard.html', code, 'utf8');
console.log("dashboard.html actualizado con envios v2");
