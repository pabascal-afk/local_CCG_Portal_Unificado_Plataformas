const fs = require('fs');
let html = fs.readFileSync('public/calendario.html', 'utf8');

const injection = `
          <div style="margin-top: 10px; padding: 10px; background: #fff3cd; border-radius: 5px; border: 1px solid #ffe69c;">
            <label style="font-size:0.85em; font-weight:bold; color: #664d03;">Cursos Afectados (Si está bloqueando)</label>
            <input type="text" name="cursosAfectados" id="inputCursos" class="form-control" placeholder="Ej: 1A, 2B (Dejar TODOS por defecto)" value="TODOS" style="margin-top: 5px;">
            <small style="font-size:0.7em; color:#664d03; display:block; margin-top:3px;">*Si dice "TODOS", bloquea todo el colegio. Si quieres bloquear solo algunos, sepáralos por comas.</small>
          </div>
`;

// Insert the injection right before the checkBloquea div
html = html.replace(/<div style="margin-top: 10px;">\s*<label style="font-size:0.85em; font-weight:600; cursor:pointer;">\s*<input type="checkbox" id="checkBloquea"/, injection + '$&');

// Also inject into Duplicar modal just in case? The user modifies it in Evento modal.
// But wait, what if the user tries to edit it and I haven't populated it?
// In my previous script I updated JS: 
// `document.getElementById('inputCursos').value = ev.cursos || 'TODOS'; `
// Let's make sure it's there.

fs.writeFileSync('public/calendario.html', html, 'utf8');
console.log('Calendario.html modificado correctamente');
