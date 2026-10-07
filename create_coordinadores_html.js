const fs = require('fs');

const code = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Gestión de Coordinadores</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light">
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
    <div class="container-fluid">
      <a class="navbar-brand" href="/">Plataforma Escolar</a>
    </div>
  </nav>

  <div class="container">
    <h2 class="mb-4">Motor de Enrutamiento de Evaluaciones</h2>
    <p class="text-muted">Define qué coordinador pedagógico recibirá el correo cuando un profesor envíe una evaluación para imprimir/revisar.</p>

    <div class="card mb-4">
      <div class="card-header fw-bold">Añadir Regla de Coordinador</div>
      <div class="card-body">
        <form id="formCoord" class="row g-3">
          <div class="col-md-3">
            <label class="form-label">Nombre del Coordinador</label>
            <input type="text" id="inNombre" class="form-control" required placeholder="Ej: María José">
          </div>
          <div class="col-md-3">
            <label class="form-label">Email</label>
            <input type="email" id="inEmail" class="form-control" required placeholder="coordinacion@colegio.cl">
          </div>
          <div class="col-md-3">
            <label class="form-label">Regla de Curso</label>
            <input type="text" id="inCurso" class="form-control" required value="*" placeholder="Ej: 1° MEDIO A o * para todos">
          </div>
          <div class="col-md-3">
            <label class="form-label">Regla de Asignatura</label>
            <input type="text" id="inAsig" class="form-control" required value="*" placeholder="Ej: MATEMATICAS o * para todas">
          </div>
          <div class="col-12">
            <button type="button" class="btn btn-primary" onclick="guardarCoordinador()">Añadir Regla</button>
          </div>
        </form>
      </div>
    </div>

    <div class="card">
      <div class="card-body">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Cursos (Regla)</th>
              <th>Asignaturas (Regla)</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody id="tbodyCoords">
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
  <script>
    async function cargarCoords() {
        const data = await fetch('/api/envios/coordinadores').then(r=>r.json());
        const tbody = document.getElementById('tbodyCoords');
        tbody.innerHTML = '';
        data.forEach(c => {
            tbody.innerHTML += \`
                <tr>
                    <td>\${c.nombre}</td>
                    <td>\${c.email}</td>
                    <td><code>\${c.curso_regla}</code></td>
                    <td><code>\${c.asignatura_regla}</code></td>
                    <td><button class="btn btn-sm btn-danger" onclick="borrar(\${c.id})">Eliminar</button></td>
                </tr>
            \`;
        });
    }

    async function guardarCoordinador() {
        const payload = {
            nombre: document.getElementById('inNombre').value,
            email: document.getElementById('inEmail').value,
            curso_regla: document.getElementById('inCurso').value || '*',
            asignatura_regla: document.getElementById('inAsig').value || '*'
        };
        await fetch('/api/envios/coordinadores', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        });
        document.getElementById('formCoord').reset();
        cargarCoords();
        Swal.fire("Guardado", "Regla añadida", "success");
    }

    async function borrar(id) {
        if(confirm("¿Eliminar?")) {
            await fetch('/api/envios/coordinadores/' + id, {method: 'DELETE'});
            cargarCoords();
        }
    }

    cargarCoords();
  </script>
</body>
</html>`;
fs.writeFileSync('public/coordinadores.html', code, 'utf8');
console.log("coordinadores.html creado");
