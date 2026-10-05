const fs = require('fs');
let html = fs.readFileSync('public/recursos.html', 'utf8');

const regex = /function guardarReserva\(e\) \{[\s\S]*?(?=function eliminarReserva)/;

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
          if(btn) { btn.disabled = true; btn.innerText = "Guardando..."; }
          
          const valoresBloques = bloquesSel.map(o => o.value);
          const datos = {
            fecha: document.getElementById('inFecha').value,
            recurso: document.getElementById('inRecurso').value,
            bloques: valoresBloques.join(','),
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
              if(modalRes) modalRes.hide();
              if(btn) { btn.disabled = false; btn.innerText = "Guardar Reserva"; }
              await cargarRecursosConfig();
          })
          .catch((err) => {
              Swal.fire('Error', err.message, 'error');
              if(btn) { btn.disabled = false; btn.innerText = "Guardar Reserva"; }
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
    }
    
    `;

html = html.replace(regex, replacement);

fs.writeFileSync('public/recursos.html', html, 'utf8');
console.log('guardarReserva reparado');
