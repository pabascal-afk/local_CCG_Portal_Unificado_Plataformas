const fs = require('fs');
let code = fs.readFileSync('server/index.js', 'utf8');

const target = "app.use(express.static(path.join(__dirname, '../public')));";
const replacement = `app.get(['/', '/index.html'], (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.redirect('/login.html');
  }
  next();
});

// Archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../public')));`;

if (code.includes(target) && !code.includes("return res.redirect('/login.html');")) {
    code = code.replace(target, replacement);
    fs.writeFileSync('server/index.js', code, 'utf8');
    console.log("Patch aplicado");
} else {
    console.log("Patch no necesario o no encontrado");
}
