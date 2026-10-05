
  let DB_HORARIOS = [];
  let REGLAS_PROFES = [];
  let REGLAS_GRALES = [];
  let editorContexto = {};
  let colorAsignaturas = {};
  let mostrarNoLectivas = false;
  
  const modalEl = new bootstrap.Modal(document.getElementById('editorModal'));
  const crearModalEl = new bootstrap.Modal(document.getElementById('crearModal'));
  const conflictModalEl = new bootstrap.Modal(document.getElementById('conflictModal'));
  
  let modalChoqueDetalleEl;
  document.addEventListener('DOMContentLoaded', () => {
    modalChoqueDetalleEl = new bootstrap.Modal(document.getElementById('modalChoqueDetalle'));
  });
  
  let conflictoContexto = null;

  function abrirChoqueModal(rowIndex) {
      let c = DB_HORARIOS.find(h => h._rowIndex == rowIndex);
      if(!c) return;
      
      let overlaps = DB_HORARIOS.filter(o => o !== c && o.Día === c.Día && String(o.Bloque) === String(c.Bloque));
      let isElectivo = c.Asignatura && c.Asignatura.toUpperCase().includes('ELECTIVO');
      
      let html = `<p>Bloque seleccionado: <strong>${c.Asignatura}</strong> del curso <strong>${c.Curso}</strong> con el profesor <strong>${c.Profesor}</strong>.</p>
                  <h6 class="text-danger fw-bold">Conflictos detectados:</h6>
                  <ul class="list-group mb-3">`;
                  
      let foundConflict = false;
      overlaps.forEach(o => {
          let chocaProfe = (o.Profesor && c.Profesor && o.Profesor === c.Profesor);
          let chocaCurso = (o.Curso !== 'ADMIN' && c.Curso !== 'ADMIN' && o.Curso === c.Curso);
          
          if (chocaProfe) {
              let oElectivo = o.Asignatura && o.Asignatura.toUpperCase().includes('ELECTIVO');
              if (isElectivo && oElectivo) chocaProfe = false; 
          }
          
          if(chocaProfe || chocaCurso) {
              foundConflict = true;
              
              let profeLibreHtml = '';
              if (chocaProfe && o.Profesor) {
                 const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
                 const bDisp = [1,2,3,4,5,6,7,8,9,10,11,12];
                 let libres = [];
                 let ocupados = DB_HORARIOS.filter(h => h.Profesor === o.Profesor && h.Día && h.Bloque).map(h => `${h.Día}_${h.Bloque}`);
                 let pRule = REGLAS_PROFES.find(r => r['Nombre Profesor'] === o.Profesor);
                 let diasLibres = pRule && pRule['Días Libres'] ? String(pRule['Días Libres']).toLowerCase() : '';
                 let blqBloqueados = pRule && pRule['Bloques Bloqueados'] ? String(pRule['Bloques Bloqueados']).toLowerCase() : '';
                 
                 dias.forEach(d => {
                    if (diasLibres.includes(d.toLowerCase())) return;
                    bDisp.forEach(b => {
                       let key = `${d}_${b}`;
                       if (ocupados.includes(key)) return;
                       if (blqBloqueados.includes(`${d.toLowerCase()}-${b}`)) return;
                       libres.push(`${d.substring(0,2)} B${b}`);
                    });
                 });
                 
                 let badgeLim = libres.slice(0, 12);
                 let textBadge = badgeLim.map(lb => `<span class="badge bg-success me-1 mb-1 shadow-sm" style="font-size:0.7rem;">${lb}</span>`).join('');
                 if(libres.length > 12) textBadge += `<span class="badge bg-secondary me-1 mb-1 shadow-sm" style="font-size:0.7rem;">+${libres.length - 12}</span>`;
                 
                 profeLibreHtml = `<div class="mt-2 w-100 p-2 border rounded" style="background-color: #f8f9fa;">
                    <div class="text-success fw-bold mb-1" style="font-size:0.75rem;"><i class="bi bi-calendar-check"></i> Disponibilidad de ${o.Profesor}:</div>
                    <div>${textBadge || '<span class="text-muted" style="font-size:0.75rem;">Sin bloques libres</span>'}</div>
                 </div>`;
              }
              
              html += `<li class="list-group-item list-group-item-danger d-flex flex-column">
                 <div class="d-flex justify-content-between align-items-center w-100">
                     <div>
                       <strong>${o.Curso}</strong>: ${o.Asignatura}
                       <br><small class="text-muted">Profesor: ${o.Profesor}</small>
                     </div>
                     <span class="badge bg-danger rounded-pill shadow-sm">${chocaProfe ? 'Choque Profesor' : 'Choque Curso'}</span>
                 </div>
                 ${profeLibreHtml}
              </li>`;
          }
      });
      
      if(!foundConflict) {
         let errs = verificarConflictos(c);
         if (errs.length > 0) {
             errs.forEach(e => {
                html += `<li class="list-group-item list-group-item-warning"><i class="bi bi-info-circle"></i> ${e}</li>`;
             });
         } else {
             html += `<li class="list-group-item text-muted">No se detectaron choques estructurales.</li>`;
         }
      }
      
      html += `</ul>`;
      document.getElementById('modalChoqueDetalleBody').innerHTML = html;
      
      // Asegurarse de que el elemento exista antes de llamar show()
      if (!modalChoqueDetalleEl) modalChoqueDetalleEl = new bootstrap.Modal(document.getElementById('modalChoqueDetalle'));
      modalChoqueDetalleEl.show();
  }

  let clickTimer = null;
  function clickTag(tipo, valor) {
    clearTimeout(clickTimer);
    clickTimer = setTimeout(() => {
      if(tipo === 'Asignatura') document.getElementById('selectAsignatura').value = valor;
      if(tipo === 'Profesor') {
        document.getElementById('selectProfesor').value = valor;
        cambioProfesor();
      } else {
        renderizar();
      }
    }, 300);
  }

  function dblClickTag(columna, valorActual, curso, dia, bloque) {
    clearTimeout(clickTimer);
    abrirEditor(columna, valorActual, curso, dia, bloque);
  }
  
  function toggleNoLectivas() {
     mostrarNoLectivas = !mostrarNoLectivas;
     document.getElementById('btnToggleNoLectivas').innerText = mostrarNoLectivas ? "👁️ Ocultar No Lectivas" : "👁️ Mostrar No Lectivas";
     renderizar();
  }

  // --- DRAG AND DROP ---
  function allowDrop(ev) {
    ev.preventDefault();
    ev.currentTarget.classList.add('drag-over');
  }
  
  function dragLeave(ev) {
    ev.currentTarget.classList.remove('drag-over');
  }

  function drag(ev, rowIndex) {
    // Si la fila no tiene rowIndex (porque es nueva y no se ha guardado), no se puede arrastrar aún.
    ev.dataTransfer.setData("rowIndex", rowIndex);
  }

  function drop(ev) {
    ev.preventDefault();
    ev.currentTarget.classList.remove('drag-over');
    const rowIndexText = ev.dataTransfer.getData("rowIndex");
    if(!rowIndexText || rowIndexText === "undefined") {
       showAlert('Guarda el horario antes de mover clases recién creadas.', 'warning');
       return;
    }
    const rowIndex = parseFloat(rowIndexText);
    const nuevoDia = ev.currentTarget.getAttribute("data-dia") || "";
    const nuevoBloque = ev.currentTarget.getAttribute("data-bloque") || "";
    
    let clase = DB_HORARIOS.find(h => String(h._rowIndex) === rowIndexText);
    if(clase) {
       let prevDia = clase.Día;
       let prevBloque = clase.Bloque;
       
       clase.Día = nuevoDia;
       clase.Bloque = nuevoBloque;
       
       let conflictos = verificarConflictos(clase);
       let chocan = DB_HORARIOS.filter(h => h !== clase && h.Día === nuevoDia && String(h.Bloque) === String(nuevoBloque));
       let choqueCurso = chocan.find(h => h.Curso === clase.Curso && clase.Curso !== 'ADMIN');
       
       if(choqueCurso) conflictos.push(`Choque de curso con ${choqueCurso.Asignatura}`);
       
       if(conflictos.length > 0) {
           clase.Día = prevDia; 
           clase.Bloque = prevBloque;
           abrirModalConflicto(clase, nuevoDia, nuevoBloque, conflictos, chocan);
           return;
       }
       
       aplicarMovimiento(clase, nuevoDia, nuevoBloque);
    }
  }

  function aplicarMovimiento(clase, nuevoDia, nuevoBloque) {
       clase.Día = nuevoDia;
       clase.Bloque = nuevoBloque;
       renderizar(); 
       if(document.getElementById('selectProfesor').value) cambioProfesor();
       
       google.script.run.withFailureHandler(e => {
         showAlert('Error guardando en Sheets: ' + e.message);
       }).actualizarRegistroUnicoFila(clase._rowIndex, nuevoDia, nuevoBloque);
  }
  
  function abrirModalConflicto(clase, nuevoDia, nuevoBloque, conflictos, chocan) {
       conflictoContexto = { clase, nuevoDia, nuevoBloque, chocan };
       document.getElementById('conflictList').innerHTML = conflictos.map(c => `<li>${c}</li>`).join('');
       
       let btnDesplazar = document.getElementById('btnDesplazar');
       if(chocan.length > 0) {
           btnDesplazar.style.display = 'block';
           btnDesplazar.innerText = `📤 Enviar clase ocupante (${chocan[0].Curso}) a Bandeja`;
       } else {
           btnDesplazar.style.display = 'none';
       }
       conflictModalEl.show();
  }
  
  function forzarMovimiento() {
       conflictModalEl.hide();
       aplicarMovimiento(conflictoContexto.clase, conflictoContexto.nuevoDia, conflictoContexto.nuevoBloque);
  }
  
  function desplazarYGuardar() {
       conflictModalEl.hide();
       let claseMovida = conflictoContexto.clase;
       let claseExistente = conflictoContexto.chocan[0];
       
       claseExistente.Día = '';
       claseExistente.Bloque = '';
       google.script.run.actualizarRegistroUnicoFila(claseExistente._rowIndex, '', '');
       
       aplicarMovimiento(claseMovida, conflictoContexto.nuevoDia, conflictoContexto.nuevoBloque);
  }
  // ----------------------

  function getSubjectColor(asignatura) {
    if(asignatura === 'Hora No Lectiva' || asignatura === 'Consejo') return '#e0e0e0';
    return colorAsignaturas[asignatura] || '#e9ecef';
  }

  window.onload = () => {
    google.script.run.withSuccessHandler(data => {
      DB_HORARIOS = data.horarios;
      REGLAS_PROFES = data.reglasProfesores || [];
      REGLAS_GRALES = data.reglasGenerales || [];
      poblarFiltrosBase();
      document.getElementById('loading').style.display = 'none';
      if (!DB_HORARIOS || DB_HORARIOS.length === 0) {
        document.getElementById('visorGrid').innerHTML = '<div class="alert alert-warning text-center">No se encontraron datos.</div>';
        return;
      }
      renderizar();
    }).withFailureHandler(error => {
      document.getElementById('loading').style.display = 'none';
      showAlert('Error al cargar datos: ' + error.message, 'danger');
    }).getAppData();
  };

  function showAlert(msg, type='danger') {
    document.getElementById('alertContainer').innerHTML = `<div class="alert alert-${type} alert-dismissible fade show">${msg}<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>`;
  }

  function poblarFiltrosBase() {
    const cursos = [...new Set(DB_HORARIOS.map(h => h.Curso))].filter(Boolean).sort();
    
    let todosProfes = [];
    DB_HORARIOS.forEach(h => {
        if(h.Profesor) todosProfes.push(h.Profesor);
        if(h.ProfesoresExtra) todosProfes.push(...h.ProfesoresExtra);
    });
    const profes = [...new Set(todosProfes)].filter(Boolean).sort();
    const asignaturas = [...new Set(DB_HORARIOS.map(h => h.Asignatura))].filter(Boolean).sort(); 
    
    asignaturas.forEach((asig, index) => {
      const hue = Math.floor((index * 137.508) % 360);
      colorAsignaturas[asig] = `hsl(${hue}, 70%, 85%)`; 
    });

    cursos.forEach(c => document.getElementById('selectCurso').add(new Option(c, c)));
    profes.forEach(p => document.getElementById('selectProfesor').add(new Option(p, p)));
    asignaturas.forEach(a => document.getElementById('selectAsignatura').add(new Option(a, a)));
  }

  function cambioProfesor() {
    const prof = document.getElementById('selectProfesor').value;
    const panel = document.getElementById('cargaAcademicaPanel');
    if (!prof) {
      panel.classList.add('d-none');
      renderizar();
      return;
    }
    
    panel.classList.remove('d-none');
    document.getElementById('cargaProfesorNombre').innerText = `Profesor: ${prof}`;
    
    let clasesAsignadasProf = DB_HORARIOS.filter(h => h.Día && h.Bloque && (h.Profesor === prof || (h.ProfesoresExtra && h.ProfesoresExtra.includes(prof))));
    let uniqueBloques = new Set(clasesAsignadasProf.map(h => `${h.Día}_${h.Bloque}`));
    let asignadas = uniqueBloques.size;
    
    let regla = REGLAS_PROFES.find(r => r['Nombre Profesor'] === prof);
    let max = regla ? parseInt(regla['Horas Máximas Semanales']) || 0 : 0;
    
    document.getElementById('cargaText').innerText = `${asignadas} / ${max > 0 ? max : '?'} hrs asignadas totales`;
    
    let pct = max > 0 ? Math.min((asignadas / max) * 100, 100) : 0;
    const fill = document.getElementById('cargaFill');
    fill.style.width = pct + '%';
    
    let alerts = [];
    if (max > 0 && asignadas > max) {
      fill.classList.add('danger');
      alerts.push('⚠️ Alerta: Ha superado sus horas máximas semanales según su contrato.');
    } else {
      fill.classList.remove('danger');
    }
    
    if (regla && regla['Días Libres']) alerts.push(`📌 Días Libres: ${regla['Días Libres']}`);
    if (regla && regla['Bloques Bloqueados']) alerts.push(`📌 Bloques Restringidos: ${regla['Bloques Bloqueados']}`);
    
    document.getElementById('cargaAlerts').innerHTML = alerts.join('<br>');
    
    mostrarNoLectivas = true;
    document.getElementById('btnToggleNoLectivas').innerText = "👁️ Ocultar No Lectivas";
    renderizar();
  }

  function verificarConflictos(h, ignorarSoftRules = false) {
    let errs = [];
    if (!h.Día || !h.Bloque) return errs;
    
    let isElectivo = h.Asignatura && h.Asignatura.toUpperCase().includes('ELECTIVO');
    
    let overlaps = DB_HORARIOS.filter(o => {
        if (o === h || o.Día !== h.Día || String(o.Bloque) !== String(h.Bloque)) return false;
        
        let chocaProfe = (o.Profesor && h.Profesor && o.Profesor === h.Profesor);
        let chocaCurso = (o.Curso !== 'ADMIN' && h.Curso !== 'ADMIN' && o.Curso === h.Curso);
        
        if (chocaProfe) {
            let oElectivo = o.Asignatura && o.Asignatura.toUpperCase().includes('ELECTIVO');
            if (isElectivo && oElectivo) {
                chocaProfe = false; // Excepción Multicurso
            }
        }
        
        return chocaProfe || chocaCurso;
    });
    
    if(overlaps.length > 0) {
       let msg = overlaps[0].Profesor === h.Profesor ? `Profesor ocupado en ${overlaps[0].Curso}` : `Curso ocupado con ${overlaps[0].Asignatura}`;
       errs.push(msg);
    }
    
    let isBasico = h.Curso && (h.Curso.toUpperCase().includes('BASICO') || h.Curso.toUpperCase().includes('BÁSICO'));
    let isMedio = h.Curso && h.Curso.toUpperCase().includes('MEDIO');
    if (isBasico && parseInt(h.Bloque) === 7) errs.push('Bloque 7 reservado (Almuerzo Básica)');
    if (isMedio && parseInt(h.Bloque) === 8) errs.push('Bloque 8 reservado (Almuerzo Media)');
    if (isBasico && parseInt(h.Bloque) === 10) errs.push('Básica no tiene clases en el bloque 10');
    
    // REGLA NÚMERO 1: Cero Ventanas para Estudiantes
    if (h.Curso && h.Curso !== 'ADMIN') {
        let bloquesCurso = DB_HORARIOS.filter(o => o.Curso === h.Curso && o.Día === h.Día && o !== h).map(o => parseInt(o.Bloque));
        bloquesCurso.push(parseInt(h.Bloque));
        
        if (bloquesCurso.length > 1) {
            let minB = Math.min(...bloquesCurso);
            let maxB = Math.max(...bloquesCurso);
            for(let i = minB; i <= maxB; i++) {
                let esAlmuerzo = (isBasico && i === 7) || (isMedio && i === 8);
                if (!bloquesCurso.includes(i) && !esAlmuerzo) {
                    errs.push(`Genera ventana vacía para alumnos (Bloque ${i})`);
                    break;
                }
            }
        }
    }
    
    // REGLA DURA: No pueden haber 4 bloques consecutivos (o más) de la misma asignatura
    if (h.Curso && h.Curso !== 'ADMIN' && h.Asignatura) {
         let bloquesMismaAsig = DB_HORARIOS.filter(o => o !== h && o.Día === h.Día && o.Curso === h.Curso && o.Asignatura === h.Asignatura).map(o => parseInt(o.Bloque));
         bloquesMismaAsig.push(parseInt(h.Bloque));
         bloquesMismaAsig.sort((a,b)=>a-b);
         
         let maxConsecutivosAsig = 1;
         let actualesAsig = 1;
         for(let i=1; i<bloquesMismaAsig.length; i++){
            if(bloquesMismaAsig[i] === bloquesMismaAsig[i-1] + 1) {
               actualesAsig++;
               if(actualesAsig > maxConsecutivosAsig) maxConsecutivosAsig = actualesAsig;
            } else {
               actualesAsig = 1;
            }
         }
         if (maxConsecutivosAsig >= 4) {
             errs.push(`Prohibido 4 o más bloques consecutivos de la misma asignatura (${h.Asignatura})`);
         }
    }
    
    if (h.Profesor && h.Profesor.trim() !== '') {
        let b = parseInt(h.Bloque);
        if (b === 7 || b === 8) {
            let otroBloque = (b === 7) ? 8 : 7;
            let sinAlmuerzo = DB_HORARIOS.some(o => o !== h && o.Profesor === h.Profesor && o.Día === h.Día && parseInt(o.Bloque) === otroBloque);
            if (sinAlmuerzo) errs.push('Profesor sin almuerzo (Bloque 7 y 8 ocupados)');
        }
    }
    
    let pRule = REGLAS_PROFES.find(r => r['Nombre Profesor'] === h.Profesor);
    if(pRule) {
      if(pRule['Días Libres'] && String(pRule['Días Libres']).toLowerCase().includes(h.Día.toLowerCase())) errs.push(`Día libre (${h.Profesor})`);
      if(pRule['Bloques Bloqueados'] && String(pRule['Bloques Bloqueados']).toLowerCase().includes(`${h.Día.toLowerCase()}-${h.Bloque}`)) errs.push(`Bloque bloqueado (${h.Profesor})`);
    }
    let gRules = REGLAS_GRALES.filter(r => r['Asignatura'] === h.Asignatura);
    gRules.forEach(gRule => {
       let vals = String(gRule['Valores']).split(',');
       if(gRule['Condición'] === 'SOLO_BLOQUES' && !vals.includes(String(h.Bloque))) errs.push(`Solo en bloques ${gRule['Valores']}`);
       if(gRule['Condición'] === 'NUNCA_BLOQUES' && vals.includes(String(h.Bloque))) errs.push(`NUNCA en bloques ${gRule['Valores']}`);
       if(gRule['Condición'] === 'SOLO_DIA') {
          const normalizeDay = (s) => s ? s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() : '';
          let diasValidos = vals.map(v => normalizeDay(v));
          let diaClase = normalizeDay(h.Día);
          
          if(!diasValidos.includes(diaClase)) errs.push(`Solo permitido en días ${gRule['Valores']}`);
       }
       
       if (!ignorarSoftRules) {
           if(gRule['Condición'] === 'MAX_SEGUIDAS') {
             let max = parseInt(gRule['Valores']) || 2;
             let bloquesDelDia = DB_HORARIOS.filter(o => o !== h && o.Día === h.Día && o.Curso === h.Curso && o.Asignatura === h.Asignatura).map(o => parseInt(o.Bloque));
             bloquesDelDia.push(parseInt(h.Bloque));
             bloquesDelDia.sort((a,b)=>a-b);
             
             let maxConsecutivos = 1;
             let actuales = 1;
             for(let i=1; i<bloquesDelDia.length; i++){
                if(bloquesDelDia[i] === bloquesDelDia[i-1] + 1) {
                   actuales++;
                   if(actuales > maxConsecutivos) maxConsecutivos = actuales;
                } else {
                   actuales = 1;
                }
             }
             if (maxConsecutivos > max) errs.push(`Excede máximo de ${max} bloques seguidos`);
           }
           
           if(gRule['Condición'] === 'MAX_POR_DIA') {
             let max = parseInt(gRule['Valores']) || 2;
             let count = DB_HORARIOS.filter(o => o !== h && o.Día === h.Día && o.Curso === h.Curso && o.Asignatura === h.Asignatura).length;
             if((count + 1) > max) errs.push(`Máximo ${max} clases por día`);
           }
       }
    });
    
    // Reglas Globales Institucionales
    let reglasGlobales = REGLAS_GRALES.filter(r => r['Asignatura'] === 'TODAS' || r['Asignatura'] === 'GLOBAL');
    reglasGlobales.forEach(r => {
        let valsStr = String(r['Valores']).toLowerCase();
        if (r['Condición'] === 'BLOQUES_BLOQUEADOS' && valsStr.includes(`${h.Día.toLowerCase()}-${h.Bloque}`)) {
            errs.push(`Bloque inhabilitado institucionalmente`);
        }
        if (r['Condición'] === 'DIAS_LIBRES' && valsStr.includes(h.Día.toLowerCase())) {
            errs.push(`Día inhabilitado institucionalmente`);
        }
    });
    return errs;
  }

  function renderizar() {
    const cFiltro = document.getElementById('selectCurso').value;
    const pFiltro = document.getElementById('selectProfesor').value;
    const aFiltro = document.getElementById('selectAsignatura').value;
    
    const filtrados = DB_HORARIOS.filter(h => 
      (!cFiltro || h.Curso === cFiltro) && 
      (!pFiltro || h.Profesor === pFiltro || (h.ProfesoresExtra && h.ProfesoresExtra.includes(pFiltro))) &&
      (!aFiltro || h.Asignatura === aFiltro) &&
      (mostrarNoLectivas || (h.Asignatura !== 'Hora No Lectiva' && h.Asignatura !== 'Consejo' && h.Curso !== 'ADMIN'))
    );
    
    const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
    const bloques = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

    let html = `
      <div class="table-responsive table-horario">
        <table class="table table-bordered mb-0 text-center align-middle">
          <thead class="table-dark">
            <tr>
              <th class="col-bloque">Bloque</th>
              ${dias.map(d => `<th class="col-dia">${d}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
    `;

    bloques.forEach(b => {
      let extraClass = b >= 11 ? 'bg-extra' : '';
      html += `<tr><td class="col-bloque ${extraClass}">${b}${b>=11 ? '<br><small>16:15+</small>' : ''}</td>`;
      dias.forEach(d => {
        let isAlmuerzo = false;
        if (cFiltro) {
           let isBasico = cFiltro.toUpperCase().includes('BASICO') || cFiltro.toUpperCase().includes('BÁSICO');
           let isMedio = cFiltro.toUpperCase().includes('MEDIO');
           if (isBasico && b === 7) isAlmuerzo = true;
           if (isMedio && b === 8) isAlmuerzo = true;
        }

        const clases = filtrados.filter(h => (h.Día ? String(h.Día).toLowerCase().trim() : '').startsWith(d.substring(0,2).toLowerCase()) && parseInt(h.Bloque) === b);
        
        html += `<td class="dropzone ${clases.length === 0 ? 'empty-cell' : ''} ${extraClass}" data-dia="${d}" data-bloque="${b}" ondragover="allowDrop(event)" ondragleave="dragLeave(event)" ondrop="drop(event)">`;
        
        if (isAlmuerzo) {
           html += `<div class="p-2 text-muted fw-bold text-center" style="background-color: #f1f3f5; border-radius: 8px; font-size: 0.85rem; user-select: none;">🍽️ ALMUERZO</div>`;
        } else if (clases.length > 0) {
          html += clases.map(c => {
              let conflictos = verificarConflictos(c);
              let hasConflict = conflictos.length > 0;
              let titleAttr = hasConflict ? `title="⚠️ CONFLICTO: ${conflictos.join(' | ')}"` : `title="Clic para filtrar | Doble clic para editar | Arrastrar para mover"`;
              let clickAsig = hasConflict ? `abrirChoqueModal('${c._rowIndex}')` : `clickTag('Asignatura', '${c.Asignatura}')`;
              let clickProf = hasConflict ? `abrirChoqueModal('${c._rowIndex}')` : `clickTag('Profesor', '${c.Profesor}')`;
              return `
              <div class="mb-1 draggable-card" draggable="true" ondragstart="drag(event, '${c._rowIndex}')">
                <span class="tag text-dark ${hasConflict ? 'conflict-tag' : ''}" style="background-color: ${hasConflict ? '#fadbd8' : getSubjectColor(c.Asignatura)}" 
                      onclick="${clickAsig}"
                      ${titleAttr} ondblclick="dblClickTag('Asignatura', '${c.Asignatura}', '${c.Curso}', '${c.Día}', ${b})">${c.Asignatura} (${c.Curso})</span>
                <div class="d-flex flex-wrap justify-content-center gap-1 mt-1">
                  <span class="tag tag-profesor ${hasConflict ? 'conflict-tag' : ''}" 
                        onclick="${clickProf}"
                        ondblclick="dblClickTag('Profesor', '${c.Profesor}', '${c.Curso}', '${c.Día}', ${b})">${c.Profesor}</span>
                  ${c.ProfesoresExtra ? c.ProfesoresExtra.map(p => `<span class="tag tag-profesor" onclick="clickTag('Profesor', '${p}')">${p}</span>`).join('') : ''}
                </div>
              </div>`
            }).join('');
        }
        html += `</td>`;
      });
      html += `</tr>`;
    });
    document.getElementById('visorGrid').innerHTML = html + '</tbody></table></div>';
    
    // -- RENDERIZAR BANDEJA POR ASIGNAR --
    let porAsignar = filtrados.filter(h => !h.Día || !h.Bloque);
    document.getElementById('countPorAsignar').innerText = porAsignar.length;
    
    let htmlBandeja = '';
    porAsignar.forEach(c => {
      let titleAttr = `title="Arrastra esta clase al horario"`;
      htmlBandeja += `
      <div class="mb-2 draggable-card p-1 border rounded shadow-sm" style="background-color: white;" draggable="true" ondragstart="drag(event, '${c._rowIndex}')">
        <span class="tag text-dark" style="background-color: ${getSubjectColor(c.Asignatura)}" 
              onclick="clickTag('Asignatura', '${c.Asignatura}')"
              ${titleAttr}>${c.Asignatura} (${c.Curso})</span>
        <div class="d-flex flex-wrap justify-content-center gap-1 mt-1">
          <span class="tag tag-profesor" onclick="clickTag('Profesor', '${c.Profesor}')">${c.Profesor}</span>
          ${c.ProfesoresExtra ? c.ProfesoresExtra.map(p => `<span class="tag tag-profesor" onclick="clickTag('Profesor', '${p}')">${p}</span>`).join('') : ''}
        </div>
      </div>`;
    });
    
    if(porAsignar.length === 0) {
      htmlBandeja = `<div class="text-muted text-center mt-4 small">¡Todo está asignado! 🎉</div>`;
    }
    document.getElementById('bandejaGrid').innerHTML = htmlBandeja;
  }

  function resetFiltros() {
    document.getElementById('selectCurso').value = "";
    document.getElementById('selectProfesor').value = "";
    document.getElementById('selectAsignatura').value = "";
    mostrarNoLectivas = false;
    document.getElementById('btnToggleNoLectivas').innerText = "👁️ Mostrar No Lectivas";
    cambioProfesor();
  }

  function abrirEditor(columna, valorActual, curso, dia, bloque) {
    editorContexto = { columna, valorActual, curso, dia, bloque };
    document.getElementById('modalTitle').innerText = `Editar ${columna}`;
    document.getElementById('labelNuevoValor').innerText = `Valor actual: ${valorActual}`;
    document.getElementById('checkMasivo').checked = false;

    const selectObj = document.getElementById('selectNuevoValor');
    selectObj.innerHTML = '';
    const opcionesUnicas = [...new Set(DB_HORARIOS.map(h => h[columna]))].sort();
    opcionesUnicas.forEach(opt => selectObj.add(new Option(opt, opt)));
    selectObj.value = valorActual;

    modalEl.show();
  }

  function guardarEdicion() {
    const nuevoValor = document.getElementById('selectNuevoValor').value;
    const esMasivo = document.getElementById('checkMasivo').checked;
    const { columna, valorActual, curso, dia, bloque } = editorContexto;

    DB_HORARIOS.forEach(h => {
      if (esMasivo) {
        if (h[columna] === valorActual) h[columna] = nuevoValor;
      } else {
        if (h.Curso === curso && h.Día === dia && parseInt(h.Bloque) === parseInt(bloque)) h[columna] = nuevoValor;
      }
    });

    if (esMasivo) {
      google.script.run.actualizarRegistroMasivo(columna, valorActual, nuevoValor);
    } else {
      google.script.run.actualizarRegistroUnico(curso, dia, bloque, columna, nuevoValor);
    }

    if(document.getElementById('selectProfesor').value) cambioProfesor();
    else renderizar();
    
    modalEl.hide();
  }

  function eliminarClase() {
    if(!confirm("¿Estás seguro de eliminar esta clase permanentemente? Esto la borrará del documento original.")) return;
    let clase = DB_HORARIOS.find(h => h.Curso === editorContexto.curso && h.Día === editorContexto.dia && String(h.Bloque) === String(editorContexto.bloque));
    if(clase && clase._rowIndex !== undefined) {
        google.script.run.withSuccessHandler(() => {
            window.onload(); // recargar todo para sincronizar los rowIndex
        }).withFailureHandler(e => showAlert('Error al eliminar: ' + e.message)).eliminarRegistroFila(clase._rowIndex);
        
        DB_HORARIOS = DB_HORARIOS.filter(h => h !== clase);
        modalEl.hide();
        renderizar();
    }
  }

  function abrirModalCrear() {
      const cursos = [...new Set(DB_HORARIOS.map(h => h.Curso).filter(Boolean))].sort();
      const asigs = [...new Set(DB_HORARIOS.map(h => h.Asignatura).filter(Boolean))].sort();
      const profes = [...new Set(DB_HORARIOS.map(h => h.Profesor).filter(Boolean))].sort();
      
      document.getElementById('crearCurso').innerHTML = cursos.map(c => `<option value="${c}">${c}</option>`).join('') + `<option value="ADMIN">ADMIN</option>`;
      document.getElementById('crearAsig').innerHTML = asigs.map(c => `<option value="${c}">${c}</option>`).join('') + `<option value="Hora No Lectiva">Hora No Lectiva</option>`;
      document.getElementById('crearProf').innerHTML = profes.map(c => `<option value="${c}">${c}</option>`).join('');
      crearModalEl.show();
  }
  
  function crearClaseManual() {
      document.getElementById('loading').style.display = 'block';
      let nuevaClase = {
         Curso: document.getElementById('crearCurso').value,
         Asignatura: document.getElementById('crearAsig').value,
         Profesor: document.getElementById('crearProf').value,
         Día: '',
         Bloque: ''
      };
      crearModalEl.hide();
      google.script.run.withSuccessHandler(() => {
         window.onload(); // recargar para obtener el rowIndex real
      }).withFailureHandler(e => {
         document.getElementById('loading').style.display = 'none';
         showAlert('Error al crear: ' + e.message);
      }).guardarHorarioGenerado([{
         isNew: true, curso: nuevaClase.Curso, asignatura: nuevaClase.Asignatura, profesor: nuevaClase.Profesor, dia: '', bloque: ''
      }]);
  }

  // ---- MOTOR ASIGNADOR AUTOMATICO ----
  async function ejecutarMotor(modo = 'LECTIVAS') {
    let btnId, textId, originalText;
    if (modo === 'LECTIVAS') { btnId = 'btnGenerar'; textId = 'btnGenerarText'; originalText = '🪄 Generar Lectivas'; }
    else if (modo === 'NO_LECTIVAS') { btnId = 'btnGenerarNoLectivas'; textId = 'btnGenerarNoLectivasText'; originalText = '⏳ Generar No Lectivas'; }
    else if (modo === 'FLEXIBLE') { btnId = 'btnGenerarFlexible'; textId = 'btnGenerarFlexibleText'; originalText = '🪄 Forzar Restantes'; }
    
    const btn = document.getElementById(btnId);
    const btnText = document.getElementById(textId);
    btn.disabled = true;
    btnText.innerText = "⏳ Generando...";
    
    await new Promise(r => setTimeout(r, 50));
    
    try {
      let numAsignados = 0;
      const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
      let porAsignar = DB_HORARIOS.filter(h => !h.Día || !h.Bloque);
      
      let isFlexible = (modo === 'FLEXIBLE');
      if (modo === 'LECTIVAS' || modo === 'NO_LECTIVAS' || modo === 'FLEXIBLE') {
          // 1. GENERATE PHANTOM ROWS 65/35 (SOLO EN MODO NO_LECTIVAS)
      if (modo === 'NO_LECTIVAS') {
          let todosProfes = [];
      DB_HORARIOS.forEach(h => {
          if(h.Profesor) todosProfes.push(h.Profesor);
          if(h.ProfesoresExtra) todosProfes.push(...h.ProfesoresExtra);
      });
      const profesoresUnicos = [...new Set(todosProfes)].filter(Boolean).sort();
      
      profesoresUnicos.forEach(p => {
          let regla = REGLAS_PROFES.find(r => r['Nombre Profesor'] === p);
          let maxHoras = regla ? parseInt(regla['Horas Máximas Semanales']) : NaN;
          
          if(isNaN(maxHoras) || maxHoras <= 0) {
              // Calcular horas lectivas reales (Agrupando Multicursos/Electivos)
              let clasesProf = DB_HORARIOS.filter(h => h.Profesor === p && h.Curso !== 'ADMIN' && h.Asignatura !== 'Consejo' && h.Asignatura !== 'Hora No Lectiva');
              
              let asignadas = clasesProf.filter(h => h.Día && h.Bloque);
              let noAsignadas = clasesProf.filter(h => !h.Día || !h.Bloque);
              
              let uniqueFisicas = new Set();
              asignadas.forEach(h => uniqueFisicas.add(`${h.Día}_${h.Bloque}`));
              
              let unassignedMap = {};
              noAsignadas.forEach(h => {
                  let asig = h.Asignatura;
                  if (!unassignedMap[asig]) unassignedMap[asig] = {};
                  if (!unassignedMap[asig][h.Curso]) unassignedMap[asig][h.Curso] = 0;
                  unassignedMap[asig][h.Curso]++;
              });
              
              let unassignedCount = 0;
              for (let asig in unassignedMap) {
                  if (asig.toUpperCase().includes('ELECTIVO')) {
                      let maxB = 0;
                      for (let c in unassignedMap[asig]) {
                          if (unassignedMap[asig][c] > maxB) maxB = unassignedMap[asig][c];
                      }
                      unassignedCount += maxB;
                  } else {
                      for (let c in unassignedMap[asig]) {
                          unassignedCount += unassignedMap[asig][c];
                      }
                  }
              }
              
              let horasLectivas = uniqueFisicas.size + unassignedCount;
              if (horasLectivas > 0) {
                 maxHoras = Math.round(horasLectivas / 0.65);
              } else {
                 maxHoras = 0;
              }
          }
          
          if(maxHoras > 0) {
              let noLectivasCalculadas = Math.round(maxHoras * 0.35);
              let yaTiene = DB_HORARIOS.filter(h => h.Profesor === p && (h.Asignatura === 'Hora No Lectiva' || h.Asignatura === 'Consejo')).length;
              let aCrear = noLectivasCalculadas - yaTiene;
              
              if(aCrear > 0) {
                   let tieneConsejo = DB_HORARIOS.filter(h => h.Profesor === p && h.Asignatura === 'Consejo').length;
                   
                   let reglaConsejoDia = REGLAS_GRALES.find(r => r['Asignatura'] === 'Consejo' && r['Condición'] === 'SOLO_DIA');
                   let diaConsejo = reglaConsejoDia ? String(reglaConsejoDia['Valores']).split(',')[0].trim() : 'Miércoles';
                   
                   let reglaConsejoBloques = REGLAS_GRALES.find(r => r['Asignatura'] === 'Consejo' && r['Condición'] === 'SOLO_BLOQUES');
                   let bloquesConsejo = reglaConsejoBloques ? String(reglaConsejoBloques['Valores']).split(',').map(s=>parseInt(s.trim())) : [11, 12];
                   
                   for(let i=0; i<aCrear; i++) {
                      let tipo = (tieneConsejo < bloquesConsejo.length && i < (bloquesConsejo.length - tieneConsejo)) ? 'Consejo' : 'Hora No Lectiva';
                      let nuevaClase = {
                         Curso: 'ADMIN',
                         Asignatura: tipo,
                         Profesor: p,
                         Día: '',
                         Bloque: '',
                         _isNew: true
                      };
                      if(tipo === 'Consejo') {
                         nuevaClase.Día = diaConsejo; 
                         nuevaClase.Bloque = bloquesConsejo[tieneConsejo];
                         tieneConsejo++;
                      }
                      DB_HORARIOS.push(nuevaClase);
                   }
               }
          }
      });
      } // Fin IF NO_LECTIVAS
      
      function calcularDificultad(clase) {
          let score = 0;
          let gRules = REGLAS_GRALES.filter(r => r['Asignatura'] === clase.Asignatura);
          if (gRules.some(r => r['Condición'] === 'BLOQUES_DOBLES')) score += 100;
          if (gRules.some(r => r['Condición'] === 'SOLO_DIA')) score += 50;
          if (gRules.some(r => r['Condición'] === 'SOLO_BLOQUES')) score += 50;
          if (gRules.some(r => r['Condición'] === 'NUNCA_BLOQUES')) score += 20;
          
          let pRule = REGLAS_PROFES.find(r => r['Nombre Profesor'] === clase.Profesor);
          if (pRule) {
              if (pRule['Días Libres']) score += 30;
              if (pRule['Bloques Bloqueados']) score += 30;
          }
          let numClasesProf = DB_HORARIOS.filter(h => h.Profesor === clase.Profesor && h.Curso !== 'ADMIN').length;
          score += (numClasesProf * 5);
          return score;
      }
      
      let porAsignar = DB_HORARIOS.filter(h => !h.Día || !h.Bloque);
      if (modo === 'LECTIVAS' || modo === 'FLEXIBLE') {
          porAsignar = porAsignar.filter(h => h.Asignatura !== 'Hora No Lectiva' && h.Asignatura !== 'Consejo');
          // Ordenamiento Inteligente (Heurística)
          porAsignar.forEach(c => c._dificultad = calcularDificultad(c));
          porAsignar.sort((a, b) => b._dificultad - a._dificultad);
      } else if (modo === 'NO_LECTIVAS') {
          porAsignar = porAsignar.filter(h => h.Asignatura === 'Hora No Lectiva' || h.Asignatura === 'Consejo');
      }
      
      let numAsignados = 0;
      
      const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
      const bloques = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
      
      for (let i = 0; i < porAsignar.length; i++) {
        let clase = porAsignar[i];
        if (clase.Día && clase.Bloque) continue; 
        
        let gRule = REGLAS_GRALES.find(r => r['Asignatura'] === clase.Asignatura);
        let requiereDoble = gRule && gRule['Condición'] === 'BLOQUES_DOBLES';
        
        let clasePar = null;
        if(requiereDoble) {
           clasePar = porAsignar.find((h, idx) => idx > i && !h.Día && h.Curso === clase.Curso && h.Asignatura === clase.Asignatura);
        }
        
        let ubicado = false;
        
        let diasOrdenados = [...dias];
        if (clase.Asignatura === 'Hora No Lectiva') {
            diasOrdenados.sort((d1, d2) => {
               let c1 = DB_HORARIOS.filter(h => h.Profesor === clase.Profesor && h.Día === d1 && h.Curso !== 'ADMIN').length;
               let c2 = DB_HORARIOS.filter(h => h.Profesor === clase.Profesor && h.Día === d2 && h.Curso !== 'ADMIN').length;
               return c2 - c1; // Prioritizes days with more classes
            });
        }
        
        for (let d of diasOrdenados) {
          let esNoLectiva = (clase.Asignatura === 'Hora No Lectiva' || clase.Asignatura === 'Consejo');
          let bloquesDisponibles = [];
          if (esNoLectiva) {
             bloquesDisponibles = requiereDoble ? [1, 3, 5, 7, 9, 11] : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
          } else {
             bloquesDisponibles = requiereDoble ? [1, 3, 5, 7, 9] : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
          }
          
          if (clase.Asignatura === 'Hora No Lectiva') {
             let occupiedBlocks = DB_HORARIOS.filter(h => h.Profesor === clase.Profesor && h.Día === d && h.Bloque).map(h => parseInt(h.Bloque));
             if (occupiedBlocks.length > 0) {
                bloquesDisponibles.sort((b1, b2) => {
                   let score1 = 0, score2 = 0;
                   let isVentana1 = occupiedBlocks.some(ob => ob < b1) && occupiedBlocks.some(ob => ob > b1);
                   let isVentana2 = occupiedBlocks.some(ob => ob < b2) && occupiedBlocks.some(ob => ob > b2);
                   if (isVentana1) score1 += 50;
                   if (isVentana2) score2 += 50;
                   
                   let minDist1 = Math.min(...occupiedBlocks.map(ob => Math.abs(ob - b1)));
                   let minDist2 = Math.min(...occupiedBlocks.map(ob => Math.abs(ob - b2)));
                   
                   if (minDist1 === 1) score1 += 10; else score1 -= minDist1;
                   if (minDist2 === 1) score2 += 10; else score2 -= minDist2;
                   
                   return score2 - score1; // Descending (best block first)
                });
             }
          }
          
            for (let b of bloquesDisponibles) {
              clase.Día = d;
              clase.Bloque = b;
              
              let errores1 = verificarConflictos(clase, isFlexible);
              
              if (errores1.length === 0) {
                 if(requiereDoble && clasePar) {
                    clasePar.Día = d;
                    clasePar.Bloque = b + 1;
                    
                    let errores2 = verificarConflictos(clasePar, isFlexible);
                    
                    if(errores2.length === 0) {
                     ubicado = true;
                     numAsignados += 2;
                     clase._modificadoXMotor = true;
                     clasePar._modificadoXMotor = true;
                     break;
                  } else {
                     clasePar.Día = '';
                     clasePar.Bloque = '';
                  }
               } else {
                  ubicado = true;
                  numAsignados++;
                  clase._modificadoXMotor = true;
                  break;
               }
            }
          }
          if (ubicado) break;
        }
        
        if (!ubicado) {
          clase.Día = '';
          clase.Bloque = '';
        }
      }
      
      // FASE 2: BACKTRACKING LOCAL (DESALOJO)
      let noUbicadas = porAsignar.filter(h => !h.Día || !h.Bloque);
      if ((modo === 'LECTIVAS' || modo === 'FLEXIBLE') && noUbicadas.length > 0) {
          let iteracionesGlobales = 0;
          const MAX_ITER = 50000;
          
          btnText.innerText = `⏳ Resolviendo cuellos de botella...`;
          await new Promise(r => setTimeout(r, 0));
          
          for (let i = 0; i < noUbicadas.length; i++) {
              if (iteracionesGlobales >= MAX_ITER) break;
              let claseRebotada = noUbicadas[i];
              if (claseRebotada.Día && claseRebotada.Bloque) continue; 
              
              let reqDobleRebotada = REGLAS_GRALES.some(r => r['Asignatura'] === claseRebotada.Asignatura && r['Condición'] === 'BLOQUES_DOBLES');
              let claseParRebotada = null;
              if (reqDobleRebotada) {
                  claseParRebotada = noUbicadas.find((h, idx) => idx > i && !h.Día && h.Curso === claseRebotada.Curso && h.Asignatura === claseRebotada.Asignatura);
                  if (!claseParRebotada) continue;
              }
              
              let desalojoExitoso = false;
              let bDisp = reqDobleRebotada ? [1, 3, 5, 7, 9] : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
              
              for (let d of dias) {
                  if (desalojoExitoso || iteracionesGlobales >= MAX_ITER) break;
                  for (let b of bDisp) {
                      iteracionesGlobales++;
                      if (iteracionesGlobales % 1000 === 0) {
                          btnText.innerText = `⏳ Explorando rutas alternativas (${iteracionesGlobales}/${MAX_ITER})...`;
                          await new Promise(r => setTimeout(r, 0));
                      }
                      
                      if (desalojoExitoso || iteracionesGlobales >= MAX_ITER) break;
                      
                      let estorbos = DB_HORARIOS.filter(h => (h.Curso === claseRebotada.Curso || h.Profesor === claseRebotada.Profesor) && h.Día === d && parseInt(h.Bloque) === b);
                      if (reqDobleRebotada) {
                          let estorbos2 = DB_HORARIOS.filter(h => (h.Curso === claseRebotada.Curso || h.Profesor === claseRebotada.Profesor) && h.Día === d && parseInt(h.Bloque) === (b + 1));
                          estorbos = estorbos.concat(estorbos2);
                      }
                      
                      estorbos = estorbos.filter(h => h.Día && h.Bloque && h !== claseRebotada && h !== claseParRebotada);
                      if (estorbos.length === 0) continue;
                      
                      // Identificar pares de los estorbos si son dobles
                      let estorbosFull = new Set(estorbos);
                      estorbos.forEach(e => {
                          if (REGLAS_GRALES.some(r => r['Asignatura'] === e.Asignatura && r['Condición'] === 'BLOQUES_DOBLES')) {
                              let ePar = DB_HORARIOS.find(h => h !== e && h.Día === e.Día && h.Curso === e.Curso && h.Asignatura === e.Asignatura && Math.abs(parseInt(h.Bloque) - parseInt(e.Bloque)) === 1);
                              if (ePar) estorbosFull.add(ePar);
                          }
                      });
                      estorbos = Array.from(estorbosFull);
                      
                      // Backup y Desalojo
                      let backup = estorbos.map(h => ({h: h, dia: h.Día, bloque: h.Bloque}));
                      estorbos.forEach(h => { h.Día = ''; h.Bloque = ''; });
                      
                      claseRebotada.Día = d; claseRebotada.Bloque = b;
                      let errsRebotada = verificarConflictos(claseRebotada, isFlexible);
                      let errsPar = [];
                      if (reqDobleRebotada) {
                          claseParRebotada.Día = d; claseParRebotada.Bloque = b + 1;
                          errsPar = verificarConflictos(claseParRebotada, isFlexible);
                      }
                      
                      if (errsRebotada.length === 0 && errsPar.length === 0) {
                          // Rebotada cabe. Reubicar estorbos.
                          let todosReubicados = true;
                          let procesados = new Set();
                          for (let estorbo of estorbos) {
                              if (procesados.has(estorbo)) continue;
                              procesados.add(estorbo);
                              
                              let reubicado = false;
                              let reqDobleEstorbo = REGLAS_GRALES.some(r => r['Asignatura'] === estorbo.Asignatura && r['Condición'] === 'BLOQUES_DOBLES');
                              let ePar = null;
                              if (reqDobleEstorbo) {
                                  ePar = estorbos.find(h => h !== estorbo && h.Curso === estorbo.Curso && h.Asignatura === estorbo.Asignatura);
                                  if (ePar) procesados.add(ePar);
                              }
                              
                              let bDispE = reqDobleEstorbo ? [1,3,5,7,9] : [1,2,3,4,5,6,7,8,9,10];
                              for (let dE of dias) {
                                  if (reubicado) break;
                                  for (let bE of bDispE) {
                                      estorbo.Día = dE; estorbo.Bloque = bE;
                                      if (reqDobleEstorbo && ePar) {
                                          ePar.Día = dE; ePar.Bloque = bE + 1;
                                          if (verificarConflictos(estorbo, isFlexible).length === 0 && verificarConflictos(ePar, isFlexible).length === 0) {
                                              reubicado = true; break;
                                          }
                                      } else {
                                          if (verificarConflictos(estorbo, isFlexible).length === 0) {
                                              reubicado = true; break;
                                          }
                                      }
                                  }
                              }
                              
                              // DEPTH 2 EVICTION (Desalojo en cadena para bloques simples)
                              if (!reubicado && !reqDobleEstorbo) {
                                  for (let dE2 of dias) {
                                      if (reubicado) break;
                                      for (let bE2 of bDispE) {
                                          let subEstorbos = DB_HORARIOS.filter(h => (h.Curso === estorbo.Curso || h.Profesor === estorbo.Profesor) && h.Día === dE2 && parseInt(h.Bloque) === bE2);
                                          subEstorbos = subEstorbos.filter(h => h.Día && h.Bloque && h !== estorbo && h !== claseRebotada && h !== claseParRebotada && !estorbos.includes(h));
                                          
                                          if (subEstorbos.length === 1) {
                                              let se = subEstorbos[0];
                                              let seReqDoble = REGLAS_GRALES.some(r => r['Asignatura'] === se.Asignatura && r['Condición'] === 'BLOQUES_DOBLES');
                                              if (seReqDoble) continue;
                                              
                                              let backupSeDia = se.Día; let backupSeBloque = se.Bloque;
                                              se.Día = ''; se.Bloque = '';
                                              
                                              estorbo.Día = dE2; estorbo.Bloque = bE2;
                                              if (verificarConflictos(estorbo, isFlexible).length === 0) {
                                                  let seReubicado = false;
                                                  let bDispSe = [1,2,3,4,5,6,7,8,9,10];
                                                  for (let dSe of dias) {
                                                      if (seReubicado) break;
                                                      for (let bSe of bDispSe) {
                                                          se.Día = dSe; se.Bloque = bSe;
                                                          if (verificarConflictos(se, isFlexible).length === 0) {
                                                              seReubicado = true; break;
                                                          }
                                                      }
                                                  }
                                                  if (seReubicado) {
                                                      reubicado = true;
                                                      se._modificadoXMotor = true;
                                                      break;
                                                  } else {
                                                      se.Día = backupSeDia; se.Bloque = backupSeBloque;
                                                  }
                                              } else {
                                                  se.Día = backupSeDia; se.Bloque = backupSeBloque;
                                              }
                                          }
                                      }
                                  }
                              }
                              
                              if (!reubicado) { todosReubicados = false; break; }
                          }
                          
                          if (todosReubicados) {
                              desalojoExitoso = true;
                              numAsignados += reqDobleRebotada ? 2 : 1;
                              claseRebotada._modificadoXMotor = true;
                              if(claseParRebotada) claseParRebotada._modificadoXMotor = true;
                              estorbos.forEach(h => h._modificadoXMotor = true);
                          } else {
                              backup.forEach(bk => { bk.h.Día = bk.dia; bk.h.Bloque = bk.bloque; });
                              claseRebotada.Día = ''; claseRebotada.Bloque = '';
                              if (reqDobleRebotada) { claseParRebotada.Día = ''; claseParRebotada.Bloque = ''; }
                          }
                      } else {
                          backup.forEach(bk => { bk.h.Día = bk.dia; bk.h.Bloque = bk.bloque; });
                          claseRebotada.Día = ''; claseRebotada.Bloque = '';
                          if (reqDobleRebotada) { claseParRebotada.Día = ''; claseParRebotada.Bloque = ''; }
                      }
                  }
              }
          }
      }
      } // Fin if LECTIVAS o NO_LECTIVAS
      
      let clasesCambiadas = DB_HORARIOS.filter(h => 
         h._isNew || (h._rowIndex !== undefined && h._modificadoXMotor)
      );
      
      if (clasesCambiadas.length > 0) {
        showAlert(`Algoritmo finalizado: ${numAsignados} clases ubicadas automáticamente (incluidas horas No Lectivas). Guardando en Sheets...`, 'success');
        let asignaciones = clasesCambiadas.map(h => ({ 
           rowIndex: h._rowIndex, 
           dia: h.Día, 
           bloque: h.Bloque,
           isNew: h._isNew,
           curso: h.Curso,
           asignatura: h.Asignatura,
           profesor: h.Profesor
        }));
        
        google.script.run.withSuccessHandler(() => {
          showAlert(`¡Horario guardado en la Nube con éxito!`, 'success');
          btn.disabled = false;
          btnText.innerText = originalText;
          
          document.getElementById('loading').style.display = 'block';
          window.onload(); // Recargar para sincronizar los rowIndex reales y evitar sobreescribir títulos
        }).withFailureHandler((e) => {
          showAlert('Error al guardar: ' + e.message, 'danger');
          btn.disabled = false;
          btnText.innerText = originalText;
        }).guardarHorarioGenerado(asignaciones);
      } else {
        showAlert('No se ubicaron nuevas clases. Revisa la bandeja lateral.', 'warning');
        btn.disabled = false;
        btnText.innerText = originalText;
      }
      
      renderizar();
    } catch (err) {
      console.error(err);
      showAlert('Error en el motor: ' + err.message, 'danger');
      let btnId, textId, originalText;
      if (modo === 'LECTIVAS') { btnId = 'btnGenerar'; textId = 'btnGenerarText'; originalText = '🪄 Generar Lectivas'; }
      else if (modo === 'NO_LECTIVAS') { btnId = 'btnGenerarNoLectivas'; textId = 'btnGenerarNoLectivasText'; originalText = '⏳ Generar No Lectivas'; }
      else if (modo === 'FLEXIBLE') { btnId = 'btnGenerarFlexible'; textId = 'btnGenerarFlexibleText'; originalText = '🪄 Forzar Restantes'; }
      document.getElementById(btnId).disabled = false;
      document.getElementById(textId).innerText = originalText;
    }
  }
  
  // ---- REPORTES ----
  function exportarReportes() {
    const btnText = document.getElementById('btnExportText');
    btnText.innerText = "⏳ Exportando...";
    google.script.run.withSuccessHandler((msg) => {
      showAlert(msg, 'success');
      btnText.innerText = "🖨️ Exportar";
    }).withFailureHandler((e) => {
      showAlert('Error al exportar: ' + e.message, 'danger');
      btnText.innerText = "🖨️ Exportar";
    }).generarReportesSheets();
  }

  // ---- LIMPIAR TABLERO ----
  function limpiarTablero() {
      if (!confirm("¿Estás seguro de que deseas vaciar todo el horario? Esto devolverá todas las clases a la bandeja y eliminará las horas no lectivas generadas.")) return;
      
      const btn = document.getElementById('btnLimpiarTablero');
      btn.disabled = true;
      btn.innerText = "⏳ Limpiando...";
      document.getElementById('loading').style.display = 'block';
      
      google.script.run.withSuccessHandler(msg => {
          window.onload(); // Recargar datos limpios
      }).withFailureHandler(err => {
          showAlert('Error al limpiar: ' + err.message, 'danger');
          btn.disabled = false;
          btn.innerText = "🧹 Limpiar Tablero";
          document.getElementById('loading').style.display = 'none';
      }).limpiarDatosNube();
  }

  // ---- GEMINI COPILOTO ----
  const GEMINI_API_KEY = 'AIzaSyAHf9l6uId3NeRGo5gra8AJ9uhRgGf-jDc';
  const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  
  let chatHistory = [
    {
       role: "user",
       parts: [{ text: "Eres un experto coordinador académico escolar. Tienes acceso a los horarios de clases, profesores y reglas. Tu trabajo es ayudar al usuario a ubicar clases sin asignar, resolver conflictos de horarios, y analizar el horario en busca de mejoras pedagógicas. Responde de forma clara, directa y en español." }]
    },
    {
       role: "model",
       parts: [{ text: "¡Entendido! Estoy listo para analizar el horario y darte las mejores soluciones." }]
    }
  ];

  function toggleGeminiChat() {
     const panel = document.getElementById('geminiChatPanel');
     if(panel.classList.contains('d-none')) {
        panel.classList.remove('d-none');
        document.getElementById('geminiInput').focus();
     } else {
        panel.classList.add('d-none');
     }
  }

  function appendChatMessage(sender, text) {
     const historyDiv = document.getElementById('geminiChatHistory');
     const isUser = sender === 'user';
     const bubbleClass = isUser ? 'bg-dark text-warning ms-auto' : 'bg-white text-dark border';
     
     let htmlText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
     
     const msgHtml = `<div class="p-2 mb-1 rounded shadow-sm ${bubbleClass}" style="max-width: 85%; width: fit-content; font-size: 0.9rem;">
        ${htmlText}
     </div>`;
     historyDiv.innerHTML += msgHtml;
     historyDiv.scrollTop = historyDiv.scrollHeight;
  }

  async function enviarGemini() {
     const input = document.getElementById('geminiInput');
     const userText = input.value.trim();
     if(!userText) return;
     
     input.value = '';
     appendChatMessage('user', userText);
     appendChatMessage('model', '<span id="geminiTyping">⏳ Analizando horario...</span>');
     
     const resumenHorario = DB_HORARIOS.map(h => `${h.Curso} | ${h.Asignatura} | Prof: ${h.Profesor} | ${h.Día || 'SIN ASIGNAR'} - Bloque: ${h.Bloque || 'SIN ASIGNAR'}`).join('\n');
     
     const promptConContexto = `
ESTADO ACTUAL DEL HORARIO (Lista de Clases):
${resumenHorario}

REGLAS DE PROFESORES ACTIVAS:
${JSON.stringify(REGLAS_PROFES)}

PREGUNTA O SOLICITUD DEL USUARIO:
${userText}

Instrucción: Analiza el ESTADO ACTUAL y responde a la pregunta del usuario.
     `;
     
     const requestBody = {
         contents: [
            ...chatHistory,
            { role: "user", parts: [{ text: promptConContexto }] }
         ]
     };

     try {
         const response = await fetch(GEMINI_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
         });
         
         const data = await response.json();
         if(data.error) throw new Error(data.error.message);
         
         const geminiReply = data.candidates[0].content.parts[0].text;
         
         const typingEl = document.getElementById('geminiTyping');
         if(typingEl && typingEl.parentElement) typingEl.parentElement.remove();
         
         appendChatMessage('model', geminiReply);
         
         chatHistory.push({ role: "user", parts: [{ text: userText }] });
         chatHistory.push({ role: "model", parts: [{ text: geminiReply }] });
         
     } catch (error) {
         const typingEl = document.getElementById('geminiTyping');
         if(typingEl && typingEl.parentElement) typingEl.parentElement.remove();
         appendChatMessage('model', '❌ Ups, hubo un error de conexión: ' + error.message);
     }
  }


  // --- GESTIÓN DE REGLAS ---
  let tempReglasGrales = [];
  let tempReglasProfes = [];

  function abrirModalReglas() {
    tempReglasGrales = JSON.parse(JSON.stringify(REGLAS_GRALES));
    tempReglasProfes = JSON.parse(JSON.stringify(REGLAS_PROFES));
    renderReglasTables();
    document.getElementById('reglasStatusText').innerText = '';
    const modal = new bootstrap.Modal(document.getElementById('modalReglas'));
    modal.show();
  }

  function renderReglasTables() {
    const tbodyG = document.querySelector('#tableReglasGrales tbody');
    tbodyG.innerHTML = '';
    tempReglasGrales.forEach((r, idx) => {
      tbodyG.innerHTML += `
        <tr>
          <td><input type="text" class="form-control form-control-sm border-0 bg-transparent" value="${r.Asignatura || ''}" onchange="updateRG(${idx}, 'Asignatura', this.value)"></td>
          <td>
            <select class="form-select form-select-sm border-0 bg-transparent" onchange="updateRG(${idx}, 'Condición', this.value)">
              <option value="MAX_POR_DIA" ${r.Condición==='MAX_POR_DIA'?'selected':''}>MAX_POR_DIA</option>
              <option value="BLOQUES_DOBLES" ${r.Condición==='BLOQUES_DOBLES'?'selected':''}>BLOQUES_DOBLES</option>
              <option value="SOLO_BLOQUES" ${r.Condición==='SOLO_BLOQUES'?'selected':''}>SOLO_BLOQUES</option>
              <option value="SOLO_DIA" ${r.Condición==='SOLO_DIA'?'selected':''}>SOLO_DIA</option>
              <option value="NUNCA_BLOQUES" ${r.Condición==='NUNCA_BLOQUES'?'selected':''}>NUNCA_BLOQUES</option>
              <option value="MAX_SEGUIDAS" ${r.Condición==='MAX_SEGUIDAS'?'selected':''}>MAX_SEGUIDAS</option>
              <option value="REQUIERE_TALLER" ${r.Condición==='REQUIERE_TALLER'?'selected':''}>REQUIERE_TALLER</option>
            </select>
          </td>
          <td><input type="text" class="form-control form-control-sm border-0 bg-transparent" value="${r.Valores || ''}" onchange="updateRG(${idx}, 'Valores', this.value)"></td>
          <td class="text-center"><button class="btn btn-sm text-danger" onclick="deleteRG(${idx})"><i class="bi bi-trash"></i></button></td>
        </tr>
      `;
    });

    const tbodyP = document.querySelector('#tableReglasProfes tbody');
    tbodyP.innerHTML = '';
    tempReglasProfes.forEach((r, idx) => {
      tbodyP.innerHTML += `
        <tr>
          <td><input type="text" class="form-control form-control-sm border-0 bg-transparent" value="${r['Nombre Profesor'] || ''}" onchange="updateRP(${idx}, 'Nombre Profesor', this.value)"></td>
          <td><input type="text" class="form-control form-control-sm border-0 bg-transparent" value="${r['Días Libres'] || ''}" onchange="updateRP(${idx}, 'Días Libres', this.value)" placeholder="Ej: Lunes, Martes"></td>
          <td><input type="text" class="form-control form-control-sm border-0 bg-transparent" value="${r['Bloques Bloqueados'] || ''}" onchange="updateRP(${idx}, 'Bloques Bloqueados', this.value)" placeholder="Ej: Lunes:1,2; Viernes:9,10"></td>
          <td><input type="number" class="form-control form-control-sm border-0 bg-transparent" value="${r['Horas Máximas Semanales'] || ''}" onchange="updateRP(${idx}, 'Horas Máximas Semanales', this.value)"></td>
          <td class="text-center"><button class="btn btn-sm text-danger" onclick="deleteRP(${idx})"><i class="bi bi-trash"></i></button></td>
        </tr>
      `;
    });
  }

  function updateRG(idx, field, val) { tempReglasGrales[idx][field] = val; }
  function updateRP(idx, field, val) { tempReglasProfes[idx][field] = val; }
  
  function deleteRG(idx) { tempReglasGrales.splice(idx, 1); renderReglasTables(); }
  function deleteRP(idx) { tempReglasProfes.splice(idx, 1); renderReglasTables(); }
  
  function addReglaGral() {
    tempReglasGrales.push({ Asignatura: '', Condición: 'MAX_POR_DIA', Valores: '' });
    renderReglasTables();
  }
  function addReglaProf() {
    tempReglasProfes.push({ 'Nombre Profesor': '', 'Días Libres': '', 'Bloques Bloqueados': '', 'Horas Máximas Semanales': '' });
    renderReglasTables();
  }

  function guardarReglasDesdeUI() {
    const btn = document.getElementById('btnGuardarReglas');
    const status = document.getElementById('reglasStatusText');
    
    // Filtrar filas vacías (sin asignatura o profesor)
    tempReglasGrales = tempReglasGrales.filter(r => String(r.Asignatura).trim() !== '');
    tempReglasProfes = tempReglasProfes.filter(r => String(r['Nombre Profesor']).trim() !== '');

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...';
    status.innerText = 'Actualizando hojas en Google Sheets...';

    google.script.run.withSuccessHandler(() => {
      // Actualizar variables globales locales
      REGLAS_GRALES = JSON.parse(JSON.stringify(tempReglasGrales));
      REGLAS_PROFES = JSON.parse(JSON.stringify(tempReglasProfes));
      
      btn.disabled = false;
      btn.innerHTML = '<i class="bi bi-cloud-upload"></i> Guardar en Sheets';
      status.innerText = '';
      
      showAlert('Las reglas se han guardado exitosamente en Google Sheets. Se aplicarán en la próxima corrida del motor.', 'success');
      bootstrap.Modal.getInstance(document.getElementById('modalReglas')).hide();
    }).withFailureHandler((err) => {
      btn.disabled = false;
      btn.innerHTML = '<i class="bi bi-cloud-upload"></i> Guardar en Sheets';
      status.innerText = 'Error: ' + err.message;
    }).guardarReglas(tempReglasGrales, tempReglasProfes);
  }



  // --- INTEGRACIÓN GEMINI AI ---
  let geminiSugerenciasPendientes = [];

  function abrirAsistenteIA() {
    let unassigned = DB_HORARIOS.filter(h => h.Día === '' && String(h.Asignatura).toLowerCase() !== 'consejo');
    if (unassigned.length === 0) {
      showAlert('No hay clases sin asignar para enviar a la IA.', 'info');
      return;
    }
    
    const key = localStorage.getItem('gemini_api_key');
    if (!key) {
      new bootstrap.Modal(document.getElementById('modalGeminiKey')).show();
      return;
    }
    solicitarAyudaGemini(key);
  }

  function guardarGeminiKeyYContinuar() {
    const key = document.getElementById('geminiApiKeyInput').value.trim();
    if (key) {
      localStorage.setItem('gemini_api_key', key);
      bootstrap.Modal.getInstance(document.getElementById('modalGeminiKey')).hide();
      solicitarAyudaGemini(key);
    }
  }

  async function solicitarAyudaGemini(apiKey) {
    const btn = document.getElementById('btnAsistenteIA');
    const txt = document.getElementById('btnAsistenteIAText');
    btn.disabled = true;
    txt.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Pensando...';
    
    // Preparar el estado reducido para ahorrar tokens
    const unassigned = DB_HORARIOS.filter(h => h.Día === '' && String(h.Asignatura).toLowerCase() !== 'consejo').map(h => ({
      id: h._rowIndex,
      curso: h.Curso,
      asignatura: h.Asignatura,
      profesor: h.Profesor
    }));

    // Tomar una muestra del tablero actual (clases asignadas)
    const assigned = DB_HORARIOS.filter(h => h.Día !== '').map(h => ({
      id: h._rowIndex,
      curso: h.Curso,
      dia: h.Día,
      bloque: h.Bloque,
      asignatura: h.Asignatura,
      profesor: h.Profesor
    }));

    const promptText = `Eres un experto planificador escolar matemático.
Tu tarea es ubicar clases que no tienen horario, resolviendo conflictos intercambiando clases ya asignadas si es necesario.
Existen topes de profesores, tope de jornada (1 a 10) y restricciones generales.
Reglas: Ningún profesor puede estar en dos cursos el mismo día y bloque. Ningún curso puede tener dos materias el mismo día y bloque.

Clases por ubicar:
${JSON.stringify(unassigned)}

Tablero actual:
${JSON.stringify(assigned)}

REGLAS GENERALES:
${JSON.stringify(REGLAS_GRALES)}

Debes devolver EXCLUSIVAMENTE un bloque JSON válido con el siguiente esquema, sin markdown adicional:
{
  "analisis": "Breve explicación de por qué fue difícil y qué movimientos sugieres.",
  "movimientos": [
    {
      "claseId": 123, 
      "nuevoDia": "Lunes",
      "nuevoBloque": 3,
      "accion": "Mover clase existente para hacer hueco" o "Asignar nueva clase"
    }
  ]
}
No devuelvas texto fuera del JSON.`;

    let maxRetries = 6;
    let data = null;
    let success = false;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + apiKey, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
            generationConfig: {
              temperature: 0.2,
              responseMimeType: "application/json"
            }
          })
        });
        
        data = await response.json();
        
        if (data.error) {
          if (data.error.code === 503 || data.error.code === 429 || String(data.error.message).includes("high demand") || String(data.error.message).includes("overloaded")) {
            txt.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Alta demanda. Reintentando (' + (i+1) + '/' + maxRetries + ')...';
            await new Promise(r => setTimeout(r, 4000 * (i + 1))); // Respaldo exponencial
            continue;
          }
          
          if (data.error.code === 400 && data.error.message.includes("API key not valid")) {
            localStorage.removeItem('gemini_api_key');
            showAlert('API Key inválida. Por favor, ingrésala de nuevo.', 'danger');
          } else {
            showAlert('Error de Gemini: ' + data.error.message, 'danger');
          }
          btn.disabled = false;
          txt.innerText = 'Asistente IA';
          return;
        }
        
        success = true;
        break; // Éxito
        
      } catch (e) {
        if (i === maxRetries - 1) {
          showAlert('Falló la conexión con Gemini: ' + e.message, 'danger');
          btn.disabled = false;
          txt.innerText = 'Asistente IA';
          return;
        }
        txt.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Fallo de red. Reintentando (' + (i+1) + '/' + maxRetries + ')...';
        await new Promise(r => setTimeout(r, 4000 * (i + 1)));
      }
    }
    
    if (success && data && data.candidates) {
      let textRes = data.candidates[0].content.parts[0].text;
      const parsed = JSON.parse(textRes);
      
      geminiSugerenciasPendientes = parsed.movimientos || [];
      if(parsed.analisis) { showAlert('🤖 IA: ' + parsed.analisis, 'info'); }
      aplicarGeminiSugerencias();
    }
    
    btn.disabled = false;
    txt.innerText = 'Asistente IA';
  }

  function renderGeminiSugerencias(analisis, movimientos) {
    const container = document.getElementById('geminiResultsContent');
    let html = `<p class="fw-bold text-dark">🧠 Análisis de la IA:</p><p class="text-muted">${analisis}</p><hr>`;
    
    if (movimientos.length === 0) {
      html += `<div class="alert alert-warning">La IA no logró encontrar una secuencia de movimientos válida.</div>`;
    } else {
      html += `<p class="fw-bold text-dark">📥 Movimientos Propuestos:</p><ul class="list-group list-group-flush mb-3">`;
      movimientos.forEach(m => {
        const clase = DB_HORARIOS.find(h => h._rowIndex === m.claseId);
        let badge = clase && clase.Día === '' ? '<span class="badge bg-success">Nueva Asignación</span>' : '<span class="badge bg-warning text-dark">Reubicación</span>';
        let desc = clase ? `${clase.Curso} - ${clase.Asignatura} (${clase.Profesor})` : `Clase ID: ${m.claseId} (No encontrada)`;
        html += `<li class="list-group-item d-flex justify-content-between align-items-start">
                   <div class="ms-2 me-auto">
                     <div class="fw-bold">${desc} ${badge}</div>
                     Mover a: <strong class="text-primary">${m.nuevoDia} - Bloque ${m.nuevoBloque}</strong><br>
                     <small class="text-muted">Motivo: ${m.accion}</small>
                   </div>
                 </li>`;
      });
      html += `</ul><div class="alert alert-info py-2 small"><i class="bi bi-shield-check"></i> El motor verificará estos movimientos contra las reglas duras antes de insertarlos.</div>`;
    }
    
    container.innerHTML = html;
    new bootstrap.Modal(document.getElementById('modalGeminiResults')).show();
  }

  function aplicarGeminiSugerencias() {
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
          
          let movDesc = clase._oldDia ? `Movido de ${clase._oldDia}-${clase._oldBloque} a ${clase.Día}-${clase.Bloque}` : `Asignado en ${clase.Día}-${clase.Bloque}`;
          reporteHtml += `<li class="list-group-item">
            <strong>${clase.Curso} - ${clase.Asignatura} (${clase.Profesor})</strong><br>
            <small class="text-success">${movDesc}</small>
          </li>`;
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
         resContainer.innerHTML = `<div class="alert alert-success fw-bold"><i class="bi bi-check-circle"></i> ¡Movimientos inyectados y guardados en Sheets!</div>` + reporteHtml;
         
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
  }

