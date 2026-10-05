const fs = require('fs');
const code = fs.readFileSync('server/index.js', 'utf8');
const start = code.indexOf("app.get('/api/auth/me'");
const end = code.indexOf("// ==========================================", start);
console.log(code.substring(start, end));
