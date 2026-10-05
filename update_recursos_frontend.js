const fs = require('fs');
let html = fs.readFileSync('public/recursos.html', 'utf8');

// 1. Disable the "Recurso a reservar" select
html = html.replace('id="inRecurso" required>', 'id="inRecurso" required disabled>');

// 2. Add Disp modal html right after the Config Modal closing div
const dispModal = `
  <!-- Modal Disponibilidad -->
  <div class="modal fade" id="modalDisp" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header bg-dark text-white">
          <h5 class="modal-title fw-bold">Disponibilidad: <span id="dispNombre"></span></h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <table class="table table-bordered text-center table-sm">
            <thead>
              <tr><th>Bloque</th><th>Lunes</th><th>Martes</th><th>Miércoles</th><th>Jueves</th><th>Viernes</th></tr>
            </thead>
            <tbody id="dispBody">
              <!-- JS -->
            </tbody>
          </table>
          <button class="btn btn-primary w-100 mt-2" onclick="guardarDisponibilidad()">Guardar Disponibilidad</button>
        </div>
      </div>
    </div>
  </div>
`;
html = html.replace('<!-- Modal Configuración -->', dispModal + '\n  <!-- Modal Configuración -->');

// 3. Update the config list to include a button for 'Disponibilidad'
const regexConfigList = /\$\{r\.nombre\} <span class="badge bg-secondary">\$\{r\.responsable\}<\/span>\s*<\/li>/;
html = html.replace(regexConfigList, `
            \${r.nombre} 
            <div>
              <span class="badge bg-secondary">\${r.responsable}</span>
              <button class="btn btn-sm btn-outline-primary ms-2 py-0 px-1" onclick="abrirDisp(\${r.id}, '\${r.nombre}')"><i class="bi bi-calendar-week"></i> Horario</button>
            </div>
        </li>`);

// 4. In JS, add Disp logics
const jsLogics = `
    let modalDisp;
    let dispIdActivo = null;
    let diasSemana = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];

    document.addEventListener('DOMContentLoaded', async function() {
        modalDisp = new bootstrap.Modal(document.getElementById('modalDisp'));
`;
html = html.replace("document.addEventListener('DOMContentLoaded', async function() {", jsLogics);

const dispFunctions = `
    function abrirDisp(id, nombre) {
       dispIdActivo = id;
       document.getElementById('dispNombre').innerText = nombre;
       
       const r = recursosCache.find(x => x.id === id);
       let disp = {};
       if(r.disponibilidad) {
          try { disp = JSON.parse(r.disponibilidad); } catch(e){}
       }
       
       const body = document.getElementById('dispBody');
       body.innerHTML = '';
       for(let b=1; b<=12; b++) {
          let tr = '<tr><td>B'+b+'</td>';
          diasSemana.forEach(d => {
             // By default, if disp obj doesn't exist, all true
             let checked = disp[d] ? disp[d].includes(b) : true;
             tr += \`<td><input class="form-check-input disp-chk" type="checkbox" data-dia="\${d}" data-bloque="\${b}" \${checked ? 'checked' : ''}></td>\`;
          });
          tr += '</tr>';
          body.innerHTML += tr;
       }
       modalDisp.show();
    }
    
    async function guardarDisponibilidad() {
       const disp = { lunes:[], martes:[], miercoles:[], jueves:[], viernes:[] };
       document.querySelectorAll('.disp-chk:checked').forEach(chk => {
          disp[chk.dataset.dia].push(parseInt(chk.dataset.bloque));
       });
       
       await fetch('/api/recursos/config/' + dispIdActivo, {
          method: 'PUT',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ disponibilidad: disp })
       });
       Swal.fire('Guardado', 'Disponibilidad actualizada', 'success');
       modalDisp.hide();
       await cargarRecursosConfig();
    }
    
    function filtrarBloquesPorDia() {
       const fecha = document.getElementById('inFecha').value;
       if(!fecha || !recursoActual) return;
       
       const r = recursosCache.find(x => x.nombre === recursoActual);
       let disp = null;
       if(r && r.disponibilidad) {
          try { disp = JSON.parse(r.disponibilidad); } catch(e){}
       }
       
       const dObj = new Date(fecha + "T12:00:00");
       const dayIdx = dObj.getDay(); // 1=Lunes, 5=Viernes
       
       const selectBloques = document.getElementById('inBloques');
       selectBloques.innerHTML = '';
       
       if (dayIdx === 0 || dayIdx === 6) {
           selectBloques.innerHTML = '<option disabled>Fin de semana</option>';
           return;
       }
       
       const diaStr = diasSemana[dayIdx - 1];
       
       for(let b=1; b<=12; b++) {
          let permitido = true;
          if (disp && disp[diaStr] && !disp[diaStr].includes(b)) {
             permitido = false;
          }
          if (permitido) {
             selectBloques.innerHTML += \`<option value="\${b}">Bloque \${b}</option>\`;
          }
       }
    }
`;

// Inject dispFunctions before closing script tag
html = html.replace('</script>', dispFunctions + '\n</script>');

// Make inFecha change trigger filtrarBloquesPorDia() as well as cargarMisClases()
html = html.replace('onchange="cargarMisClases()"', 'onchange="cargarMisClases(); filtrarBloquesPorDia();"');

// When opening booking modal, also run filtrarBloquesPorDia
html = html.replace('cargarMisClases();\n      }', 'cargarMisClases();\n         filtrarBloquesPorDia();\n      }');

fs.writeFileSync('public/recursos.html', html, 'utf8');
