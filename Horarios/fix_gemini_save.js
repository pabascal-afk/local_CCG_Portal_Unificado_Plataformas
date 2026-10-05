const fs = require('fs');
let code = fs.readFileSync('c:/Users/TI/Documents/Horarios/Asignador_Index.html.txt', 'utf8');

const oldFunc = `  function aplicarGeminiSugerencias() {
    let exitoCount = 0;
    
    // Primero, hacemos un "desalojo" virtual de las clases que se van a reubicar
    geminiSugerenciasPendientes.forEach(m => {
      let clase = DB_HORARIOS.find(h => h._rowIndex === m.claseId);
      if (clase) {
        clase._oldDia = clase.Día;
        clase._oldBloque = clase.Bloque;
        clase.Día = '';
        clase.Bloque = '';
      }
    });

    // Luego, intentamos ubicarlas en el nuevo destino y verificamos
    geminiSugerenciasPendientes.forEach(m => {
      let clase = DB_HORARIOS.find(h => h._rowIndex === m.claseId);
      if (clase && m.nuevoDia && m.nuevoBloque) {
        clase.Día = m.nuevoDia;
        clase.Bloque = Number(m.nuevoBloque);
        
        let errores = verificarConflictos(clase, true); // Ignoramos soft rules
        if (errores.length > 0) {
          // Revertir
          clase.Día = clase._oldDia !== undefined ? clase._oldDia : '';
          clase.Bloque = clase._oldBloque !== undefined ? clase._oldBloque : '';
          console.log("IA Falló en: " + clase.Asignatura + " - " + errores.join(", "));
        } else {
          clase._modificadoXMotor = true;
          exitoCount++;
        }
      }
    });
    
    // Modal bypassed for blind execution
    showAlert(\`IA Finalizada: Se lograron inyectar \${exitoCount} de \${geminiSugerenciasPendientes.length} sugerencias con éxito.\`, 'success');
    renderGrid();
    actualizarContadores();
  }`;

const newFunc = `  function aplicarGeminiSugerencias() {
    let exitoCount = 0;
    let reporteHtml = '<ul class="list-group text-start mb-3">';
    let clasesAfectadas = [];
    
    // Primero, hacemos un "desalojo" virtual de las clases que se van a reubicar
    geminiSugerenciasPendientes.forEach(m => {
      let clase = DB_HORARIOS.find(h => h._rowIndex === m.claseId);
      if (clase) {
        clase._oldDia = clase.Día;
        clase._oldBloque = clase.Bloque;
        clase.Día = '';
        clase.Bloque = '';
      }
    });

    // Luego, intentamos ubicarlas en el nuevo destino y verificamos
    geminiSugerenciasPendientes.forEach(m => {
      let clase = DB_HORARIOS.find(h => h._rowIndex === m.claseId);
      if (clase && m.nuevoDia && m.nuevoBloque) {
        clase.Día = m.nuevoDia;
        clase.Bloque = Number(m.nuevoBloque);
        
        let errores = verificarConflictos(clase, true); // Ignoramos soft rules
        if (errores.length > 0) {
          // Revertir
          clase.Día = clase._oldDia !== undefined ? clase._oldDia : '';
          clase.Bloque = clase._oldBloque !== undefined ? clase._oldBloque : '';
          console.log("IA Falló en: " + clase.Asignatura + " - " + errores.join(", "));
        } else {
          clase._modificadoXMotor = true;
          clasesAfectadas.push(clase);
          exitoCount++;
          
          let movDesc = clase._oldDia ? \`Movido de \${clase._oldDia}-\${clase._oldBloque} a \${clase.Día}-\${clase.Bloque}\` : \`Asignado en \${clase.Día}-\${clase.Bloque}\`;
          reporteHtml += \`<li class="list-group-item">
            <strong>\${clase.Curso} - \${clase.Asignatura} (\${clase.Profesor})</strong><br>
            <small class="text-success">\${movDesc}</small>
          </li>\`;
        }
      }
    });
    
    reporteHtml += '</ul>';
    
    renderGrid();
    actualizarContadores();

    if (clasesAfectadas.length > 0) {
      document.getElementById('btnAsistenteIAText').innerHTML = '<span class="spinner-border spinner-border-sm"></span> Guardando en Sheets...';
      
      let asignaciones = clasesAfectadas.map(h => ({ 
         rowIndex: h._rowIndex, 
         dia: h.Día, 
         bloque: h.Bloque,
         isNew: h._isNew,
         curso: h.Curso,
         asignatura: h.Asignatura,
         profesor: h.Profesor
      }));
      
      google.script.run.withSuccessHandler(() => {
         clasesAfectadas.forEach(h => { h._modificadoXMotor = false; h._isNew = false; });
         document.getElementById('btnAsistenteIAText').innerText = 'Asistente IA';
         
         // Inyectar reporte en el modal
         const resContainer = document.getElementById('geminiResultsContent');
         resContainer.innerHTML = \`<div class="alert alert-success fw-bold"><i class="bi bi-check-circle"></i> ¡Movimientos inyectados y guardados en Sheets!</div>\` + reporteHtml;
         
         // Mostrar modal como reporte
         new bootstrap.Modal(document.getElementById('modalGeminiResults')).show();
      }).withFailureHandler((err) => {
         document.getElementById('btnAsistenteIAText').innerText = 'Asistente IA';
         showAlert('Error al guardar cambios de la IA en Sheets: ' + err.message, 'danger');
      }).guardarHorarioGenerado(asignaciones);
    } else {
      showAlert('La IA no propuso ningún movimiento válido que no rompa las reglas duras.', 'warning');
      document.getElementById('btnAsistenteIAText').innerText = 'Asistente IA';
    }
  }`;

code = code.replace(oldFunc, newFunc);
fs.writeFileSync('c:/Users/TI/Documents/Horarios/Asignador_Index.html.txt', code);
console.log('Gemini apply logic fixed to save and report.');
