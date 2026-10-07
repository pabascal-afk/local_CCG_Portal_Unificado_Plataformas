const fs = require('fs');
let code = fs.readFileSync('server/api/rpc.js', 'utf8');

const target = "if (functionName === 'eliminarEvaluacion') {";
const replacement = "if (functionName === 'eliminarEvaluacion' || functionName === 'eliminarEvaluacionBackend') {";

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('server/api/rpc.js', code, 'utf8');
    console.log("Fix aplicado RPC");
} else {
    console.log("No encontrado en RPC");
}
