const fs = require('fs');
let code = fs.readFileSync('public/dashboard.html', 'utf8');

const targetRegex = /<div class="row">\s*<!-- Muro de Avisos -->[\s\S]*?<!-- Modal Nuevo Aviso -->/m;

const replacement = `<div class="row mb-4">
    <!-- Muro de Avisos -->
    <div class="col-12">
      <div class="card h-100">
        <div class="card-header d-flex justify-content-between align-items-center">
          <span><i class="bi bi-megaphone"></i> Muro de Avisos</span>
          <button class="btn btn-sm btn-primary d-none" id="btnNuevoAviso" onclick="abrirModalAviso()">+ Publicar Aviso</button>
        </div>
        <div class="card-body" id="muro-container">
          <p class="text-muted text-center mt-4">Cargando avisos...</p>
        </div>
      </div>
    </div>
  </div>
  
  <div class="row">
    <!-- Evaluaciones -->
    <div class="col-md-6">
      <div class="card h-100">
        <div class="card-header"><i class="bi bi-calendar-check"></i> Mis Próximas Evaluaciones</div>
        <div class="card-body p-3" id="evals-container">
          <p class="text-muted text-center mt-2">No hay evaluaciones recientes.</p>
        </div>
      </div>
    </div>
    
    <!-- Reservas -->
    <div class="col-md-6">
      <div class="card h-100">
        <div class="card-header"><i class="bi bi-building"></i> Mis Próximas Reservas</div>
        <div class="card-body p-3" id="reservas-container">
          <p class="text-muted text-center mt-2">No tienes reservas activas.</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal Nuevo Aviso -->`;

const match = code.match(targetRegex);
if (match) {
    code = code.replace(targetRegex, replacement);
    fs.writeFileSync('public/dashboard.html', code, 'utf8');
    console.log("Layout actualizado");
} else {
    console.log("No encontrado");
}
