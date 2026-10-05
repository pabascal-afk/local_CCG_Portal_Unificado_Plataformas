const fs = require('fs');

let codeHtml = fs.readFileSync('c:/Users/TI/Documents/Horarios/Asignador_Index.html.txt', 'utf8');

const oldEmpezar = `function empezarDesdeCero() {
    if(!confirm("⚠️ ¿Estás seguro que deseas limpiar TODOS los profesores asignados? Se mantendrán las materias y cursos, pero los profesores se vaciarán para empezar desde cero.")) return;
    
    DB_HORARIOS.forEach(h => {
        if(h.Profesor) {
            h.Profesor = '';
            h.ProfesoresExtra = [];
            h.MateriasExtra = {};
            movimientosRealizados.push(h); // Para que se guarde el cambio
        }
    });
    
    renderizar();
    showAlert('Tablero limpiado. Listo para Auto-Asignar o asignar manualmente.', 'info');
}`;

const newEmpezar = `function empezarDesdeCero() {
    if(!confirm("⚠️ ¿Estás seguro que deseas limpiar TODOS los profesores asignados? Se mantendrán las materias y cursos, pero los profesores se vaciarán para empezar desde cero.")) return;
    
    let asignaciones = [];
    DB_HORARIOS.forEach(h => {
        if(h.Profesor) {
            h.Profesor = '';
            h.ProfesoresExtra = [];
            h.MateriasExtra = {};
            asignaciones.push({
                rowIndex: h._rowIndex,
                dia: h.Día,
                bloque: h.Bloque,
                profesor: ''
            });
        }
    });
    
    renderizar();
    
    if (asignaciones.length > 0) {
        showAlert('Guardando limpieza en la base de datos...', 'info');
        google.script.run.withSuccessHandler(function() {
            showAlert('Tablero limpiado en la base de datos. Listo para Auto-Asignar.', 'success');
        }).guardarHorarioGenerado(asignaciones);
    } else {
        showAlert('El tablero ya estaba limpio.', 'info');
    }
}`;

codeHtml = codeHtml.replace(oldEmpezar, newEmpezar);


const oldAutoAsignar = `                let elegido = candidatos[0]['Nombre Profesor'];
                h.Profesor = elegido;
                horasActuales[elegido]++;
                movimientosRealizados.push(h);
                asignacionesNuevas++;
            }
        }
    });

    if(asignacionesNuevas > 0) {
        renderizar();
        showAlert(\`¡Éxito! Se han auto-asignado \${asignacionesNuevas} bloques usando los perfiles condicionales. Recuerda Guardar los Cambios.\`, 'success');
    } else {
        showAlert('No se pudieron asignar bloques nuevos. Revisa si hay choques horarios o si los profesores alcanzaron su límite.', 'warning');
    }`;


const newAutoAsignar = `                let elegido = candidatos[0]['Nombre Profesor'];
                h.Profesor = elegido;
                horasActuales[elegido]++;
                if (!window.asignacionesAuto) window.asignacionesAuto = [];
                window.asignacionesAuto.push({
                    rowIndex: h._rowIndex,
                    dia: h.Día,
                    bloque: h.Bloque,
                    profesor: elegido,
                    materiasExtra: h.MateriasExtra
                });
                asignacionesNuevas++;
            }
        }
    });

    if(asignacionesNuevas > 0) {
        renderizar();
        showAlert('Guardando ' + asignacionesNuevas + ' asignaciones en la base de datos...', 'info');
        google.script.run.withSuccessHandler(function() {
            showAlert(\`¡Éxito! Se han auto-asignado y guardado \${asignacionesNuevas} bloques usando los perfiles condicionales.\`, 'success');
        }).guardarHorarioGenerado(window.asignacionesAuto);
        window.asignacionesAuto = [];
    } else {
        showAlert('No se pudieron asignar bloques nuevos. Revisa si hay choques horarios o si los profesores alcanzaron su límite.', 'warning');
    }`;

codeHtml = codeHtml.replace(oldAutoAsignar, newAutoAsignar);

fs.writeFileSync('c:/Users/TI/Documents/Horarios/Asignador_Index.html.txt', codeHtml);
console.log('Fixed undefined array and added autosave to both functions');
