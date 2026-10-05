const fs = require('fs');
let code = fs.readFileSync('server/index.js', 'utf8');

const injection = `
// Importar RPC router para polyfill de Google Apps Script
const rpcRouter = require('./api/rpc');
app.use('/api/rpc', rpcRouter);
`;

if (!code.includes('/api/rpc')) {
    code = code.replace('// Iniciar Servidor', injection + '\n// Iniciar Servidor');
    fs.writeFileSync('server/index.js', code, 'utf8');
}
