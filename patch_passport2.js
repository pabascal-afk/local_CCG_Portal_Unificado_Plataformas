const fs = require('fs');
let code = fs.readFileSync('server/index.js', 'utf8');

const pStart = code.indexOf('// Configurar Passport (Google OAuth)');
const pEnd = code.indexOf('app.use(passport.session());') + 28;
const pBlock = code.substring(pStart, pEnd);

code = code.replace(pBlock, '');

const sEnd = code.indexOf('saveUninitialized: false') + 32;
code = code.slice(0, sEnd) + '\n\n' + pBlock + '\n\n' + code.slice(sEnd);

fs.writeFileSync('server/index.js', code, 'utf8');
console.log('OK');
