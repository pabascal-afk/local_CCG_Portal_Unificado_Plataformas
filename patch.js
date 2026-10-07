const fs = require('fs');
let code = fs.readFileSync('server/index.js', 'utf8');

if (!code.includes("require('./tunnel')")) {
    code = code.replace("const { initTray } = require('./tray');", "const { initTray } = require('./tray');\nconst { initTunnel } = require('./tunnel');");
}

code = code.replace("app.listen(PORT, () => {", "app.listen(PORT, async () => {");
const logStmt = "console.log(`Servidor Node.js corriendo en http://localhost:${PORT}`);";
if (!code.includes("initTunnel(PORT)")) {
    code = code.replace(logStmt, logStmt + "\n  try { await initTunnel(PORT); } catch(e) { console.error('Tunnel failed', e); }");
}

fs.writeFileSync('server/index.js', code, 'utf8');
