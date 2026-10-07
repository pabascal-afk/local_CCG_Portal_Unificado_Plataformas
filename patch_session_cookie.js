const fs = require('fs');
let code = fs.readFileSync('server/index.js', 'utf8');

const target = `  app.use(session({
    secret: process.env.SESSION_SECRET || 'colegio_secreto_super_seguro_123',
    resave: false,
    saveUninitialized: false
  }));`;

const replacement = `  app.use(session({
    secret: process.env.SESSION_SECRET || 'colegio_secreto_super_seguro_123',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000 // 24 horas de memoria
    }
  }));`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('server/index.js', code, 'utf8');
    console.log("Fix aplicado");
} else {
    console.log("No encontrado");
}
