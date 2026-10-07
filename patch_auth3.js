const fs = require('fs');
let code = fs.readFileSync('server/index.js', 'utf8');

const regex = /app\.get\(\[\'\/\', \'\/index\.html\'\], \(req, res, next\) => \{[\s\S]*?next\(\);\n  \}\);/g;

const replacement = `app.get(['/', '/index.html'], (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.redirect('/login.html');
    }
    next();
  });`;

if (code.match(regex)) {
    code = code.replace(regex, replacement);
    fs.writeFileSync('server/index.js', code, 'utf8');
    console.log("Patch aplicado");
} else {
    console.log("No encontrado");
}
