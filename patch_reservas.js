const fs = require('fs');
let code = fs.readFileSync('server/index.js', 'utf8');

const target = "const { fecha, bloques, recurso, motivo } = req.body;";
const replacement = `const { fecha, recurso, motivo } = req.body;
      let { bloques } = req.body;
      if (typeof bloques === 'string') bloques = bloques.split(',');
      if (!Array.isArray(bloques)) bloques = [bloques];`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('server/index.js', code, 'utf8');
    console.log("Fix aplicado");
} else {
    console.log("No encontrado");
}
