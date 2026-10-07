const fs = require('fs');
let code = fs.readFileSync('public/dashboard.html', 'utf8');

const targetButton = `<div class="mb-3">
            <label class="form-label fw-bold small">Enlace a Documento (Google Docs, Drive)</label>
            <div class="input-group">
                <input type="url" id="inEnvioLink" class="form-control" placeholder="https://docs.google.com/...">
                <button class="btn btn-outline-success" type="button" onclick="abrirDrivePicker()"><i class="bi bi-google"></i> Drive</button>
            </div>
          </div>`;

const replacementButton = `<div class="mb-3">
            <label class="form-label fw-bold small">Enlace Google Docs (Opcional)</label>
            <input type="url" id="inEnvioLink" class="form-control" placeholder="https://docs.google.com/...">
          </div>`;

code = code.replace(targetButton, replacementButton);

const scriptToRemove = `async function abrirDrivePicker() {
        const res = await fetch('/api/config/gas');
        const data = await res.json();
        if (!data.url) return Swal.fire("Error", "GAS_WEB_APP_URL no configurado", "error");
        
        const pickerUrl = data.url + '?mode=picker';
        
        // Abrir popup centrado
        const w = 800; const h = 600;
        const left = (window.screen.width/2)-(w/2);
        const top = (window.screen.height/2)-(h/2);
        window.open(pickerUrl, 'Google Drive', 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width='+w+', height='+h+', top='+top+', left='+left);
    }

    // Escuchar el mensaje desde el Popup
    window.addEventListener('message', function(event) {
        if (event.data && event.data.type === 'drivePickerResult') {
            document.getElementById('inEnvioLink').value = event.data.url;
            Swal.fire({
                toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, 
                icon: 'success', 
                title: 'Documento adjuntado: ' + event.data.name
            });
        }
    });`;

code = code.replace(scriptToRemove, '');

fs.writeFileSync('public/dashboard.html', code, 'utf8');
console.log("dashboard.html restaurado");
