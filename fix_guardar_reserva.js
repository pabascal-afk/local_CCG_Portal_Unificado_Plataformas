const fs = require('fs');
let html = fs.readFileSync('public/recursos.html', 'utf8');

const regex = /function guardarReserva\(e\) \{[\s\S]*?Swal\.fire\("xito", data\.message \|\| "Reserva guardada", "success"\);\s*cargarTodo\(\);\s*\}\)\s*\.catch\(err => \{\s*Swal\.fire\("Error", err\.message, "error"\);\s*btn\.disabled = false;\s*btn\.innerText = "Guardar Reserva";\s*\}\);\s*\}/;

const replacement = `function guardarReserva(e) {
      e.preventDefault();
      
      const opcionesBloques = document.getElementById('inBloques').options;
      const bloquesSel = [];
      for(let i=0; i<opcionesBloques.length; i++){
        if(opcionesBloques[i].selected) bloquesSel.push(opcionesBloques[i]);
      }
      
      if(bloquesSel.length === 0) {
          Swal.fire("Error", "Debes seleccionar al menos un bloque", "error");
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
            bloques: valoresBloques,
            motivo: document.getElementById('inMotivo').value
          };
          
          fetch('/api/reservas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
          })
          .then(async res => {
              const data = await res.json();
              if(!res.ok) throw new Error(data.error || 'Error desconocido');
              return data;
          })
          .then(async data => {
              Swal.fire('Guardado', 'Reserva realizada', 'success');
              modalRes.hide();
              btn.disabled = false;
              btn.innerText = "Guardar Reserva";
              await cargarRecursosConfig();
          })
          .catch((err) => {
              Swal.fire('Error', err.message, 'error');
              const btn = document.getElementById('btnGuardar');
              btn.disabled = false; 
              btn.innerText = "Guardar Reserva";
          });
      };
      
      if (bloquesSel.length === 1) {
          const textBloque = bloquesSel[0].text;
          Swal.fire({
              title: '¿Está seguro?',
              text: \`Está reservando solo un bloque de 45 minutos:\\n\${textBloque}\`,
              icon: 'warning',
              showCancelButton: true,
              confirmButtonColor: '#3085d6',
              cancelButtonColor: '#d33',
              confirmButtonText: 'Sí, reservar',
              cancelButtonText: 'Cancelar'
          }).then((result) => {
              if (result.isConfirmed) procesarGuardado();
          });
      } else {
          procesarGuardado();
      }
    }`;

// Replace everything between function guardarReserva(e) { and its end.
const fullRegex = /function guardarReserva\(e\) \{[\s\S]*?\}\s*(?=\s*function abrirDisp)/;
html = html.replace(fullRegex, replacement + "\n\n    ");

fs.writeFileSync('public/recursos.html', html, 'utf8');
console.log('Fixed guardarReserva syntax');
