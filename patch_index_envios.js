const fs = require('fs');
let code = fs.readFileSync('server/index.js', 'utf8');

if (!code.includes("const enviosRouter = require('./api/envios');")) {
    const importStr = "const enviosRouter = require('./api/envios');\napp.use('/api/envios', enviosRouter);\n\nconst evaluacionesRouter = require('./api/evaluaciones');";
    code = code.replace("const evaluacionesRouter = require('./api/evaluaciones');", importStr);
    fs.writeFileSync('server/index.js', code, 'utf8');
    console.log("index.js inyectado");
}
