const fs = require('fs');
let html = fs.readFileSync('public/recursos.html', 'utf8');

// 1. In calendar init, add the events function
const regexCal = /hiddenDays: \[0, 6\], \/\/ Ocultar domingos y sbados/g;
html = html.replace(/hiddenDays: \[0, 6\], \/\/ Ocultar domingos y s(.*?)bados/g, `hiddenDays: [0, 6], // Ocultar domingos y sabados
        events: function(info, successCallback, failureCallback) {
            const evs = generarEventosDinamicos(info.start, info.end);
            successCallback(evs);
        },`);

// 2. Rewrite filtrarCalendario and add generarEventosDinamicos
const regexFilt = /function filtrarCalendario\(\) \{[\s\S]*?calendar\.addEventSource\(eventos\);\s*\}/;

const newFilt = `function filtrarCalendario() {
      calendar.refetchEvents();
    }

    function generarEventosDinamicos(viewStart, viewEnd) {
      const eventos = [];
      const rActual = recursosCache.find(x => x.nombre === recursoActual);
      if(!rActual) return [];
      
      let disp = null;
      if (rActual.disponibilidad) {
          try { disp = JSON.parse(rActual.disponibilidad); } catch(e){}
      }

      const hrString = rActual.horarios_exactos || '08:00,08:45,09:30,10:15,11:00,11:45,12:30,13:15,14:00,14:45,15:30,16:15';
      const arrHoras = hrString.split(',');
      function getHoras(bIndex) {
         let startH = '00', startM = '00';
         if(bIndex >= 1 && bIndex <= arrHoras.length) {
            const pts = arrHoras[bIndex-1].split(':');
            startH = pts[0]; startM = pts[1] || '00';
         } else {
            const totalMins = 8 * 60 + (bIndex - 1) * 45;
            startH = Math.floor(totalMins / 60).toString().padStart(2,'0');
            startM = (totalMins % 60).toString().padStart(2,'0');
         }
         const minEnd = parseInt(startH) * 60 + parseInt(startM) + 45;
         const endH = Math.floor(minEnd / 60).toString().padStart(2,'0');
         const endM = (minEnd % 60).toString().padStart(2,'0');
         return { start: \`\${startH}:\${startM}:00\`, end: \`\${endH}:\${endM}:00\` };
      }

      const mappingDias = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];

      // Iterar sobre cada dia visible en el calendario
      let current = new Date(viewStart);
      while(current < viewEnd) {
          const dowIndex = current.getDay();
          const dStr = mappingDias[dowIndex];
          const currFechaStr = new Date(current.getTime() - (current.getTimezoneOffset() * 60000)).toISOString().split('T')[0];

          if (dowIndex !== 0 && dowIndex !== 6) {
              const permitidos = disp ? (disp[dStr] || []) : [1,2,3,4,5,6,7,8,9,10,11,12];
              
              for (let b = 1; b <= 12; b++) {
                  const hObj = getHoras(b);
                  
                  if (!permitidos.includes(b)) {
                      eventos.push({
                          start: \`\${currFechaStr}T\${hObj.start}\`,
                          end: \`\${currFechaStr}T\${hObj.end}\`,
                          display: 'background',
                          color: '#e0e0e0',
                          title: 'No disponible'
                      });
                  } else {
                      // Revisar si est tomada esta reserva especficamente en este dia y este bloque
                      const yaTomado = todasReservas.some(r => {
                          return r.recurso === recursoActual && r.fecha === currFechaStr && r.bloques.split(',').includes(b.toString());
                      });

                      if (!yaTomado) {
                          // Generar foreground event interactivo "Bloque Disponible"
                          eventos.push({
                              start: \`\${currFechaStr}T\${hObj.start}\`,
                              end: \`\${currFechaStr}T\${hObj.end}\`,
                              title: 'Bloque Disponible',
                              color: 'transparent',
                              textColor: '#0f5132',
                              className: 'evento-disponible',
                              extendedProps: { esDisponible: true, bloque: b }
                          });
                      }
                  }
              }
          }
          current.setDate(current.getDate() + 1);
      }

      // 2. DIBUJAR RESERVAS TOMADAS
      const filtradas = todasReservas.filter(r => r.recurso === recursoActual);
      filtradas.forEach(r => {
         const bs = r.bloques.split(',').map(b=>parseInt(b));
         bs.sort((a,b)=>a-b);
         const primerB = bs[0];
         const ultimoB = bs[bs.length-1];

         const hObjStart = getHoras(primerB);
         const hObjEnd = getHoras(ultimoB);

         eventos.push({
             id: r.id,
             title: \`B:\${r.bloques} - \${r.motivo}\`,
             start: \`\${r.fecha}T\${hObjStart.start}\`,
             end: \`\${r.fecha}T\${hObjEnd.end}\`,
             allDay: false,
             extendedProps: { profesor: r.profesor_email, motivo: r.motivo, esReserva: true },
             color: '#0d6efd'
         });
      });

      return eventos;
    }`;

html = html.replace(regexFilt, newFilt);

fs.writeFileSync('public/recursos.html', html, 'utf8');
console.log('Migrado a events function dinámico!');
