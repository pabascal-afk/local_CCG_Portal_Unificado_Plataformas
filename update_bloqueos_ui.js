const fs = require('fs');
let html = fs.readFileSync('public/recursos.html', 'utf8');

// 1. Add UI inside modalDisp
const modalRegex = /<input type="text" id="dispHorarios" class="form-control" placeholder="08:00, 08:45, 09:30...">/;
const modalReplacement = `<input type="text" id="dispHorarios" class="form-control" placeholder="08:00, 08:45, 09:30...">
          
          <h6 class="mt-4 text-danger"><i class="bi bi-calendar-x"></i> Bloqueos de Fechas (Inhabilitar recurso)</h6>
          <p class="text-muted small mb-2">Selecciona un rango de fechas donde nadie podrá reservar este recurso.</p>
          <div class="d-flex gap-1 mb-2">
            <input type="date" id="bloqInicio" class="form-control form-control-sm" title="Desde">
            <input type="date" id="bloqFin" class="form-control form-control-sm" title="Hasta">
            <input type="text" id="bloqMotivo" class="form-control form-control-sm" placeholder="Motivo">
            <button class="btn btn-sm btn-danger fw-bold" onclick="agregarBloqueoDisp()">Bloquear</button>
          </div>
          <ul id="listaBloqueosFechas" class="list-group list-group-sm mb-3"></ul>`;
html = html.replace(modalRegex, modalReplacement);

// 2. JS Global vars and functions
const jsInsertRegex = /let dispIdActivo = null;/;
const jsInsertReplacement = `let dispIdActivo = null;
    let bloqueosActuales = [];

    function agregarBloqueoDisp() {
        const i = document.getElementById('bloqInicio').value;
        const f = document.getElementById('bloqFin').value;
        const m = document.getElementById('bloqMotivo').value;
        if(!i || !f || !m) { alert('Llena todos los campos'); return; }
        if(new Date(i) > new Date(f)) { alert('Fecha inicio no puede ser mayor a fin'); return; }
        
        bloqueosActuales.push({ inicio: i, fin: f, motivo: m });
        renderizarBloqueosDisp();
        document.getElementById('bloqInicio').value = '';
        document.getElementById('bloqFin').value = '';
        document.getElementById('bloqMotivo').value = '';
    }
    
    function removerBloqueoDisp(index) {
        bloqueosActuales.splice(index, 1);
        renderizarBloqueosDisp();
    }
    
    function renderizarBloqueosDisp() {
        const ul = document.getElementById('listaBloqueosFechas');
        ul.innerHTML = '';
        bloqueosActuales.forEach((b, idx) => {
            ul.innerHTML += \`<li class="list-group-item d-flex justify-content-between text-danger fw-semibold bg-light">
                <span>\${b.inicio} a \${b.fin} - \${b.motivo}</span>
                <button class="btn btn-sm btn-outline-secondary py-0 px-1" onclick="removerBloqueoDisp(\${idx})">X</button>
            </li>\`;
        });
    }`;
html = html.replace(jsInsertRegex, jsInsertReplacement);

// 3. Update abrirDisp to load bloqueos
const abrirDispRegex = /document\.getElementById\('dispHorarios'\)\.value = r\.horarios_exactos \|\| '08:00,08:45,09:30,10:15,11:00,11:45,12:30,13:15,14:00,14:45,15:30,16:15';/;
const abrirDispReplacement = `document.getElementById('dispHorarios').value = r.horarios_exactos || '08:00,08:45,09:30,10:15,11:00,11:45,12:30,13:15,14:00,14:45,15:30,16:15';
       bloqueosActuales = [];
       if (r.bloqueos_fechas) { try { bloqueosActuales = JSON.parse(r.bloqueos_fechas); } catch(e){} }
       renderizarBloqueosDisp();`;
html = html.replace(abrirDispRegex, abrirDispReplacement);

// 4. Update guardarDisponibilidad to save bloqueos
const saveRegex = /body: JSON\.stringify\(\{ disponibilidad: disp, bloques_agrupados: grupos, horarios_exactos: document\.getElementById\('dispHorarios'\)\.value\.replace\(\/\\s\/g,''\) \}\)/;
const saveReplacement = `body: JSON.stringify({ disponibilidad: disp, bloques_agrupados: grupos, horarios_exactos: document.getElementById('dispHorarios').value.replace(/\\s/g,''), bloqueos_fechas: bloqueosActuales })`;
html = html.replace(saveRegex, saveReplacement);

// 5. Update calendar rendering
const renderRegex = /const permitidos = disp \? \(disp\[dStr\] \|\| \[\]\) : \[1,2,3,4,5,6,7,8,9,10,11,12\];/;
const renderReplacement = `let permitidos = disp ? (disp[dStr] || []) : [1,2,3,4,5,6,7,8,9,10,11,12];
              
              let bloqueadoDiaCompleto = null;
              if (rActual.bloqueos_fechas) {
                  let arr = [];
                  try { arr = JSON.parse(rActual.bloqueos_fechas); } catch(e){}
                  for(let bloq of arr) {
                      if (currFechaStr >= bloq.inicio && currFechaStr <= bloq.fin) {
                          bloqueadoDiaCompleto = bloq.motivo;
                          permitidos = [];
                          break;
                      }
                  }
              }`;
html = html.replace(renderRegex, renderReplacement);

// Add a big background event if the whole day is blocked!
const loopRegex = /for \(let b = 1; b <= 12; b\+\+\) \{/;
const loopReplacement = `if (bloqueadoDiaCompleto) {
                  eventos.push({
                      start: \`\${currFechaStr}T08:00:00\`,
                      end: \`\${currFechaStr}T18:00:00\`,
                      display: 'background',
                      color: '#ffc107',
                      title: bloqueadoDiaCompleto
                  });
              }
              for (let b = 1; b <= 12; b++) {`;
html = html.replace(loopRegex, loopReplacement);

// 6. Update dropdown filtering (filtrarBloquesPorDia)
const filterDropdownRegex = /if \(dayIdx === 0 \|\| dayIdx === 6\) \{[\s\S]*?return;\s*\}/;
const filterDropdownReplacement = `if (dayIdx === 0 || dayIdx === 6) {
           selectBloques.innerHTML = '<option disabled>Fin de semana</option>';
           return;
       }

       if (r && r.bloqueos_fechas) {
           let arr = [];
           try { arr = JSON.parse(r.bloqueos_fechas); } catch(e){}
           for(let bloq of arr) {
               if (fecha >= bloq.inicio && fecha <= bloq.fin) {
                   selectBloques.innerHTML = \`<option disabled>BLOQUEADO: \${bloq.motivo}</option>\`;
                   return;
               }
           }
       }`;
html = html.replace(filterDropdownRegex, filterDropdownReplacement);

fs.writeFileSync('public/recursos.html', html, 'utf8');
console.log('Bloqueos de fechas inyectados');
