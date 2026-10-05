const fs = require('fs');
let codeHtml = fs.readFileSync('c:/Users/TI/Documents/Horarios/Asignador_Index.html.txt', 'utf8');

const oldOnLoad = `  window.onload = () => {
    google.script.run.withSuccessHandler(data => {
      DB_HORARIOS = data.horarios;
      REGLAS_PROFES = data.reglasProfesores || [];
      REGLAS_GRALES = data.reglasGenerales || [];
      poblarFiltrosBase();
      document.getElementById('loading').style.display = 'none';
      if (!DB_HORARIOS || DB_HORARIOS.length === 0) {
        document.getElementById('visorGrid').innerHTML = '<div class="alert alert-warning text-center">No se encontraron datos.</div>';
        return;
      }
      renderizar();
    }).withFailureHandler(error => {
      document.getElementById('loading').style.display = 'none';
      showAlert('Error al cargar datos: ' + error.message, 'danger');
    }).getAppData();
  };`;

const newOnLoad = `  window.onload = () => {
    google.script.run.withSuccessHandler(data => {
      if (data.error === 'UNAUTHORIZED') {
          document.body.innerHTML = \`
              <div class="container mt-5 text-center">
                  <h1 class="text-danger"><i class="bi bi-shield-lock"></i> Acceso Denegado</h1>
                  <p class="lead mt-3">Tu cuenta (<b>\${data.email}</b>) no tiene permisos para acceder a esta plataforma.</p>
                  <p>Por favor ingresa con un correo institucional válido (@colegiocerrogrande.cl) o contacta al administrador.</p>
              </div>
          \`;
          return;
      }
      DB_HORARIOS = data.horarios;
      REGLAS_PROFES = data.reglasProfes || data.reglasProfesores || [];
      REGLAS_GRALES = data.reglasGrales || data.reglasGenerales || [];
      USER_ROLE = data.userRol || 'LECTOR';
      USER_EMAIL = data.userEmail || '';
      
      aplicarReglasRol();
      poblarFiltrosBase();
      document.getElementById('loading').style.display = 'none';
      if (!DB_HORARIOS || DB_HORARIOS.length === 0) {
        document.getElementById('visorGrid').innerHTML = '<div class="alert alert-warning text-center">No se encontraron datos.</div>';
        return;
      }
      renderizar();
    }).withFailureHandler(error => {
      document.getElementById('loading').style.display = 'none';
      showAlert('Error al cargar datos: ' + error.message, 'danger');
    }).getAppData();
  };`;

codeHtml = codeHtml.replace(oldOnLoad, newOnLoad);

fs.writeFileSync('c:/Users/TI/Documents/Horarios/Asignador_Index.html.txt', codeHtml);
console.log('Fixed RBAC initialization.');
