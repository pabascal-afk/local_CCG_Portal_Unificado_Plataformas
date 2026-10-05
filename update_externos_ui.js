const fs = require('fs');
let html = fs.readFileSync('public/calendario.html', 'utf8');

const oldJsRegex = /function agregarFilaExterno\(nombre='', rut='', motivo=''\) \{[\s\S]*?return externos;\s*\}/;

const newJs = `async function agregarFilaExterno(nombre='', rut='', motivo='') {
            if (nombre) {
                renderTarjetaExterno(nombre, rut, motivo);
                return;
            }
            
            const { value: formValues } = await Swal.fire({
              title: 'Añadir Invitado Externo',
              html:
                '<input id="swal-ext-nombre" class="swal2-input" placeholder="Nombre Completo" style="width: 80%;">' +
                '<input id="swal-ext-rut" class="swal2-input" placeholder="RUT (ej: 12.345.678-9)" style="width: 80%;">' +
                '<input id="swal-ext-motivo" class="swal2-input" placeholder="¿A qué viene?" style="width: 80%;">',
              focusConfirm: false,
              showCancelButton: true,
              confirmButtonText: 'Añadir',
              cancelButtonText: 'Cancelar',
              preConfirm: () => {
                const n = document.getElementById('swal-ext-nombre').value;
                const r = document.getElementById('swal-ext-rut').value;
                const m = document.getElementById('swal-ext-motivo').value;
                if (!n || !r || !m) {
                    Swal.showValidationMessage('Por favor completa todos los campos');
                    return false;
                }
                return { n, r, m };
              }
            });

            if (formValues) {
                renderTarjetaExterno(formValues.n, formValues.r, formValues.m);
            }
        }

        function renderTarjetaExterno(nombre, rut, motivo) {
            const container = document.getElementById('listaExternos');
            const id = 'ext_' + Date.now() + Math.floor(Math.random()*1000);
            const html = \`
              <div class="card mb-2 fila-externo" id="\${id}" data-nombre="\${nombre}" data-rut="\${rut}" data-motivo="\${motivo}" style="border-left: 4px solid #0d6efd;">
                <div class="card-body p-2 d-flex justify-content-between align-items-center">
                  <div>
                    <h6 class="mb-0 fw-bold text-dark" style="font-size:0.9rem;"><i class="bi bi-person-badge text-primary"></i> \${nombre}</h6>
                    <small class="text-muted" style="font-size:0.75rem;"><b>RUT:</b> \${rut} &bull; <b>Motivo:</b> \${motivo}</small>
                  </div>
                  <button type="button" class="btn btn-sm btn-outline-danger border-0" onclick="document.getElementById('\${id}').remove()">
                     <i class="bi bi-trash-fill"></i>
                  </button>
                </div>
              </div>
            \`;
            container.insertAdjacentHTML('beforeend', html);
        }

        function recopilarExternos() {
            const filas = document.querySelectorAll('.fila-externo');
            const externos = [];
            filas.forEach(f => {
                externos.push({
                    nombre: f.dataset.nombre,
                    rut: f.dataset.rut,
                    motivo: f.dataset.motivo
                });
            });
            return externos;
        }`;

html = html.replace(oldJsRegex, newJs);

fs.writeFileSync('public/calendario.html', html, 'utf8');
console.log('UI de externos modificada a Pop-up y tarjetas.');
