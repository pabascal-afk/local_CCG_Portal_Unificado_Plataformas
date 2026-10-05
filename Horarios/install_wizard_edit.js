const fs = require('fs');
let codeHtml = fs.readFileSync('c:/Users/TI/Documents/Horarios/Asignador_Index.html.txt', 'utf8');

// Replace agregarFilaPerfil
const oldAgregarFila = `function agregarFilaPerfil(prof = '', max = '', cursos = '', asig = '') {
    const tbody = document.getElementById('tbodyPerfiles');
    const tr = document.createElement('tr');
    tr.innerHTML = \`
        <td><input type="text" class="form-control form-control-sm" value="\${prof}" placeholder="Nombre"></td>
        <td><input type="number" class="form-control form-control-sm" value="\${max}" placeholder="Horas"></td>
        <td><input type="text" class="form-control form-control-sm" value="\${cursos}" placeholder="Ej: 5 Básico, 6 Básico"></td>
        <td><input type="text" class="form-control form-control-sm" value="\${asig}" placeholder="Ej: Matemáticas, Lenguaje"></td>
        <td class="text-center"><button class="btn btn-sm btn-outline-danger" onclick="this.closest('tr').remove()"><i class="bi bi-trash"></i></button></td>
    \`;
    tbody.appendChild(tr);
}`;

const newAgregarFila = `function agregarFilaPerfil(prof = '', max = '', cursos = '', asig = '') {
    const tbody = document.getElementById('tbodyPerfiles');
    const tr = document.createElement('tr');
    tr.innerHTML = \`
        <td><input type="text" class="form-control form-control-sm" value="\${prof}" placeholder="Nombre"></td>
        <td><input type="number" class="form-control form-control-sm" value="\${max}" placeholder="Horas"></td>
        <td><input type="text" class="form-control form-control-sm" value="\${cursos}" placeholder="Ej: 5 Básico, 6 Básico"></td>
        <td><input type="text" class="form-control form-control-sm" value="\${asig}" placeholder="Ej: Matemáticas, Lenguaje"></td>
        <td class="text-center text-nowrap">
            <button class="btn btn-sm btn-outline-primary me-1" onclick="editarPerfilWizard(this)" title="Editar con Asistente"><i class="bi bi-pencil"></i></button>
            <button class="btn btn-sm btn-outline-danger" onclick="this.closest('tr').remove()" title="Eliminar"><i class="bi bi-trash"></i></button>
        </td>
    \`;
    tbody.appendChild(tr);
}`;
codeHtml = codeHtml.replace(oldAgregarFila, newAgregarFila);


// Replace Wizard Logic
const startWiz = codeHtml.indexOf('// WIZARD LOGIC');
const endWiz = codeHtml.indexOf('function agregarFilaPerfil(');
const oldWizBlock = codeHtml.substring(startWiz, endWiz);

const newWizBlock = `// WIZARD LOGIC
let currentWizStep = 1;
const TOTAL_WIZ_STEPS = 4;
let currentWizRow = null;

function editarPerfilWizard(btn) {
    let tr = btn.closest('tr');
    let inputs = tr.querySelectorAll('input');
    abrirWizardProfesor(inputs[0].value, inputs[1].value, inputs[2].value, inputs[3].value, tr);
}

function abrirWizardProfesor(prof = '', max = '', cursos = '', asig = '', tr = null) {
    currentWizRow = tr;
    
    let cursosSet = new Set();
    let asigSet = new Set();
    DB_HORARIOS.forEach(h => {
        if (h.Curso && h.Curso.trim() !== '') cursosSet.add(h.Curso.trim());
        if (h.Asignatura && h.Asignatura.trim() !== '') asigSet.add(h.Asignatura.trim());
    });
    
    let cursosArr = Array.from(cursosSet).sort();
    let asigArr = Array.from(asigSet).sort();
    
    let curSelArr = cursos.split(',').map(s=>s.trim()).filter(s=>s!=='');
    let asigSelArr = asig.split(',').map(s=>s.trim()).filter(s=>s!=='');
    
    const contCursos = document.getElementById('wizContenedorCursos');
    contCursos.innerHTML = '';
    cursosArr.forEach(c => {
        let div = document.createElement('div');
        div.className = 'badge bg-secondary wizard-badge fs-6 p-2';
        div.textContent = c;
        if (curSelArr.includes(c)) div.classList.add('selected');
        div.onclick = function() { this.classList.toggle('selected'); };
        contCursos.appendChild(div);
    });
    
    const contAsig = document.getElementById('wizContenedorAsignaturas');
    contAsig.innerHTML = '';
    asigArr.forEach(a => {
        let div = document.createElement('div');
        div.className = 'badge bg-secondary wizard-badge fs-6 p-2';
        div.textContent = a;
        if (asigSelArr.includes(a)) div.classList.add('selected');
        div.onclick = function() { this.classList.toggle('selected'); };
        contAsig.appendChild(div);
    });
    
    currentWizStep = 1;
    document.getElementById('wizNombre').value = prof;
    document.getElementById('wizHoras').value = max;
    document.querySelectorAll('.step-indicator').forEach(el => el.classList.remove('active'));
    document.getElementById('wizardStep1').classList.add('active');
    document.getElementById('btnWizAtras').style.visibility = 'hidden';
    document.getElementById('btnWizSiguiente').style.display = 'block';
    document.getElementById('btnWizFinalizar').style.display = 'none';
    document.getElementById('btnWizFinalizar').innerHTML = tr ? '<i class="bi bi-check-circle"></i> Actualizar Perfil' : '<i class="bi bi-plus-circle"></i> Agregar a Tabla';
    
    const modalWiz = new bootstrap.Modal(document.getElementById('modalWizardProfesor'));
    modalWiz.show();
}

function cambiarPasoWizard(direccion) {
    if (direccion === 1 && currentWizStep === 1) {
        if (document.getElementById('wizNombre').value.trim() === '') {
            showAlert('Por favor, ingresa el nombre del docente.', 'warning');
            return;
        }
    }
    document.getElementById('wizardStep' + currentWizStep).classList.remove('active');
    currentWizStep += direccion;
    if (currentWizStep === TOTAL_WIZ_STEPS) generarResumenWizard();
    document.getElementById('wizardStep' + currentWizStep).classList.add('active');
    
    document.getElementById('btnWizAtras').style.visibility = currentWizStep === 1 ? 'hidden' : 'visible';
    
    if (currentWizStep === TOTAL_WIZ_STEPS) {
        document.getElementById('btnWizSiguiente').style.display = 'none';
        document.getElementById('btnWizFinalizar').style.display = 'block';
    } else {
        document.getElementById('btnWizSiguiente').style.display = 'block';
        document.getElementById('btnWizFinalizar').style.display = 'none';
    }
}

function generarResumenWizard() {
    document.getElementById('wizResumenNombre').textContent = document.getElementById('wizNombre').value.trim();
    document.getElementById('wizResumenHoras').textContent = document.getElementById('wizHoras').value.trim() || 'Sin límite';
    
    let cursosSel = Array.from(document.getElementById('wizContenedorCursos').querySelectorAll('.selected')).map(el => el.textContent).join(', ');
    document.getElementById('wizResumenCursos').textContent = cursosSel || 'Todos los cursos';
    
    let asigSel = Array.from(document.getElementById('wizContenedorAsignaturas').querySelectorAll('.selected')).map(el => el.textContent).join(', ');
    document.getElementById('wizResumenAsignaturas').textContent = asigSel || 'Todas las materias';
}

function reiniciarWizard() {
    // Only used for the close button
    currentWizRow = null;
}

function finalizarWizard() {
    let nom = document.getElementById('wizNombre').value.trim();
    let hrs = document.getElementById('wizHoras').value.trim();
    let cur = Array.from(document.getElementById('wizContenedorCursos').querySelectorAll('.selected')).map(el => el.textContent).join(',');
    let asi = Array.from(document.getElementById('wizContenedorAsignaturas').querySelectorAll('.selected')).map(el => el.textContent).join(',');
    
    if (currentWizRow) {
        let inputs = currentWizRow.querySelectorAll('input');
        inputs[0].value = nom;
        inputs[1].value = hrs;
        inputs[2].value = cur;
        inputs[3].value = asi;
        showAlert('Perfil actualizado en la tabla. Recuerda "Guardar Perfiles" al final.', 'info');
    } else {
        agregarFilaPerfil(nom, hrs, cur, asi);
        showAlert('Perfil agregado exitosamente a la tabla. Recuerda "Guardar Perfiles" al final.', 'success');
    }
    
    bootstrap.Modal.getInstance(document.getElementById('modalWizardProfesor')).hide();
}
`;

codeHtml = codeHtml.replace(oldWizBlock, newWizBlock);

fs.writeFileSync('c:/Users/TI/Documents/Horarios/Asignador_Index.html.txt', codeHtml);
console.log('Wizard edit logic fully installed.');
