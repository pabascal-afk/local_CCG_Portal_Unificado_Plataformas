const fs = require('fs');
let html = fs.readFileSync('public/recursos.html', 'utf8');

const regexGuardar = /function guardarReserva\(e\) \{[\s\S]*?e\.preventDefault\(\);/;
const replacementGuardar = `function guardarReserva(e) {
      e.preventDefault();
      
      const opcionesBloques = document.getElementById('inBloques').options;
      const bloquesSel = [];
      for(let i=0; i<opcionesBloques.length; i++){
        if(opcionesBloques[i].selected) bloquesSel.push(opcionesBloques[i]);
      }
      
      if(bloquesSel.length === 0) {
          Swal.fire("Error", "Debes seleccionar al menos un bloque (puede que est ocupado)", "error");
          return;
      }
      
      const procesarGuardado = () => {
          const btn = document.getElementById('btnGuardar');
          btn.disabled = true;
          btn.innerText = "Guardando...";
          
          const valoresBloques = bloquesSel.map(o => o.value);
          const datos = {
            fecha: document.getElementById('inFecha').value,
            recurso: document.getElementById('inRecurso').value,
            bloques: valoresBloques,`;

html = html.replace(/function guardarReserva\(e\) \{\s*e\.preventDefault\(\);\s*const btn = document\.getElementById\('btnGuardar'\);\s*btn\.disabled = true;\s*btn\.innerText = "Guardando\.\.\.";\s*const opcionesBloques = document\.getElementById\('inBloques'\)\.options;\s*const bloquesSel = \[\];\s*for\(let i=0; i<opcionesBloques\.length; i\+\+\)\{\s*if\(opcionesBloques\[i\]\.selected\) bloquesSel\.push\(opcionesBloques\[i\]\.value\);\s*\}\s*if\(bloquesSel\.length === 0\) \{\s*Swal\.fire\("Error", "Debes seleccionar al menos un bloque \(puede que est.* ocupado\)", "error"\);\s*btn\.disabled = false; btn\.innerText = "Guardar Reserva"; return;\s*\}\s*const datos = \{/g, replacementGuardar);

const regexFetch = /btn\.disabled = false;\s*btn\.innerText = "Guardar Reserva";\s*\}\)\.catch\(\(err\) => \{\s*Swal\.fire\('Error', err\.message, 'error'\);\s*btn\.disabled = false;\s*btn\.innerText = "Guardar Reserva";\s*\}\);\s*\}/;
const replacementFetch = `btn.disabled = false; btn.innerText = "Guardar Reserva";
        }).catch((err) => {
            Swal.fire('Error', err.message, 'error');
            btn.disabled = false; btn.innerText = "Guardar Reserva";
        });
      };
      
      if (bloquesSel.length === 1) {
          const textBloque = bloquesSel[0].text;
          Swal.fire({
              title: 'Est seguro?',
              text: \`Est reservando solo un bloque de 45 minutos:\\n\${textBloque}\`,
              icon: 'warning',
              showCancelButton: true,
              confirmButtonColor: '#3085d6',
              cancelButtonColor: '#d33',
              confirmButtonText: 'S, reservar',
              cancelButtonText: 'Cancelar'
          }).then((result) => {
              if (result.isConfirmed) procesarGuardado();
          });
      } else {
          procesarGuardado();
      }
    }`;

html = html.replace(regexFetch, replacementFetch);

fs.writeFileSync('public/recursos.html', html, 'utf8');
console.log('Pop-up de bloque solitario inyectado');
