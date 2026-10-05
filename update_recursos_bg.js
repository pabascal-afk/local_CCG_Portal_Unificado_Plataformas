const fs = require('fs');
let html = fs.readFileSync('public/recursos.html', 'utf8');

// 1. Remove foreground 'Bloque Disponible'
const regexBloque = /\/\/ Añadimos un evento clickeable encima[\s\S]*?extendedProps: \{ esDisponible: true, bloque: b, dow: dow \}\s*\}\);/g;
html = html.replace(regexBloque, "");

// 2. Change background color of available block to have a css class if we want, or just leave it
const regexBg = /display: 'background',\s*color: '#d1e7dd', \/\/ Verde clarito/g;
html = html.replace(regexBg, "display: 'background', color: '#d1e7dd', classNames: ['bg-disponible']");

// 3. Fix dateClick to detect the block
const dateClickRegex = /dateClick: function\(info\) \{[\s\S]*?abrirModalReserva\(info\.dateStr\.split\('T'\)\[0\]\);\s*\}/g;

const dateClickReplacement = `dateClick: function(info) {
          if (modoBloqueoActivo) {
            diaSemanaGlobal = info.dateStr;
            const modal = new bootstrap.Modal(document.getElementById('modalBloqueo'));
            modal.show();
            return;
          }

          // Es calendario de recursos (tiene horas) o calendario academico (no tiene horas)?
          // Si tiene info.date, podemos ver la hora
          const d = info.date;
          const fechaStr = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
          
          if (!info.dateStr.includes('T')) {
              // Calendario mes
              abrirModalReserva(fechaStr);
              return;
          }

          // Calendario de recursos (TimeGrid)
          abrirModalReserva(fechaStr);
          
          // Buscar en qué bloque hizo click basándonos en la hora (ej: 08:15:00)
          const hrClicked = d.getHours();
          const minClicked = d.getMinutes();
          const totalMinsClicked = hrClicked * 60 + minClicked;

          setTimeout(() => {
              const sel = document.getElementById('inBloques');
              if(!sel) return;
              
              for(let i=0; i<sel.options.length; i++) {
                  const val = parseInt(sel.options[i].value);
                  // Usamos la misma logica de hrString2 para extraer las horas
                  const rActual = recursosCache.find(x => x.nombre === recursoActual);
                  const hrString = (rActual && rActual.horarios_exactos) ? rActual.horarios_exactos : '08:00,08:45,09:30,10:15,11:00,11:45,12:30,13:15,14:00,14:45,15:30,16:15';
                  const arr = hrString.split(',');
                  
                  let blockStartMins = 0;
                  if(val >= 1 && val <= arr.length) {
                      const pts = arr[val-1].split(':');
                      blockStartMins = parseInt(pts[0]) * 60 + parseInt(pts[1] || '0');
                  } else {
                      blockStartMins = 8 * 60 + (val - 1) * 45;
                  }

                  const blockEndMins = blockStartMins + 45;
                  
                  if (totalMinsClicked >= blockStartMins && totalMinsClicked < blockEndMins) {
                      if (!sel.options[i].disabled) {
                          sel.options[i].selected = true;
                      }
                  } else {
                      sel.options[i].selected = false;
                  }
              }
              agruparBloques();
          }, 200);
        }`;

html = html.replace(dateClickRegex, dateClickReplacement);

// 4. Update eventClick to ignore foreground events if they are somehow still there
// Already does: if (info.event.display === 'background') return;

fs.writeFileSync('public/recursos.html', html, 'utf8');
console.log('Fondo verde ahora es puramente background y clickeable mediante dateClick');
