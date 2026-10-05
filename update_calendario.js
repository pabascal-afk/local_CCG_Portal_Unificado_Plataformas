const fs = require('fs');
let html = fs.readFileSync('public/calendario.html', 'utf8');

const injection = `
          <div style="margin-top: 10px;">
            <label style="font-size:0.85em; font-weight:600;">Cursos Afectados</label>
            <input type="text" name="cursosAfectados" id="inputCursos" class="form-control" placeholder="TODOS o ej: 1A, 2B, 3C" value="TODOS">
            <small style="font-size:0.7em; color:#777;">Si dice "TODOS", bloquea todo el colegio. Si no, separa los cursos por coma.</small>
          </div>
`;

html = html.replace('<div style="margin-top: 10px;">\n          <label style="font-size:0.85em; font-weight:600; cursor:pointer;">', injection + '<div style="margin-top: 10px;">\n          <label style="font-size:0.85em; font-weight:600; cursor:pointer;">');

// Modify JS to read/write it
html = html.replace("const datos = { idEditar: this.idEditar.value, fecha: this.fecha.value, texto: this.texto.value, tipo: this.tipo.value, tipoNuevo: this.tipoNuevo.value, colorNuevo: this.colorNuevo.value, bloquea: document.getElementById('checkBloquea').checked, bloques: obtenerValoresBloques() };",
"const datos = { idEditar: this.idEditar.value, fecha: this.fecha.value, texto: this.texto.value, tipo: this.tipo.value, tipoNuevo: this.tipoNuevo.value, colorNuevo: this.colorNuevo.value, bloquea: document.getElementById('checkBloquea').checked, bloques: obtenerValoresBloques(), cursos: document.getElementById('inputCursos').value };");

// Modify abrirModalEventos to set the value
html = html.replace(/setValoresBloques\(ev\.bloquea, ev\.bloques\); \} \n          else \{/, 
"setValoresBloques(ev.bloquea, ev.bloques); document.getElementById('inputCursos').value = ev.cursos || 'TODOS'; } \n          else { document.getElementById('inputCursos').value = 'TODOS'; ");

fs.writeFileSync('public/calendario.html', html, 'utf8');
console.log('Calendario.html modificado para Cursos');
