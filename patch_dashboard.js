const fs = require('fs');
let code = fs.readFileSync('server/index.js', 'utf8');

const targetRegex = /db\.all\("SELECT \* FROM horarios WHERE eval1 IS NOT NULL[\s\S]*?res\.json\(data\);\n\s+\}\);\n\s+\}\);/g;
const match = code.match(targetRegex);

if (match) {
    const replacement = `db.all("SELECT * FROM evaluaciones WHERE profesor_email = ? AND fecha >= date('now') ORDER BY fecha ASC LIMIT 10", [userEmail], (err, evals) => {
                  if (!err) {
                      data.evaluaciones = evals;
                  }
  
                  res.json(data);
              });
          });`;
    code = code.replace(match[0], replacement);
    fs.writeFileSync('server/index.js', code, 'utf8');
    console.log("Fix aplicado");
} else {
    console.log("No encontrado");
}
