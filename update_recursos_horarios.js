const fs = require('fs');
let html = fs.readFileSync('public/recursos.html', 'utf8');

// 1. Add input in the config modal
const modalConfigRegex = /<input type="text" id="dispAgrupados" class="form-control" placeholder="Ej: 1,2 \| 3,4 \| 5,6">/;
const modalConfigReplacement = `<input type="text" id="dispAgrupados" class="form-control" placeholder="Ej: 1,2 | 3,4 | 5,6">
          <h6 class="mt-3">Horarios Exactos de Inicio</h6>
          <p class="text-muted small mb-2">Escribe a qué hora comienza cada uno de los 12 bloques, separado por comas (formato XX:XX). El bloque siempre durará 45 minutos en el dibujo.</p>
          <input type="text" id="dispHorarios" class="form-control" placeholder="08:00, 08:45, 09:30...">`;
html = html.replace(modalConfigRegex, modalConfigReplacement);

// 2. Modify abrirDisp to fill it
const abrirDispRegex = /document\.getElementById\('dispAgrupados'\)\.value = gruposRaw;\s*modalDisp\.show\(\);/;
const abrirDispReplacement = `document.getElementById('dispAgrupados').value = gruposRaw;
       document.getElementById('dispHorarios').value = r.horarios_exactos || '08:00,08:45,09:30,10:15,11:00,11:45,12:30,13:15,14:00,14:45,15:30,16:15';
       modalDisp.show();`;
html = html.replace(abrirDispRegex, abrirDispReplacement);

// 3. Modify guardarDisponibilidad to save it
const guardarDispRegex = /body: JSON\.stringify\(\{ disponibilidad: disp, bloques_agrupados: grupos \}\)/;
const guardarDispReplacement = `body: JSON.stringify({ disponibilidad: disp, bloques_agrupados: grupos, horarios_exactos: document.getElementById('dispHorarios').value.replace(/\\s/g,'') })`;
html = html.replace(guardarDispRegex, guardarDispReplacement);

// 4. Modify filtrarCalendario to USE IT
// Old math:
// const totalMins = 8 * 60 + (b - 1) * 45;
// const h = Math.floor(totalMins / 60);
// const m = totalMins % 60;
// const startStr = \`\${h.toString().padStart(2,'0')}:\${m.toString().padStart(2,'0')}:00\`;
// const endMins = totalMins + 45;
// const eh = Math.floor(endMins / 60);
// const em = endMins % 60;
// const endStr = \`\${eh.toString().padStart(2,'0')}:\${em.toString().padStart(2,'0')}:00\`;

const helperStr = `
      // Helper for exact times
      const hrString = (rActual && rActual.horarios_exactos) ? rActual.horarios_exactos : '08:00,08:45,09:30,10:15,11:00,11:45,12:30,13:15,14:00,14:45,15:30,16:15';
      const arrHoras = hrString.split(',');
      function getHorasDeBloque(bIndex) {
         let startH = '00', startM = '00';
         if(bIndex >= 1 && bIndex <= arrHoras.length) {
            const pts = arrHoras[bIndex-1].split(':');
            startH = pts[0]; startM = pts[1] || '00';
         } else {
            // Fallback old math
            const totalMins = 8 * 60 + (bIndex - 1) * 45;
            startH = Math.floor(totalMins / 60).toString().padStart(2,'0');
            startM = (totalMins % 60).toString().padStart(2,'0');
         }
         
         const minEnd = parseInt(startH) * 60 + parseInt(startM) + 45; // 45 min length
         const endH = Math.floor(minEnd / 60).toString().padStart(2,'0');
         const endM = (minEnd % 60).toString().padStart(2,'0');
         return { 
             start: \`\${startH}:\${startM}:00\`, 
             end: \`\${endH}:\${endM}:00\` 
         };
      }
`;

const math1Regex = /for \(let b = 1; b <= 12; b\+\+\) \{[\s\S]*?const endStr = `\$\{eh\.toString\(\)\.padStart\(2,'0'\)\}:\$\{em\.toString\(\)\.padStart\(2,'0'\)\}:00`;/;
const math1Replacement = `for (let b = 1; b <= 12; b++) {
              const hObj = getHorasDeBloque(b);
              const startStr = hObj.start;
              const endStr = hObj.end;`;

const math2Regex = /const minStart = 8 \* 60 \+ \(primerB - 1\) \* 45;[\s\S]*?const endHourStr = `\$\{eh\.toString\(\)\.padStart\(2,'0'\)\}:\$\{em\.toString\(\)\.padStart\(2,'0'\)\}:00`;/;
const math2Replacement = `const hObjStart = getHorasDeBloque(primerB);
         const hObjEnd = getHorasDeBloque(ultimoB);
         const startHourStr = hObjStart.start;
         const endHourStr = hObjEnd.end;`;

html = html.replace(/const mappingDias = \{ 'lunes': 1, 'martes': 2, 'miercoles': 3, 'jueves': 4, 'viernes': 5 \};/, helperStr + '\n      const mappingDias = { \'lunes\': 1, \'martes\': 2, \'miercoles\': 3, \'jueves\': 4, \'viernes\': 5 };');
html = html.replace(math1Regex, math1Replacement);
html = html.replace(math2Regex, math2Replacement);

// Make sure the exact hours are shown in the dropdown in Nueva Reserva too!
// <option value="${b}">Bloque ${b}</option> -> <option value="${b}">B${b} (${hObj.start.slice(0,5)})</option>
const selectBloquesRegex = /if \(permitido && yaTomado\) \{[\s\S]*?selectBloques\.innerHTML \+= `<option value="\$\{b\}">Bloque \$\{b\}<\/option>`;\s*\}/;
const selectBloquesReplacement = `const hrString2 = (r && r.horarios_exactos) ? r.horarios_exactos : '08:00,08:45,09:30,10:15,11:00,11:45,12:30,13:15,14:00,14:45,15:30,16:15';
          const arrHoras2 = hrString2.split(',');
          const startHM = arrHoras2[b-1] || '00:00';
          if (permitido && yaTomado) {
              selectBloques.innerHTML += \`<option value="\${b}" disabled>B\${b} (\${startHM}) - Ocupado</option>\`;
          } else if (permitido) {
              selectBloques.innerHTML += \`<option value="\${b}">B\${b} (\${startHM})</option>\`;
          }`;
html = html.replace(selectBloquesRegex, selectBloquesReplacement);

fs.writeFileSync('public/recursos.html', html, 'utf8');
console.log('recursos.html configurado con horarios exactos');
