const fs = require('fs');
let code = fs.readFileSync('server/index.js', 'utf8');

const target = `app.get(['/', '/index.html'], (req, res, next) => {
    if (!req.session || !req.session.user) {
      return res.redirect('/login.html');
    }
    next();
  });`;

const replacement = `app.get(['/', '/index.html'], (req, res, next) => {
    // Si Google Auth no esta configurado, dejar pasar (Modo Dev)
    if (!process.env.GOOGLE_CLIENT_ID && !req.isAuthenticated()) {
        req.login({ email: 'admin@colegio.edu', nombre: 'Admin (Dev)', rol: 'Administrador' }, () => next());
        return;
    }
    
    if (!req.isAuthenticated()) {
      return res.redirect('/login.html');
    }
    next();
  });`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('server/index.js', code, 'utf8');
    console.log("Patch aplicado");
} else {
    console.log("No encontrado");
}
