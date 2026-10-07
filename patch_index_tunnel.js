const fs = require('fs');
let code = fs.readFileSync('server/index.js', 'utf8');

if (!code.includes('require(\"./tunnel\")') && !code.includes(\"require('./tunnel')\")) {
    code = code.replace(\"const { initTray } = require('./tray');\", \"const { initTray } = require('./tray');\\nconst { initTunnel } = require('./tunnel');\");
}

const listenRegex = /app\\.listen\\(PORT,\\s*\\(\\)\\s*=>\\s*\\{/;
const asyncListen = \"app.listen(PORT, async () => {\";
code = code.replace(listenRegex, asyncListen);

if (!code.includes('initTunnel(PORT)')) {
    const logMatch = \"console.log(\\`Servidor Node.js corriendo en http://localhost:\\\\`);\";
    code = code.replace(logMatch, logMatch + \"\\n  try { await initTunnel(PORT); } catch(e) { console.error('Tunnel failed', e); }\");
}

fs.writeFileSync('server/index.js', code, 'utf8');
