const fs = require('fs');
let code = fs.readFileSync('server/index.js', 'utf8');

// The duplicate lines:
//     res.json({ message: 'Recurso creado', id: this.lastID });
//   });
// });

code = code.replace(/    res\.json\(\{ message: 'Recurso creado', id: this\.lastID \}\);\n  \}\);\n\}\);/, "");
fs.writeFileSync('server/index.js', code, 'utf8');
