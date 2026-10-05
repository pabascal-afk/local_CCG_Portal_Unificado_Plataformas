const fs = require('fs');
let code = fs.readFileSync('server/index.js', 'utf8');

const injection = `
// Importar rutas de evaluaciones
const evaluacionesRouter = require('./api/evaluaciones');
app.use('/api/evaluaciones', evaluacionesRouter);
`;

code = code.replace('// Iniciar Servidor', injection + '\n// Iniciar Servidor');

fs.writeFileSync('server/index.js', code, 'utf8');
