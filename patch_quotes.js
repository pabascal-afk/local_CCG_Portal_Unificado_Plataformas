const fs = require('fs');
let code = fs.readFileSync('public/dashboard.html', 'utf8');

// We need to fix the line:
// "<button class='btn btn-sm btn-outline-primary float-end p-1 ms-2' onclick='modalTodas.hide(); abrirModalEnvio("" + ev.id + "", "" + ev.curso + "", "" + ev.asignatura + "")'><i class='bi bi-paperclip'></i> Enviar</button>"

const brokenStr = `onclick='modalTodas.hide(); abrirModalEnvio("" + ev.id + "", "" + ev.curso + "", "" + ev.asignatura + "")'`;
const fixedStr = `onclick='modalTodas.hide(); abrirModalEnvio(\\"" + ev.id + "\\", \\"" + ev.curso + "\\", \\"" + ev.asignatura + "\\")'`;

code = code.split(brokenStr).join(fixedStr);
fs.writeFileSync('public/dashboard.html', code, 'utf8');
console.log('Fixed quotes');
