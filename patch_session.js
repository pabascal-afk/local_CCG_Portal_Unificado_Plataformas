const fs = require('fs');
let code = fs.readFileSync('server/index.js', 'utf8');

// Remove existing session block
const sessionRegex = /\/\/ Sesiones\s+app\.use\(session\(\{[\s\S]*?saveUninitialized: false\s+\}\)\);/g;
const sessionMatch = code.match(sessionRegex);
if (sessionMatch) {
    code = code.replace(sessionMatch[0], '');
    
    // Inject session before the app.get auth check
    const authCheckTarget = "app.get(['/', '/index.html']";
    code = code.replace(authCheckTarget, sessionMatch[0] + "\n\n  " + authCheckTarget);
    
    fs.writeFileSync('server/index.js', code, 'utf8');
    console.log("Sesiones movidas arriba");
} else {
    console.log("No se encontró el bloque de sesión");
}
