const fs = require('fs');
let code = fs.readFileSync('server/api/rpc.js', 'utf8');

// I will just use regex to replace editarEvaluacion and eliminarEvaluacion
// Or actually, I'll rewrite the entire file since it's cleaner.
