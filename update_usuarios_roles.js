const fs = require('fs');
let html = fs.readFileSync('public/usuarios.html', 'utf8');

// 1. Add "Gestionar Roles" button
const btnRegex = /<button class="btn btn-primary fw-bold" onclick="abrirModal\(\)">\+ Nuevo Usuario<\/button>/;
const btnReplacement = `<button class="btn btn-outline-secondary fw-bold me-2" onclick="abrirModalRoles()"><i class="bi bi-shield-lock"></i> Gestionar Roles</button>
      <button class="btn btn-primary fw-bold" onclick="abrirModal()">+ Nuevo Usuario</button>`;
html = html.replace(btnRegex, btnReplacement);

// 2. Add Roles Modal
const modalRoles = `
  <!-- Modal Roles -->
  <div class="modal fade" id="modalRoles" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header bg-dark text-white">
          <h5 class="modal-title fw-bold">Gestión de Roles y Permisos</h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <div class="row">
            <div class="col-md-5 border-end">
              <h6>Roles Actuales</h6>
              <ul class="list-group list-group-sm" id="listaRoles"></ul>
              <button class="btn btn-sm btn-success w-100 mt-2" onclick="nuevoRol()">+ Crear Nuevo Rol</button>
            </div>
            <div class="col-md-7">
              <h6 id="tituloEdicionRol">Editar Rol</h6>
              <form id="formRol" onsubmit="guardarRol(event)">
                <input type="hidden" id="idRolEditar">
                <div class="mb-2">
                  <label class="form-label small fw-bold">Nombre del Rol</label>
                  <input type="text" id="inNombreRol" class="form-control form-control-sm" required>
                </div>
                <div class="mb-2">
                  <label class="form-label small fw-bold">Permisos (Checkboxes)</label>
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="chkAdminGeneral">
                    <label class="form-check-label small" for="chkAdminGeneral">
                      <b>Administrador General:</b> Acceso total al panel de sistema (Bases de datos, Cierre de plataforma, etc).
                    </label>
                  </div>
                  <div class="form-check mt-2">
                    <input class="form-check-input" type="checkbox" id="chkAgendar">
                    <label class="form-check-label small" for="chkAgendar">
                      <b>Agendamiento y Bloqueos (Modo Dios):</b> Puede agendar pruebas para cualquier curso/materia saltándose la malla, y bloquear el Calendario Académico.
                    </label>
                  </div>
                </div>
                <button type="submit" class="btn btn-primary btn-sm w-100 mt-2">Guardar Rol</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
`;
html = html.replace("</body>", modalRoles + "\n</body>");

// 3. Add JS for roles
const jsRoles = `
    let rolesConfigCache = [];
    
    async function cargarRolesGlobales() {
        const res = await fetch('/api/roles');
        rolesConfigCache = await res.json();
        
        // Popular el select de roles en el modal de usuario
        const select = document.getElementById('inRol');
        const valAnterior = select.value;
        select.innerHTML = '';
        rolesConfigCache.forEach(r => {
            select.innerHTML += \`<option value="\${r.nombre}">\${r.nombre}</option>\`;
        });
        if (valAnterior) select.value = valAnterior;
    }
    
    function abrirModalRoles() {
        renderListaRoles();
        nuevoRol();
        new bootstrap.Modal(document.getElementById('modalRoles')).show();
    }
    
    function renderListaRoles() {
        const ul = document.getElementById('listaRoles');
        ul.innerHTML = '';
        rolesConfigCache.forEach(r => {
            ul.innerHTML += \`<li class="list-group-item list-group-item-action d-flex justify-content-between align-items-center" style="cursor:pointer;" onclick="editarRol(\${r.id})">
                \${r.nombre}
                <button class="btn btn-sm btn-outline-danger py-0 px-1" onclick="eliminarRol(event, \${r.id})">X</button>
            </li>\`;
        });
    }
    
    function nuevoRol() {
        document.getElementById('idRolEditar').value = '';
        document.getElementById('inNombreRol').value = '';
        document.getElementById('chkAdminGeneral').checked = false;
        document.getElementById('chkAgendar').checked = false;
        document.getElementById('tituloEdicionRol').innerText = 'Nuevo Rol';
    }
    
    function editarRol(id) {
        const r = rolesConfigCache.find(x => x.id === id);
        if(!r) return;
        document.getElementById('idRolEditar').value = r.id;
        document.getElementById('inNombreRol').value = r.nombre;
        document.getElementById('tituloEdicionRol').innerText = 'Editar Rol';
        
        let p = { esAdminGeneral: false, puedeAgendarSinRestricciones: false };
        try { p = JSON.parse(r.permisos); } catch(e){}
        
        document.getElementById('chkAdminGeneral').checked = p.esAdminGeneral || false;
        document.getElementById('chkAgendar').checked = p.puedeAgendarSinRestricciones || false;
    }
    
    async function guardarRol(e) {
        e.preventDefault();
        const id = document.getElementById('idRolEditar').value;
        const nombre = document.getElementById('inNombreRol').value;
        const permisos = {
            esAdminGeneral: document.getElementById('chkAdminGeneral').checked,
            puedeAgendarSinRestricciones: document.getElementById('chkAgendar').checked
        };
        
        if (id) {
            await fetch('/api/roles/' + id, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ nombre, permisos }) });
        } else {
            await fetch('/api/roles', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ nombre, permisos }) });
        }
        
        await cargarRolesGlobales();
        renderListaRoles();
        nuevoRol();
        Swal.fire('Guardado', 'Rol actualizado con éxito', 'success');
    }
    
    async function eliminarRol(e, id) {
        e.stopPropagation();
        if(confirm('¿Estás seguro de eliminar este rol?')) {
            await fetch('/api/roles/' + id, { method: 'DELETE' });
            await cargarRolesGlobales();
            renderListaRoles();
            nuevoRol();
        }
    }
`;

// Insert the jsRoles before document.addEventListener('DOMContentLoaded'
html = html.replace("document.addEventListener('DOMContentLoaded',", jsRoles + "\n    document.addEventListener('DOMContentLoaded',");

// Add `await cargarRolesGlobales();` inside DOMContentLoaded
html = html.replace("cargarUsuarios();", "await cargarRolesGlobales();\n      cargarUsuarios();");

fs.writeFileSync('public/usuarios.html', html, 'utf8');
console.log('usuarios.html actualizado con editor de roles');
