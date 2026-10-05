const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

const jsLogic = `
  <script>
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
  </script>
</body>`;

html = html.replace('</body>', jsLogic);

fs.writeFileSync('public/index.html', html, 'utf8');
console.log('JS logic injected successfully.');
