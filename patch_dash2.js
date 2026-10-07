const fs = require('fs');
let code = fs.readFileSync('public/dashboard.html', 'utf8');

const target = "ev.profesor";
const replacement = "ev.profesor_nombre || ev.profesor";
if (code.includes(target)) {
    code = code.replace(/ev\.profesor/g, replacement);
}

// Add Date
code = code.replace("ev.curso} - ${ev.asignatura}", "ev.curso} - ${ev.asignatura} <span class='badge bg-info ms-2'>${ev.fecha}</span>");

fs.writeFileSync('public/dashboard.html', code, 'utf8');
console.log("Fix aplicado HTML dashboard");
