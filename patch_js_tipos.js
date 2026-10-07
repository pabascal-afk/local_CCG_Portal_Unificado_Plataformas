const fs = require('fs');
let code = fs.readFileSync('public/evaluaciones.html', 'utf8');

const jsScript = `
    // =========== GESTION TIPOS EVALUACION ===========
    let tiposEvaluacionCache = [];
    
    async function cargarTiposEvaluacion() {
        try {
            const res = await fetch('/api/config/tipos-evaluacion');
            tiposEvaluacionCache = await res.json();
            renderTiposSelect();
            renderTiposTabla();
        } catch (e) {
            console.error("Error cargando tipos:", e);
        }
    }

    function renderTiposSelect() {
        const sel = document.getElementById('inTipo');
        if(!sel) return;
        const actualVal = sel.value;
        sel.innerHTML = '<option value="">-- Selecciona --</option>';
        tiposEvaluacionCache.forEach(t => {
            const badge = t.es_prueba ? ' (Prueba/Suma)' : ' (No Suma)';
            sel.innerHTML += \`<option value="\${t.nombre}">\${t.nombre}\${badge}</option>\`;
        });
        sel.value = actualVal; // Restore selection if exists
    }

    function abrirModalTipos() {
        renderTiposTabla();
        new bootstrap.Modal(document.getElementById('modalTipos')).show();
    }

    function renderTiposTabla() {
        const tbody = document.querySelector('#tableTipos tbody');
        if(!tbody) return;
        tbody.innerHTML = '';
        tiposEvaluacionCache.forEach(t => {
            tbody.innerHTML += \`
                <tr>
                    <td>\${t.nombre}</td>
                    <td class="text-center">
                        <div class="form-check form-switch d-inline-block">
                            <input class="form-check-input" type="checkbox" role="switch" \${t.es_prueba ? 'checked' : ''} onchange="toggleTipoPrueba(\${t.id}, this.checked)">
                        </div>
                    </td>
                    <td class="text-end">
                        <button class="btn btn-sm btn-outline-danger border-0" onclick="borrarTipo(\${t.id})"><i class="bi bi-trash"></i></button>
                    </td>
                </tr>
            \`;
        });
    }

    async function toggleTipoPrueba(id, checked) {
        const tipo = tiposEvaluacionCache.find(t => t.id === id);
        if(!tipo) return;
        try {
            await fetch('/api/config/tipos-evaluacion/' + id, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ nombre: tipo.nombre, es_prueba: checked })
            });
            cargarTiposEvaluacion();
        } catch(e) { Swal.fire("Error", e.message, "error"); }
    }

    async function borrarTipo(id) {
        if(!confirm("¿Borrar este tipo de evaluación?")) return;
        try {
            await fetch('/api/config/tipos-evaluacion/' + id, { method: 'DELETE' });
            cargarTiposEvaluacion();
        } catch(e) { Swal.fire("Error", e.message, "error"); }
    }

    document.getElementById('formNuevoTipo')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button');
        btn.disabled = true;
        try {
            const nombre = document.getElementById('inNuevoTipo').value.trim();
            const es_prueba = document.getElementById('inNuevoSuma').checked;
            const res = await fetch('/api/config/tipos-evaluacion', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ nombre, es_prueba })
            });
            if(!res.ok) throw new Error("Error al guardar, quizás el nombre ya existe");
            document.getElementById('inNuevoTipo').value = '';
            document.getElementById('inNuevoSuma').checked = false;
            await cargarTiposEvaluacion();
        } catch(e) {
            Swal.fire("Error", e.message, "error");
        }
        btn.disabled = false;
    });
`;

// Insert the JS logic right after `document.addEventListener('DOMContentLoaded', function() {` so it calls `cargarTiposEvaluacion()`
const anchorReady = "document.addEventListener('DOMContentLoaded', function() {";
const loadTiposCall = anchorReady + "\n        cargarTiposEvaluacion();";

code = code.replace(anchorReady, loadTiposCall);

// Insert the functions outside the DOMContentLoaded or at the end of the script
const scriptEndAnchor = "</script>";
code = code.replace("</script>", jsScript + "\n    </script>");

fs.writeFileSync('public/evaluaciones.html', code, 'utf8');
console.log("JS inyectado");
