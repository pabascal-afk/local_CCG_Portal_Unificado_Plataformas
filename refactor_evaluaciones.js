const fs = require('fs');
let html = fs.readFileSync('public/evaluaciones.html', 'utf8');

// Replace Google Script runs with fetch
let newHtml = html.replace(/google\.script\.run[\s\S]*?\.getConfigFrontend\(\);/, `
    setTimeout(() => {
        configuracionGlobal = {
            cursos: ["1A", "1B", "2A", "2B"],
            asignaturas: { "1A": ["Matemáticas", "Lenguaje"], "1B": ["Matemáticas", "Historia"] },
            esAdmin: true
        };
        const sCurso = document.getElementById('inCurso');
        sCurso.innerHTML = '<option value="">-- Selecciona Curso --</option>';
        configuracionGlobal.cursos.forEach(c => sCurso.innerHTML += \`<option value="\${c}">\${c}</option>\`);
    }, 500);
`);

newHtml = newHtml.replace(/google\.script\.run[\s\S]*?\.agendarEvaluacion\(datosNuevos\);/, `
    fetch('/api/evaluaciones/agendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosNuevos)
    })
    .then(async res => {
        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || 'Error desconocido');
        }
        return res.json();
    })
    .then(data => {
        const modalEl = document.getElementById('modalAgenda');
        const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
        modal.hide();
        
        btn.disabled = false;
        btn.innerText = "Agendar";
        Swal.fire("Actualizado!", data.message, "success");
        cargarEventos();
    })
    .catch(err => {
        btn.disabled = false;
        btn.innerText = "Agendar";
        Swal.fire("Atención", err.message, "error");
    });
`);

newHtml = newHtml.replace(/function cargarEventos\(\) \{[\s\S]*?\.getEventosCalendario\(\);/, `
function cargarEventos() {
    fetch('/api/evaluaciones')
    .then(res => res.json())
    .then(data => {
        todosLosEventos = data.map(e => ({
            id: e.id,
            title: e.asignatura + " (" + e.tipo + ") - " + e.profesor_nombre,
            start: e.fecha,
            extendedProps: e
        }));
        if(primeraCarga) {
            inicializarCalendario(todosLosEventos);
            primeraCarga = false;
        } else {
            calendar.removeAllEvents();
            calendar.addEventSource(todosLosEventos);
        }
    });
`);

fs.writeFileSync('public/evaluaciones.html', newHtml, 'utf8');
