const fs = require('fs');
let html = fs.readFileSync('public/usuarios.html', 'utf8');

let newHtml = html.replace(/google\.script\.run[\s\S]*?\.obtenerUsuarios\(\);/, `
      fetch('/api/usuarios')
        .then(res => res.json())
        .then(data => {
          const tbody = document.getElementById('tablaUsuarios');
          tbody.innerHTML = '';
          data.forEach(u => {
            let tr = document.createElement('tr');
            tr.innerHTML = \`
              <td class="fw-semibold">\${u.nombre}</td>
              <td class="text-muted">\${u.email}</td>
              <td><span class="badge bg-secondary">\${u.rol}</span></td>
              <td class="text-end">
                <button class="btn btn-sm btn-outline-primary me-2" onclick="editar('\${u.email}', '\${u.nombre}', '\${u.rol}')"><i class="bi bi-pencil"></i></button>
                <button class="btn btn-sm btn-outline-danger" onclick="eliminar('\${u.email}')"><i class="bi bi-trash"></i></button>
              </td>
            \`;
            tbody.appendChild(tr);
          });
        })
        .catch(err => {
          document.getElementById('tablaUsuarios').innerHTML = \`<tr><td colspan="4" class="text-danger">\${err.message}</td></tr>\`;
        });
`);

newHtml = newHtml.replace(/google\.script\.run[\s\S]*?\.guardarUsuario\(email, rol, nombre\);/, `
      fetch('/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, rol, nombre })
      })
      .then(res => res.json())
      .then(data => {
         modalEl.hide();
         btn.disabled = false;
         btn.innerText = 'Guardar';
         Swal.fire('Éxito', data.message || 'Guardado', 'success');
         cargarUsuarios();
      })
      .catch(err => {
         btn.disabled = false;
         btn.innerText = 'Guardar';
         Swal.fire('Error', err.message, 'error');
      });
`);

newHtml = newHtml.replace(/google\.script\.run\.withSuccessHandler\(\(\) => \{[\s\S]*?\}\)\.eliminarUsuario\(email\);/, `
          fetch('/api/usuarios/' + encodeURIComponent(email), { method: 'DELETE' })
            .then(res => res.json())
            .then(data => {
              Swal.fire('Eliminado', '', 'success');
              cargarUsuarios();
            });
`);

fs.writeFileSync('public/usuarios.html', newHtml, 'utf8');
console.log('Usuarios.html migrado a fetch');
