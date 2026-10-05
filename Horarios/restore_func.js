const fs = require('fs');
let codeHtml = fs.readFileSync('c:/Users/TI/Documents/Horarios/Asignador_Index.html.txt', 'utf8');

const missingFunc = `
function abrirModuloProfesores() {
    const tbody = document.getElementById('tbodyPerfiles');
    tbody.innerHTML = '';
    if(REGLAS_PROFES && REGLAS_PROFES.length > 0) {
        REGLAS_PROFES.forEach(r => {
            agregarFilaPerfil(r['Nombre Profesor'], r['Horas Maximas'], r['Cursos'], r['Asignaturas']);
        });
    }
    const modal = new bootstrap.Modal(document.getElementById('modalPerfilesProfesores'));
    modal.show();
}

`;

codeHtml = codeHtml.replace('// WIZARD LOGIC', missingFunc + '// WIZARD LOGIC');

fs.writeFileSync('c:/Users/TI/Documents/Horarios/Asignador_Index.html.txt', codeHtml);
console.log('Restored abrirModuloProfesores.');
