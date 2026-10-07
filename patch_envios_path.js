const fs = require('fs');
let code = fs.readFileSync('server/api/envios.js', 'utf8');
code = code.replace("const path = require('path');\nconst dbPath", "const dbPath");
fs.writeFileSync('server/api/envios.js', code, 'utf8');
console.log('Fixed path require');
