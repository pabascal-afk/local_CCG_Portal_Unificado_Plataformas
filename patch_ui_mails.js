const fs = require('fs');
let code = fs.readFileSync('public/coordinadores.html', 'utf8');

const target = '<h2 class="mb-4">Motor de Enrutamiento de Evaluaciones</h2>';
const rep = `<div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Motor de Enrutamiento de Evaluaciones</h2>
      <div class="form-check form-switch fs-5">
        <input class="form-check-input" type="checkbox" id="chkMails" onchange="toggleMails()">
        <label class="form-check-label" for="chkMails">Envío de Correos Activado</label>
      </div>
    </div>`;
code = code.replace(target, rep);

const scriptTarget = 'cargarCoords();';
const scriptRep = `
    async function cargarConfigMails() {
        const d = await fetch('/api/config/emails').then(r=>r.json());
        document.getElementById('chkMails').checked = d.activados;
    }
    async function toggleMails() {
        const activados = document.getElementById('chkMails').checked;
        await fetch('/api/config/emails', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({activados})
        });
        Swal.fire({
            toast: true, position: 'top-end', showConfirmButton: false, timer: 2000, 
            icon: activados ? 'success' : 'warning', 
            title: activados ? 'Mails Activados' : 'Mails Apagados'
        });
    }
    cargarConfigMails();
    cargarCoords();`;
code = code.replace(scriptTarget, scriptRep);

fs.writeFileSync('public/coordinadores.html', code, 'utf8');
console.log('UI boton mails añadida');
