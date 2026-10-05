const fs = require('fs');
let html = fs.readFileSync('public/calendario.html', 'utf8');

const regex = /document\.getElementById\('eventoForm'\)\.onsubmit = function\(e\) \{ e\.preventDefault\(\); const btn = document\.getElementById\('btnGuardar'\); const txtOriginal = btn\.innerText; btn\.innerText = "Guardando\.\.\."; btn\.disabled = true; const datos = \{ idEditar: this\.idEditar\.value, fecha: this\.fecha\.value, texto: this\.texto\.value, tipo: this\.tipo\.value, tipoNuevo: this\.tipoNuevo\.value, colorNuevo: this\.colorNuevo\.value, bloquea: document\.getElementById\('checkBloquea'\)\.checked, bloques: obtenerValoresBloques\(\), cursos: document\.getElementById\('checkBloquea'\)\.checked \? recopilarCursosAfectados\(\) : '',\s*externos: recopilarExternos\(\),\s*recurso: this\.recurso\.value\s*\}; google\.script\.run\.withSuccessHandler\(\(\) => \{ cerrarModal\('modalEvento'\); cargarTodo\(\); btn\.innerText = txtOriginal; btn\.disabled = false; \}\)\.procesarEvento\(datos\); \};/g;

const replace = `document.getElementById('eventoForm').onsubmit = function(e) { 
    e.preventDefault(); 
    
    if (document.getElementById('checkBloquea').checked) {
        const bloquesSelec = obtenerValoresBloques();
        if (bloquesSelec === '') {
            Swal.fire('Atención', 'Debes seleccionar al menos un bloque afectado o marcar "Todo el día".', 'warning');
            return;
        }
        const cursosSelec = recopilarCursosAfectados();
        if (cursosSelec === 'NINGUNO') {
            Swal.fire('Atención', 'Debes seleccionar al menos un curso afectado.', 'warning');
            return;
        }
    }

    const btn = document.getElementById('btnGuardar'); 
    const txtOriginal = btn.innerText; 
    btn.innerText = "Guardando..."; 
    btn.disabled = true; 
    const datos = { 
        idEditar: this.idEditar.value, 
        fecha: this.fecha.value, 
        texto: this.texto.value, 
        tipo: this.tipo.value, 
        tipoNuevo: this.tipoNuevo.value, 
        colorNuevo: this.colorNuevo.value, 
        bloquea: document.getElementById('checkBloquea').checked, 
        bloques: obtenerValoresBloques(), 
        cursos: document.getElementById('checkBloquea').checked ? recopilarCursosAfectados() : '',
        externos: recopilarExternos(),
        recurso: this.recurso.value
    }; 
    google.script.run.withSuccessHandler(() => { 
        cerrarModal('modalEvento'); 
        cargarTodo(); 
        btn.innerText = txtOriginal; 
        btn.disabled = false; 
    }).procesarEvento(datos); 
};`;

html = html.replace(regex, replace);

fs.writeFileSync('public/calendario.html', html, 'utf8');
console.log('onsubmit validation added');
