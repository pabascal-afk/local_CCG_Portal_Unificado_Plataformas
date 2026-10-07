const fs = require('fs');
let code = fs.readFileSync('server/api/rpc.js', 'utf8');
code = code.replace(/\\['""]III[^\\s]+ MEDIO A\\['""].*/, ""['III° MEDIO A', 'III° MEDIO B', 'IV° MEDIO A', 'IV° MEDIO B'];"");
fs.writeFileSync('server/api/rpc.js', code, 'utf8');
