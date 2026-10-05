const fs = require('fs');

let codeHtml = fs.readFileSync('c:/Users/TI/Documents/Horarios/Asignador_Index.html.txt', 'utf8');

// Fix showAlert
const oldAlert = "showAlert(\\`¡Éxito! Se han auto-asignado \\${asignacionesNuevas} bloques usando los perfiles condicionales. Recuerda Guardar los Cambios.\\`, 'success');";
const newAlert = "showAlert(`¡Éxito! Se han auto-asignado ${asignacionesNuevas} bloques usando los perfiles condicionales. Recuerda Guardar los Cambios.`, 'success');";

codeHtml = codeHtml.replace(oldAlert, newAlert);

// Fix innerHTML variables
const oldTr = `    tr.innerHTML = \`
        <td><input type="text" class="form-control form-control-sm" value="\\$\\{prof\\}" placeholder="Nombre"></td>
        <td><input type="number" class="form-control form-control-sm" value="\\$\\{max\\}" placeholder="Horas"></td>
        <td><input type="text" class="form-control form-control-sm" value="\\$\\{cursos\\}" placeholder="Ej: 5 Básico, 6 Básico"></td>
        <td><input type="text" class="form-control form-control-sm" value="\\$\\{asig\\}" placeholder="Ej: Matemáticas, Lenguaje"></td>
        <td class="text-center"><button class="btn btn-sm btn-outline-danger" onclick="this.closest('tr').remove()"><i class="bi bi-trash"></i></button></td>
    \`;`;

const newTr = `    tr.innerHTML = \`
        <td><input type="text" class="form-control form-control-sm" value="\${prof}" placeholder="Nombre"></td>
        <td><input type="number" class="form-control form-control-sm" value="\${max}" placeholder="Horas"></td>
        <td><input type="text" class="form-control form-control-sm" value="\${cursos}" placeholder="Ej: 5 Básico, 6 Básico"></td>
        <td><input type="text" class="form-control form-control-sm" value="\${asig}" placeholder="Ej: Matemáticas, Lenguaje"></td>
        <td class="text-center"><button class="btn btn-sm btn-outline-danger" onclick="this.closest('tr').remove()"><i class="bi bi-trash"></i></button></td>
    \`;`;

codeHtml = codeHtml.replace(oldTr, newTr);

fs.writeFileSync('c:/Users/TI/Documents/Horarios/Asignador_Index.html.txt', codeHtml);
console.log('Fixed JS escapes');
