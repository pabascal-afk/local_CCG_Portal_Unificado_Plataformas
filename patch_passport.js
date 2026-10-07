const fs = require('fs');
let code = fs.readFileSync('server/index.js', 'utf8');

// The block to move
const passportBlock = `  // Configurar Passport (Google OAuth)
  app.use(passport.initialize());
  app.use(passport.session());`;

// Remove it from its current location
code = code.replace(passportBlock, "");

// Insert it right after the session middleware block ends
const sessionBlockEnd = `  // Sesiones
  app.use(session({
    secret: process.env.SESSION_SECRET || 'colegio_secreto_super_seguro_123',
    resave: false,
    saveUninitialized: false
  }));`;

code = code.replace(sessionBlockEnd, sessionBlockEnd + "\n\n" + passportBlock);

fs.writeFileSync('server/index.js', code, 'utf8');
