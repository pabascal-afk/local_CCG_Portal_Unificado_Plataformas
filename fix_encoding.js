const fs = require('fs');
let code = fs.readFileSync('server/api/rpc.js', 'utf8');
code = code.replace(/Matem.ticas/g, "Matematicas");
fs.writeFileSync('server/api/rpc.js', code, 'utf8');
