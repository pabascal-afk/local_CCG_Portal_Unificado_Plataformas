const fs = require('fs');
let code = fs.readFileSync('server/index.js', 'utf8');

if (!code.includes("const configRouter = require('./api/config');")) {
    const importStr = "const configRouter = require('./api/config');\napp.use('/api/config', configRouter);\n\nconst enviosRouter = require('./api/envios');";
    code = code.replace("const enviosRouter = require('./api/envios');", importStr);
    fs.writeFileSync('server/index.js', code, 'utf8');
    console.log("index.js inyectado config");
}
