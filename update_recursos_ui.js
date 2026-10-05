const fs = require('fs');
let html = fs.readFileSync('public/recursos.html', 'utf8');

const regexFiltrarCalendario = /function filtrarCalendario\(\) \{[\s\S]*?calendar\.addEventSource\(eventos\);\s*\}/;

const replacementFiltrarCalendario = `function filtrarCalendario() {
      calendar.removeAllEvents();
      
      const rActual = recursosCache.find(x => x.nombre === recursoActual);
      let disp = null;
      if (rActual && rActual.disponibilidad) {
          try { disp = JSON.parse(rActual.disponibilidad); } catch(e){}
      }

      const eventos = [];
      const mappingDias = { 'lunes': 1, 'martes': 2, 'miercoles': 3, 'jueves': 4, 'viernes': 5 };

      // 1. DIBUJAR BLOQUEOS (GRIS) Y DISPONIBLES (VERDE/AZUL CLARO)
      for (let dStr in mappingDias) {
          const dow = mappingDias[dStr];
          const permitidos = disp ? (disp[dStr] || []) : [1,2,3,4,5,6,7,8,9,10,11,12];
          
          for (let b = 1; b <= 12; b++) {
              const totalMins = 8 * 60 + (b - 1) * 45;
              const h = Math.floor(totalMins / 60);
              const m = totalMins % 60;
              const startStr = \`\${h.toString().padStart(2,'0')}:\${m.toString().padStart(2,'0')}:00\`;
              
              const endMins = totalMins + 45;
              const eh = Math.floor(endMins / 60);
              const em = endMins % 60;
              const endStr = \`\${eh.toString().padStart(2,'0')}:\${em.toString().padStart(2,'0')}:00\`;

              if (!permitidos.includes(b)) {
                  eventos.push({
                      daysOfWeek: [dow],
                      startTime: startStr,
                      endTime: endStr,
                      display: 'background',
                      color: '#e0e0e0',
                      title: 'No disponible'
                  });
              } else {
                  // Bloque disponible - generamos un evento "fantasma" que se ve como disponible
                  eventos.push({
                      daysOfWeek: [dow],
                      startTime: startStr,
                      endTime: endStr,
                      display: 'background',
                      color: '#d1e7dd', // Verde clarito
                  });
                  // Añadimos un evento clickeable encima
                  eventos.push({
                      daysOfWeek: [dow],
                      startTime: startStr,
                      endTime: endStr,
                      title: 'Bloque Disponible',
                      color: 'transparent',
                      textColor: '#0f5132',
                      className: 'evento-disponible',
                      extendedProps: { esDisponible: true, bloque: b, dow: dow }
                  });
              }
          }
      }

      // 2. DIBUJAR RESERVAS TOMADAS (Sobreescriben visualmente a los disponibles)
      const filtradas = todasReservas.filter(r => r.recurso === recursoActual);
      filtradas.forEach(r => {
         const bs = r.bloques.split(',').map(b=>parseInt(b));
         bs.sort((a,b)=>a-b);
         const primerB = bs[0];
         const ultimoB = bs[bs.length-1];

         const minStart = 8 * 60 + (primerB - 1) * 45;
         const h = Math.floor(minStart / 60);
         const m = minStart % 60;
         const startHourStr = \`\${h.toString().padStart(2,'0')}:\${m.toString().padStart(2,'0')}:00\`;

         const minEnd = 8 * 60 + (ultimoB - 1) * 45 + 45;
         const eh = Math.floor(minEnd / 60);
         const em = minEnd % 60;
         const endHourStr = \`\${eh.toString().padStart(2,'0')}:\${em.toString().padStart(2,'0')}:00\`;

         eventos.push({
             id: r.id,
             title: \`B:\${r.bloques} - \${r.motivo}\`,
             start: \`\${r.fecha}T\${startHourStr}\`,
             end: \`\${r.fecha}T\${endHourStr}\`,
             allDay: false,
             extendedProps: { profesor: r.profesor_email, motivo: r.motivo, esReserva: true },
             color: '#0d6efd'
         });
      });
      
      calendar.addEventSource(eventos);
    }`;

html = html.replace(regexFiltrarCalendario, replacementFiltrarCalendario);

// Make the available block clickable to open the modal
const regexEventClick = /eventClick: function\(info\) \{[\s\S]*?\}\s*\}\);/
const replacementEventClick = `eventClick: function(info) {
          if (info.event.display === 'background') return;
          
          if (info.event.extendedProps.esDisponible) {
              // Click en bloque disponible
              const d = info.event.start;
              // Ajustar la fecha por zona horaria local
              const fechaStr = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
              abrirModalReserva(fechaStr);
              setTimeout(() => {
                  const sel = document.getElementById('inBloques');
                  for(let i=0; i<sel.options.length; i++) {
                      if (parseInt(sel.options[i].value) === info.event.extendedProps.bloque) {
                          sel.options[i].selected = true;
                      } else {
                          sel.options[i].selected = false;
                      }
                  }
                  agruparBloques();
              }, 200);
              return;
          }

          if (info.event.extendedProps.esReserva) {
              Swal.fire({
                title: info.event.title,
                html: \`<b>Reservado por:</b> \${info.event.extendedProps.profesor}<br><b>Motivo:</b> \${info.event.extendedProps.motivo}\`,
                icon: 'info',
                showCancelButton: true,
                confirmButtonText: 'Eliminar Reserva',
                cancelButtonText: 'Cerrar',
                confirmButtonColor: '#d33'
              }).then((result) => {
                if (result.isConfirmed) {
                  eliminarReserva(info.event.id);
                }
              });
          }
        }
      });`;

html = html.replace(regexEventClick, replacementEventClick);

// Add style for available events
html = html.replace('</style>', '  .evento-disponible { border: 1px dashed #0f5132 !important; font-size: 0.8em; text-align: center; }\n    .evento-disponible:hover { background-color: rgba(15, 81, 50, 0.1) !important; }\n  </style>');

fs.writeFileSync('public/recursos.html', html, 'utf8');
console.log('Calendario actualizado con bloques disponibles');
