
    let calendar;
    let configuracionGlobal = {};
    let todosLosEventos = []; // Para filtrado local
    let primeraCarga = true;
    let diaSemanaGlobal = ''; // Guarda el día clickeado
    let evaluacionSeleccionada = null;
    let modoEdicion = false;
    let datosEdicionAntiguos = null;

    document.addEventListener('DOMContentLoaded', function() {
      // 1. Obtener Configuración Inicial
      google.script.run
        .withSuccessHandler(function(config) {
          configuracionGlobal = config;
          document.getElementById('user-info').innerText = `${config.usuario.nombre} (${config.usuario.rol})`;
          
          if (config.usuario.rol.toLowerCase() === 'admin' || config.usuario.rol.toLowerCase() === 'administrador') {
            document.getElementById('adminPanel').classList.remove('d-none');
          }

          llenarSelectorCursos();
          llenarFiltrosGlobales();
          inicializarCalendario();
        })
        .withFailureHandler(mostrarError)
        .getConfigFrontend();
    });

    function llenarFiltrosGlobales() {
      const fCurso = document.getElementById('filterCurso');
      const fAsig = document.getElementById('filterAsig');
      const fProf = document.getElementById('filterProf');

      configuracionGlobal.filtrosGlobales.cursos.forEach(c => fCurso.innerHTML += `<option value="${c}">${c}</option>`);
      configuracionGlobal.filtrosGlobales.asignaturas.forEach(a => fAsig.innerHTML += `<option value="${a}">${a}</option>`);
      
      // Mostrar profesores en mayúscula para mantener consistencia visual
      configuracionGlobal.filtrosGlobales.profesores.forEach(p => {
        if(p && p.trim() !== '') {
          fProf.innerHTML += `<option value="${p}">${p.toUpperCase()}</option>`;
        }
      });
    }

    function llenarSelectorCursos() {
      const select = document.getElementById('inCurso');
      select.innerHTML = '<option value="">-- Selecciona un curso --</option>';
      configuracionGlobal.cursos.forEach(c => {
        select.innerHTML += `<option value="${c}">${c}</option>`;
      });
    }

    function actualizarAsignaturas() {
      const vCurso = document.getElementById('inCurso').value;
      const selectAsig = document.getElementById('inAsig');
      
      selectAsig.innerHTML = '<option value="">-- Selecciona Asignatura --</option>';
      
      if (vCurso && configuracionGlobal.asignaturasDict[vCurso]) {
        const asignaturasDelDia = configuracionGlobal.asignaturasDict[vCurso][diaSemanaGlobal];
        
        if (asignaturasDelDia && asignaturasDelDia.length > 0) {
          asignaturasDelDia.forEach(a => {
            selectAsig.innerHTML += `<option value="${a}">${a}</option>`;
          });
        } else {
          selectAsig.innerHTML = '<option value="">(No haces clases este d\u00EDa en este curso)</option>';
        }
      }
    }

    function inicializarCalendario() {
      const calendarEl = document.getElementById('calendar');
      calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'es',
        hiddenDays: [0, 6], // Oculta domingo(0) y sábado(6)
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek'
        },
        buttonText: { today: 'Hoy', month: 'Mes', week: 'Semana' },
        selectable: true,
        height: 'auto',
        
        events: function(info, successCallback, failureCallback) {
          if (primeraCarga) {
            google.script.run
              .withSuccessHandler(function(eventos) {
                todosLosEventos = eventos;
                primeraCarga = false;
                successCallback(filtrarEventosLocales());
                document.getElementById('loader').style.display = 'none';
              })
              .withFailureHandler(function(error) {
                mostrarError(error);
                failureCallback(error);
                document.getElementById('loader').style.display = 'none';
              })
              .getEventosCalendario();
          } else {
            successCallback(filtrarEventosLocales());
          }
        },

        dateClick: function(info) {
          abrirModalAgenda(info.dateStr);
        },

        eventClick: function(info) {
          if (info.event.extendedProps.esBloqueo) {
            Swal.fire("D\u00EDa Bloqueado", info.event.title, "info");
            return;
          }
          mostrarDetalles(info.event);
        }
      });
      calendar.render();
    }

    function aplicarFiltros() {
      if (calendar) {
        calendar.refetchEvents(); // Volverá a llamar a 'events' y usará filtrarEventosLocales()
      }
    }

    function filtrarEventosLocales() {
      const vCurso = document.getElementById('filterCurso').value;
      const vAsig = document.getElementById('filterAsig').value;
      const vProf = document.getElementById('filterProf').value;

      return todosLosEventos.filter(e => {
        // Los bloqueos (feriados, etc) siempre se muestran
        if (e.extendedProps && e.extendedProps.esBloqueo) return true;

        if (vCurso && e.extendedProps.curso !== vCurso) return false;
        if (vAsig && e.extendedProps.asignatura !== vAsig) return false;
        
        // El profesor puede coincidir con el nombre o el email (Ignorando mayúsculas, tildes y espacios extras)
        if (vProf) {
           const normalize = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
           const pNombre = normalize(e.extendedProps.profesor || '');
           const pEmail = normalize(e.extendedProps.profesorEmail || '');
           const vProfNorm = normalize(vProf);
           
           // Si ni el nombre ni el email coinciden (e incluso verificamos si el nombre contiene el vProfNorm por si acaso)
           if (pNombre !== vProfNorm && pEmail !== vProfNorm && !pNombre.includes(vProfNorm)) {
             return false;
           }
        }

        return true;
      });
    }

    function abrirModalAgenda(fechaStr) {
      document.getElementById('inFecha').value = fechaStr;
      
      // Determinar día de la semana
      const partesFecha = fechaStr.split('-'); // [YYYY, MM, DD]
      const fechaObj = new Date(partesFecha[0], partesFecha[1] - 1, partesFecha[2]);
      const dias = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
      diaSemanaGlobal = dias[fechaObj.getDay()];
      
      // Formatear fecha para el título (Ej: 15/10/2023)
      const partes = fechaStr.split('-');
      document.getElementById('txtFecha').innerText = `${partes[2]}/${partes[1]}/${partes[0]}`;
      
      const selectAsig = document.getElementById('inAsig');
      selectAsig.innerHTML = '<option value="">Selecciona un curso primero</option>';
      document.getElementById('inCurso').value = '';
      document.getElementById('inDetalles').value = '';
      
      const modal = new bootstrap.Modal(document.getElementById('modalAgenda'));
      modal.show();
    }

    // El submit está manejado al final del archivo

    function mostrarDetalles(evento) {
      document.getElementById('detallesTitulo').innerText = evento.title;
      document.getElementById('detProfesor').innerText = evento.extendedProps.profesor || 'Desconocido';
      document.getElementById('detTipo').innerText = evento.extendedProps.tipo || 'General';
      document.getElementById('detInfo').innerText = evento.extendedProps.detalles || 'Sin detalles adicionales.';
      
      evaluacionSeleccionada = {
        fechaStr: evento.startStr.split('T')[0],
        curso: evento.extendedProps.curso,
        asignatura: evento.extendedProps.asignatura,
        profesorEmail: evento.extendedProps.profesorEmail || evento.extendedProps.profesor || '',
        tipo: evento.extendedProps.tipo,
        detalles: evento.extendedProps.detalles
      };

      const btnEliminar = document.getElementById('btnEliminarEval');
      const btnEditar = document.getElementById('btnEditarEval');
      
      const esAdmin = (configuracionGlobal.usuario.rol.toLowerCase() === 'admin' || configuracionGlobal.usuario.rol.toLowerCase() === 'administrador');
      const correoObj = evento.extendedProps.profesorEmail || evento.extendedProps.profesor || '';
      const esMio = (correoObj.toLowerCase() === configuracionGlobal.usuario.email.toLowerCase());

      if (esAdmin || esMio) {
        btnEliminar.style.display = 'inline-block';
        btnEditar.style.display = 'inline-block';
      } else {
        btnEliminar.style.display = 'none';
        btnEditar.style.display = 'none';
      }

      const modal = new bootstrap.Modal(document.getElementById('modalDetalles'));
      modal.show();
    }

    function mostrarError(error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || error
      });
      document.getElementById('loader').style.display = 'none';
    }
    // ============================================
    // LÓGICA DE EXPORTACIÓN A PDF
    // ============================================

    function abrirModalExportarPDF() {
      new bootstrap.Modal(document.getElementById('modalExportarPDF')).show();
    }

    async function iniciarExportacionMasiva(semestre) {
      bootstrap.Modal.getInstance(document.getElementById('modalExportarPDF')).hide();
      
      const cursos = configuracionGlobal.filtrosGlobales.cursos;
      if (!cursos || cursos.length === 0) {
        Swal.fire('Error', 'No hay cursos disponibles para exportar.', 'error');
        return;
      }

      Swal.fire({
        title: 'Generando PDFs...',
        text: 'Iniciando proceso masivo. Por favor, no cierres esta ventana.',
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading(); }
      });

      const anioActual = new Date().getFullYear();
      let meses = semestre === 1 ? [2, 3, 4, 5] : [6, 7, 8, 9, 10, 11]; // 0-indexed: Marzo=2, Junio=5, Julio=6, Dic=11
      const nombresMeses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

      for (let i = 0; i < cursos.length; i++) {
        const cursoActual = cursos[i];
        
        // Actualizar UI para no parecer congelado
        Swal.update({
          title: 'Exportando ' + (i+1) + '/' + cursos.length,
          text: 'Procesando: ' + cursoActual
        });
        
        // Forzar pequeño render para que se actualice la alerta antes del lag de dibujo
        await new Promise(r => setTimeout(r, 50));

        const contenedorPDF = document.createElement('div');
        contenedorPDF.style.width = '1050px';
        contenedorPDF.style.padding = '0';
        contenedorPDF.style.fontFamily = 'Arial, sans-serif';
        contenedorPDF.style.background = 'white';

        let htmlContent = '';
        
        meses.forEach((mesActual, index) => {
          if (index > 0) {
            htmlContent += `<div style="page-break-before: always; border-top: 1px solid transparent;"></div>`;
          }
          
          htmlContent += `
            <div style="padding: 30px 40px; box-sizing: border-box; width: 1050px;">
              <div style="text-align: center; margin-bottom: 25px;">
                <h2 style="margin:0; color:#2b3440; font-size:28px; text-transform:uppercase; font-weight:900;">${nombresMeses[mesActual]} ${anioActual} - ${cursoActual}</h2>
              </div>
              <table style="width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 11px; background: white;">
                <thead>
                  <tr style="background-color: #f4f6f8; color: #333; font-size: 13px;">
                    <th style="border: 1px solid #ccc; padding: 12px; width: 20%;">LUNES</th>
                    <th style="border: 1px solid #ccc; padding: 12px; width: 20%;">MARTES</th>
                    <th style="border: 1px solid #ccc; padding: 12px; width: 20%;">MI&Eacute;RCOLES</th>
                    <th style="border: 1px solid #ccc; padding: 12px; width: 20%;">JUEVES</th>
                    <th style="border: 1px solid #ccc; padding: 12px; width: 20%;">VIERNES</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
          `;

          let primerDia = new Date(anioActual, mesActual, 1).getDay(); 
          let celdasAgregadas = 0; 
          let diaSemanaOffset = primerDia === 0 ? 7 : primerDia; 
          
          if (diaSemanaOffset <= 5) { 
            for(let d = 1; d < diaSemanaOffset; d++) { 
              htmlContent += `<td style="border: 1px solid #ccc; background-color: #fcfcfc;"></td>`; 
              celdasAgregadas++; 
            } 
          }
          
          let ultimoDia = new Date(anioActual, mesActual + 1, 0).getDate();

          for (let dia = 1; dia <= ultimoDia; dia++) {
            let fechaIter = new Date(anioActual, mesActual, dia); 
            let ds = fechaIter.getDay(); 
            if (ds === 0 || ds === 6) continue; // Saltar fines de semana
            
            let mStr = String(mesActual+1).padStart(2,'0');
            let dStr = String(dia).padStart(2,'0');
            let fechaStr = `${anioActual}-${mStr}-${dStr}`;
            
            // Buscar eventos
            let evsDia = todosLosEventos.filter(e => e.start.startsWith(fechaStr) && (e.extendedProps.curso === cursoActual || e.extendedProps.esBloqueo));

            htmlContent += `<td style="border: 1px solid #ccc; padding: 5px; vertical-align: top; height: 100px;">
                              <div style="font-weight: bold; margin-bottom: 5px; text-align: right; color: #555; font-size: 14px;">${dia}</div>`;
            
            evsDia.forEach(ev => {
              if (ev.extendedProps.esBloqueo) {
                htmlContent += `<div style="background-color: ${ev.backgroundColor}; color: white; padding: 5px; border-radius: 4px; margin-bottom: 4px; font-size: 11px; font-weight: bold;">
                                  ${ev.title.replace('[BLOQUEADO] ', '').replace('[ATENCION] ', '')}
                                </div>`;
              } else {
                let colorFondo = ev.backgroundColor || '#4361ee';
                let detallesHtml = '';
                
                if (ev.extendedProps.detalles && ev.extendedProps.detalles.trim() !== '') {
                  // Limpiamos los saltos de línea para que se vea continuo
                  let textoDetalle = ev.extendedProps.detalles.replace(/\n/g, ' ');
                  detallesHtml = `<div style="font-size: 9.5px; opacity: 0.95; margin-top: 4px; border-top: 1px solid rgba(255,255,255,0.4); padding-top: 3px; font-style: italic;">${textoDetalle}</div>`;
                }

                htmlContent += `<div style="background-color: ${colorFondo}; color: white; padding: 5px; border-radius: 4px; margin-bottom: 4px; font-size: 11px; line-height: 1.2;">
                                  <div style="font-weight: bold;">${ev.extendedProps.asignatura}</div>
                                  <div style="opacity: 0.9;">(${ev.extendedProps.tipo})</div>
                                  ${detallesHtml}
                                </div>`;
              }
            });

            htmlContent += `</td>`; 
            celdasAgregadas++;
            
            if (celdasAgregadas % 5 === 0 && dia < ultimoDia) {
              htmlContent += `</tr><tr>`;
            }
          }
          
          while (celdasAgregadas % 5 !== 0) { 
            htmlContent += `<td style="border: 1px solid #ccc; background-color: #fcfcfc;"></td>`; 
            celdasAgregadas++; 
          }
          
          htmlContent += `</tr></tbody></table></div>`; 
        });

        contenedorPDF.innerHTML = htmlContent; 
        document.body.appendChild(contenedorPDF);
        
        let nombreSeguro = cursoActual.replace(/[^a-zA-Z0-9\s]/g, '').trim().replace(/\s+/g, '_');
        let nombreArchivo = `Calendario_${nombreSeguro}_${semestre}_Semestre.pdf`;

        const opt = { 
          margin: 0.2, 
          filename: nombreArchivo, 
          image: { type: 'jpeg', quality: 1 }, 
          html2canvas: { scale: 2, useCORS: true }, 
          jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }, 
          pagebreak: { mode: 'css' } 
        };
        
        await html2pdf().set(opt).from(contenedorPDF).save();
        contenedorPDF.remove();
      }

      Swal.fire('\u00C9xito', 'Se descargaron los calendarios de todos los cursos correctamente.', 'success');
    }

    // ============================================
    // LÓGICA DE AUDITORÍA ART 51
    // ============================================

    function abrirModalAuditoria() {
      // Limpiar tabla previa
      document.getElementById('auditoriaContenedor').classList.add('d-none');
      document.getElementById('auditoriaTablaCuerpo').innerHTML = '';
      new bootstrap.Modal(document.getElementById('modalAuditoria')).show();
    }

    function cargarAuditoria(semestre) {
      document.getElementById('auditoriaContenedor').classList.add('d-none');
      document.getElementById('auditoriaLoader').classList.remove('d-none');
      
      google.script.run
        .withSuccessHandler(renderizarTablaAuditoria)
        .withFailureHandler(function(error) {
          document.getElementById('auditoriaLoader').classList.add('d-none');
          mostrarError(error);
        })
        .getAuditoriaArt51(semestre);
    }

    function renderizarTablaAuditoria(datos) {
      document.getElementById('auditoriaLoader').classList.add('d-none');
      const tbody = document.getElementById('auditoriaTablaCuerpo');
      let html = '';
      
      if(datos.length === 0) {
        html = '<tr><td colspan="7" class="text-muted p-4">No se encontraron horarios registrados.</td></tr>';
      } else {
        datos.forEach(d => {
          let badgeEstado = '';
          if (d.estado === 'CUMPLE') badgeEstado = '<span class="badge bg-success">CUMPLE</span>';
          else if (d.estado === 'CUMPLE (EXCEDE)') badgeEstado = '<span class="badge bg-info text-dark">EXCEDE</span>';
          else badgeEstado = `<span class="badge bg-danger">${d.estado}</span>`;

          let filaPeligro = d.estado.startsWith('FALTAN') ? 'class="table-danger"' : '';

          html += `
            <tr ${filaPeligro}>
              <td class="fw-bold">${d.curso}</td>
              <td>${d.asignatura}</td>
              <td class="text-muted">${d.profesor || 'N/A'}</td>
              <td class="fw-bold text-primary">${d.horas}</td>
              <td class="fw-bold text-secondary">${d.minimo}</td>
              <td class="fw-bold">${d.agendadas}</td>
              <td>${badgeEstado}</td>
            </tr>
          `;
        });
      }
      
      tbody.innerHTML = html;
      document.getElementById('auditoriaContenedor').classList.remove('d-none');
    }

    // ============================================
    // LOGICA DE EDICION, ELIMINACION Y CARGA MASIVA
    // ============================================

    function confirmarEliminacion() {
      if (!evaluacionSeleccionada) return;
      Swal.fire({
        title: '¿Eliminar evaluación?',
        text: "Se borrará del calendario. Esta acción no se puede deshacer.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          const btn = document.getElementById('btnEliminarEval');
          btn.disabled = true;
          btn.innerText = "Borrando...";
          
          google.script.run
            .withSuccessHandler(function(msj) {
              const modalEl = document.getElementById('modalDetalles');
              const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
              modal.hide();
              
              calendar.refetchEvents();
              btn.disabled = false;
              btn.innerText = "🗑️ Eliminar";
              Swal.fire("Eliminada", msj, "success");
            })
            .withFailureHandler(function(err) {
              btn.disabled = false;
              btn.innerText = "🗑️ Eliminar";
              mostrarError(err);
            })
            .eliminarEvaluacionBackend(evaluacionSeleccionada);
        }
      });
    }

    function prepararEdicion() {
      if (!evaluacionSeleccionada) return;
      modoEdicion = true;
      datosEdicionAntiguos = { ...evaluacionSeleccionada };
      
      const modalEl = document.getElementById('modalDetalles');
      const modalDet = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
      modalDet.hide();

      abrirModalAgenda(evaluacionSeleccionada.fechaStr);
      
      // Esperar a que los combos se llenen y seleccionar valores
      setTimeout(() => {
        document.getElementById('inCurso').value = evaluacionSeleccionada.curso;
        actualizarAsignaturasAgenda();
        setTimeout(() => {
          document.getElementById('inAsig').value = evaluacionSeleccionada.asignatura;
          document.getElementById('inTipo').value = evaluacionSeleccionada.tipo;
          document.getElementById('inDetalles').value = evaluacionSeleccionada.detalles || "";
        }, 100);
      }, 100);
    }

    // Modificar el submit de formAgenda para que distinga Edición de Nuevo Agendamiento
    document.getElementById('formAgenda').onsubmit = function(e) {
      e.preventDefault();
      
      const btn = e.target.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.innerText = "Procesando...";

      const datosNuevos = {
        fecha: document.getElementById('inFecha').value,
        curso: document.getElementById('inCurso').value,
        asignatura: document.getElementById('inAsig').value,
        tipo: document.getElementById('inTipo').value,
        detalles: document.getElementById('inDetalles').value
      };

      if (modoEdicion) {
        google.script.run
          .withSuccessHandler(function(msj) {
            const modalEl = document.getElementById('modalAgenda');
            const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
            modal.hide();
            
            calendar.refetchEvents();
            btn.disabled = false;
            btn.innerText = "Agendar";
            Swal.fire("¡Actualizado!", msj, "success");
            modoEdicion = false;
            datosEdicionAntiguos = null;
          })
          .withFailureHandler(function(err) {
            btn.disabled = false;
            btn.innerText = "Agendar";
            mostrarError(err);
          })
          .editarEvaluacionBackend(datosEdicionAntiguos, datosNuevos);
      } else {
        google.script.run
          .withSuccessHandler(function(msj) {
            const modalEl = document.getElementById('modalAgenda');
            const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
            modal.hide();
            
            calendar.refetchEvents();
            btn.disabled = false;
            btn.innerText = "Agendar";
            Swal.fire("¡Agendado!", msj, "success");
          })
          .withFailureHandler(function(err) {
            btn.disabled = false;
            btn.innerText = "Agendar";
            mostrarError(err);
          })
          .agendarEvaluacion(datosNuevos);
      }
    };

    function ejecutarCargaAutomaticaFront() {
      Swal.fire({
        title: '🤖 Carga Automática',
        text: 'El sistema leerá la pestaña "Carga_Automatica" y agendará inteligentemente en bloques de 90min sin romper los topes. ¿Iniciar?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#28a745',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, iniciar carga'
      }).then((result) => {
        if (result.isConfirmed) {
          const btn = document.getElementById('btnCargaAuto');
          btn.disabled = true;
          Swal.fire({
            title: 'Calculando huecos y topes...',
            text: 'Esto puede demorar unos segundos.',
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading(); }
          });
          
          google.script.run
            .withSuccessHandler(function(msj) {
              btn.disabled = false;
              calendar.refetchEvents();
              Swal.fire("Resumen", msj, msj.includes("No se generó") ? "warning" : "success");
            })
            .withFailureHandler(function(err) {
              btn.disabled = false;
              mostrarError(err);
            })
            .ejecutarCargaAutomaticaBackend();
        }
      });
    }

  