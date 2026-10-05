const fs = require('fs');
let html = fs.readFileSync('public/recursos.html', 'utf8');

// 1. Modify dateClick to handle shiftKey
const dateClickRegex = /agruparBloques\(\);\s*\}, 200\);\s*\}/;
const dateClickReplacement = `if (!info.jsEvent || !info.jsEvent.shiftKey) { agruparBloques(); }
          }, 200);
        }`;
html = html.replace(dateClickRegex, dateClickReplacement);

// 2. Modify eventClick to handle shiftKey
const eventClickRegex = /agruparBloques\(\);\s*\}, 200\);\s*return;\s*\}/;
const eventClickReplacement = `if (!info.jsEvent || !info.jsEvent.shiftKey) { agruparBloques(); }
                }, 200);
                return;
            }`;
html = html.replace(eventClickRegex, eventClickReplacement);

// 3. Update the formReserva onsubmit to show the SweetAlert
const onsubmitRegex = /document\.getElementById\('formReserva'\)\.onsubmit = async function\(e\) \{[\s\S]*?const btn = document\.getElementById\('btnGuardarReserva'\);/;
const onsubmitReplacement = `document.getElementById('formReserva').onsubmit = async function(e) {
        e.preventDefault();
        
        const inBloques = document.getElementById('inBloques');
        const seleccionados = Array.from(inBloques.selectedOptions).map(o => parseInt(o.value));
        if(seleccionados.length === 0) { alert('Debes seleccionar al menos un bloque'); return; }
        
        const procesarGuardado = async () => {
            const btn = document.getElementById('btnGuardarReserva');`;
html = html.replace(onsubmitRegex, onsubmitReplacement);

const fetchSaveRegex = /Swal\.fire\('Guardado', 'Reserva realizada', 'success'\);\s*modalRes\.hide\(\);\s*await cargarRecursosConfig\(\);\s*\}\s*<\/script>/;
const fetchSaveReplacement = `Swal.fire('Guardado', 'Reserva realizada', 'success');
            modalRes.hide();
            await cargarRecursosConfig();
        };

        if (seleccionados.length === 1) {
            const txt = document.getElementById('inBloques').selectedOptions[0].text;
            Swal.fire({
                title: '¿Está seguro?',
                text: \`Está reservando solo un bloque de 45 minutos: \${txt}. ¿Desea continuar?\`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, reservar',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    procesarGuardado();
                }
            });
        } else {
            procesarGuardado();
        }
    }
  </script>`;
html = html.replace(fetchSaveRegex, fetchSaveReplacement);

fs.writeFileSync('public/recursos.html', html, 'utf8');
console.log('Shift+Click y Pop-up inyectados');
