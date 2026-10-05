const fs = require('fs');
let html = fs.readFileSync('public/usuarios.html', 'utf8');

const regexRolesUI = /<div class="mb-2">\s*<label class="form-label small fw-bold">Permisos \(Checkboxes\)<\/label>[\s\S]*?<\/div>\s*<button type="submit" class="btn btn-primary btn-sm w-100 mt-2">Guardar Rol<\/button>/;

const newRolesUI = `
                <div class="mb-3" style="max-height: 400px; overflow-y: auto;">
                  <h6 class="fw-bold text-primary border-bottom pb-1 mb-2 mt-2">1. Panel de Administración</h6>
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="chkGestUsuarios">
                    <label class="form-check-label small" for="chkGestUsuarios">Gestionar Usuarios y Roles</label>
                  </div>
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="chkExportar">
                    <label class="form-check-label small" for="chkExportar">Exportar y Administrar Bases de Datos</label>
                  </div>
                  <div class="form-check mb-2">
                    <input class="form-check-input" type="checkbox" id="chkApagar">
                    <label class="form-check-label small" for="chkApagar">Apagar/Cerrar el Sistema Globalmente</label>
                  </div>
                  
                  <h6 class="fw-bold text-success border-bottom pb-1 mb-2">2. Reservas y Evaluaciones</h6>
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="chkMalla">
                    <label class="form-check-label small" for="chkMalla">Ignorar la Malla Curricular (Cualquier ramo y día)</label>
                  </div>
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="chkLaboratorios">
                    <label class="form-check-label small" for="chkLaboratorios">Pedir Laboratorios sin restricción docente</label>
                  </div>
                  <div class="form-check mb-2">
                    <input class="form-check-input" type="checkbox" id="chkBloqRecursos">
                    <label class="form-check-label small" for="chkBloqRecursos">Inhabilitar temporalmente un recurso</label>
                  </div>

                  <h6 class="fw-bold text-danger border-bottom pb-1 mb-2">3. Calendario Académico Institucional</h6>
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="chkBloqDias">
                    <label class="form-check-label small" for="chkBloqDias">Bloquear fechas y evaluaciones del colegio</label>
                  </div>
                  <div class="mt-2">
                    <label class="form-label small fw-bold mb-1">Categorías de eventos permitidas:</label>
                    <input type="text" id="inCategorias" class="form-control form-control-sm" placeholder="Ej: Convivencia Escolar (Usa * para todas)">
                    <small class="text-muted d-block" style="font-size: 10px;">Si se deja en blanco, no podrá crear eventos en el calendario grande.</small>
                  </div>
                </div>
                <button type="submit" class="btn btn-primary btn-sm w-100">Guardar Rol</button>
`;

html = html.replace(regexRolesUI, newRolesUI);

// Now update the JS logic that sets/gets these values
const regexNuevo = /function nuevoRol\(\) \{[\s\S]*?document\.getElementById\('chkAgendar'\)\.checked = false;\s*document\.getElementById\('tituloEdicionRol'\)\.innerText = 'Nuevo Rol';\s*\}/;
const newNuevo = `function nuevoRol() {
        document.getElementById('idRolEditar').value = '';
        document.getElementById('inNombreRol').value = '';
        document.getElementById('chkGestUsuarios').checked = false;
        document.getElementById('chkExportar').checked = false;
        document.getElementById('chkApagar').checked = false;
        document.getElementById('chkMalla').checked = false;
        document.getElementById('chkLaboratorios').checked = false;
        document.getElementById('chkBloqRecursos').checked = false;
        document.getElementById('chkBloqDias').checked = false;
        document.getElementById('inCategorias').value = '';
        document.getElementById('tituloEdicionRol').innerText = 'Nuevo Rol';
    }`;
html = html.replace(regexNuevo, newNuevo);

const regexEditar = /document\.getElementById\('chkAdminGeneral'\)\.checked = p\.esAdminGeneral \|\| false;\s*document\.getElementById\('chkAgendar'\)\.checked = p\.puedeAgendarSinRestricciones \|\| false;/;
const newEditar = `document.getElementById('chkGestUsuarios').checked = p.gestionarUsuarios || false;
        document.getElementById('chkExportar').checked = p.exportarBD || false;
        document.getElementById('chkApagar').checked = p.apagarSistema || false;
        document.getElementById('chkMalla').checked = p.ignorarMalla || false;
        document.getElementById('chkLaboratorios').checked = p.pedirLaboratorios || false;
        document.getElementById('chkBloqRecursos').checked = p.bloquearRecursos || false;
        document.getElementById('chkBloqDias').checked = p.bloquearDias || false;
        document.getElementById('inCategorias').value = p.categorias || '';`;
html = html.replace(regexEditar, newEditar);

const regexGuardar = /const permisos = \{\s*esAdminGeneral: document\.getElementById\('chkAdminGeneral'\)\.checked,\s*puedeAgendarSinRestricciones: document\.getElementById\('chkAgendar'\)\.checked\s*\};/;
const newGuardar = `const permisos = {
            gestionarUsuarios: document.getElementById('chkGestUsuarios').checked,
            exportarBD: document.getElementById('chkExportar').checked,
            apagarSistema: document.getElementById('chkApagar').checked,
            ignorarMalla: document.getElementById('chkMalla').checked,
            pedirLaboratorios: document.getElementById('chkLaboratorios').checked,
            bloquearRecursos: document.getElementById('chkBloqRecursos').checked,
            bloquearDias: document.getElementById('chkBloqDias').checked,
            categorias: document.getElementById('inCategorias').value
        };`;
html = html.replace(regexGuardar, newGuardar);

fs.writeFileSync('public/usuarios.html', html, 'utf8');
console.log('usuarios.html actualizado con permisos granulares');
