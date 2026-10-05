const fs = require('fs');

// 1. UPDATE SERVER
let serverCode = fs.readFileSync('server/index.js', 'utf8');

const deleteEndpoint = `
app.delete('/api/recursos/config/:id', (req, res) => {
  db.run("DELETE FROM recursos_config WHERE id = ?", [req.params.id], function(err) {
    if (err) return res.status(500).json({error: err.message});
    res.json({ message: 'Recurso eliminado correctamente' });
  });
});
`;

serverCode = serverCode.replace("// --- Reservas ---", deleteEndpoint + "\n// --- Reservas ---");
fs.writeFileSync('server/index.js', serverCode, 'utf8');

// 2. UPDATE FRONTEND
let html = fs.readFileSync('public/recursos.html', 'utf8');

const btnRegex = /<button class="btn btn-primary w-100 mt-4" onclick="guardarDisponibilidad\(\)">Guardar Configuración<\/button>/;
const btnRegexFallback = /<button class="btn btn-primary w-100 mt-4" onclick="guardarDisponibilidad\(\)">Guardar Configuraci.*?n<\/button>/;

const btnReplacement = `<button class="btn btn-primary w-100 mt-4" onclick="guardarDisponibilidad()">Guardar Configuración</button>
          <button class="btn btn-outline-danger w-100 mt-2 fw-bold" onclick="eliminarRecursoDefinitivo()"><i class="bi bi-trash"></i> Eliminar este Recurso</button>`;

html = html.replace(btnRegex, btnReplacement);
if (html.indexOf('Eliminar este Recurso') === -1) {
    html = html.replace(btnRegexFallback, btnReplacement);
}

const jsDelete = `
    function eliminarRecursoDefinitivo() {
        if(!dispIdActivo) return;
        const r = recursosCache.find(x => x.id === dispIdActivo);
        if(!r) return;
        
        Swal.fire({
            title: \`¿Eliminar \${r.nombre}?\`,
            text: "Esta acción es irreversible. Se borrará el recurso del sistema y sus reservas futuras podrían quedar huérfanas.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                fetch('/api/recursos/config/' + dispIdActivo, { method: 'DELETE' })
                .then(res => res.json())
                .then(data => {
                    Swal.fire('Eliminado', data.message, 'success').then(() => {
                        window.location.reload();
                    });
                });
            }
        });
    }
`;

html = html.replace("function guardarDisponibilidad() {", jsDelete + "\n\n    function guardarDisponibilidad() {");

fs.writeFileSync('public/recursos.html', html, 'utf8');
console.log('Borrado de recursos inyectado en backend y frontend');
