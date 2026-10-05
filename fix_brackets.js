const fs = require('fs');
let code = fs.readFileSync('server/index.js', 'utf8');

// Replace everything from the end of db.get to the start of app.delete
const regex = /res\.json\(\{ message: 'Reserva guardada', id \}\);\s*\}\);\s*\}\); \/\/ close evRows\s*\}\); \/\/ close rows\s*\}\);/
const replacement = `res.json({ message: 'Reserva guardada', id });
        }); // close db.run
      }); // close db.all evRows
    }); // close db.all rows
}); // close app.post`;

code = code.replace(regex, replacement);

fs.writeFileSync('server/index.js', code, 'utf8');
console.log('Fixed brackets');
