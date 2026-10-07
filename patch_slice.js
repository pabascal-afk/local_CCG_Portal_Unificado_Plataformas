const fs = require('fs');
let code = fs.readFileSync('public/dashboard.html', 'utf8');

code = code.replace("data.evaluaciones.slice(0, 5).forEach", "data.evaluaciones.slice(0, 10).forEach");
code = code.replace("data.reservas.slice(0, 5).forEach", "data.reservas.slice(0, 10).forEach");

fs.writeFileSync('public/dashboard.html', code, 'utf8');
console.log("Fix aplicado HTML slice");
