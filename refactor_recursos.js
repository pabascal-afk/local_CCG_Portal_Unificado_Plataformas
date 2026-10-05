const fs = require('fs');
let html = fs.readFileSync('public/recursos.html', 'utf8');

let newHtml = html.replace(/google\.script\.run\.withSuccessHandler\(function\(data\) \{[\s\S]*?\}\)\.getReservas\(\);/, `
      fetch('/api/reservas')
        .then(res => res.json())
        .then(data => {
          calendar.removeAllEvents();
          // Mapear data a formato FullCalendar si es necesario
          const eventos = data.map(r => ({
             id: r.id,
             title: r.recurso + ' (B:' + r.bloques + ') - ' + r.motivo,
             start: r.fecha,
             extendedProps: { profesor: r.profesor_email }
          }));
          calendar.addEventSource(eventos);
          Swal.close();
        });
`);

newHtml = newHtml.replace(/google\.script\.run[\s\S]*?\.guardarReservaManual\(datos\);/, `
      fetch('/api/reservas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      })
      .then(res => res.json())
      .then(data => {
          modalRes.hide();
          btn.disabled = false;
          btn.innerText = "Guardar Reserva";
          Swal.fire("Éxito", data.message || "Reserva guardada", "success");
          cargarReservas();
      })
      .catch(err => {
          btn.disabled = false;
          btn.innerText = "Guardar Reserva";
          Swal.fire("Error", "Error al guardar", "error");
      });
`);

newHtml = newHtml.replace(/google\.script\.run[\s\S]*?\.eliminarReserva\(id\);/, `
      fetch('/api/reservas/' + id, { method: 'DELETE' })
        .then(res => res.json())
        .then(data => {
          Swal.fire("Cancelada", "Reserva eliminada", "success");
          cargarReservas();
        });
`);

fs.writeFileSync('public/recursos.html', newHtml, 'utf8');
console.log('recursos.html migrado a fetch');
