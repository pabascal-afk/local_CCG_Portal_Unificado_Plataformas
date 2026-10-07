const fs = require('fs');
let code = fs.readFileSync('server/api/rpc.js', 'utf8');
code = code.replace(/III MEDIO A/g, 'III° MEDIO A');
code = code.replace(/III MEDIO B/g, 'III° MEDIO B');
code = code.replace(/IV MEDIO A/g, 'IV° MEDIO A');
code = code.replace(/IV MEDIO B/g, 'IV° MEDIO B');
fs.writeFileSync('server/api/rpc.js', code, 'utf8');
