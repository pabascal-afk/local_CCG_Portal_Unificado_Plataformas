const fs = require('fs');
let code = fs.readFileSync('server/index.js', 'utf8');

const target = "saveUninitialized: false";
const replacement = "saveUninitialized: false,\n    cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 horas";

if (code.includes(target) && !code.includes("maxAge")) {
    code = code.replace(target, replacement);
    fs.writeFileSync('server/index.js', code, 'utf8');
    console.log("Fix aplicado");
} else {
    console.log("No encontrado o ya aplicado");
}
