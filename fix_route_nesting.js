const fs = require('fs');
let code = fs.readFileSync('server/index.js', 'utf8');

const regex = /app\.get\('\/api\/auth\/logout', \(req, res\) => \{[\s\S]*?req\.logout\(\(\) => \{[\s\S]*?res\.redirect\('\/login\.html'\);[\s\S]*?\}\);[\s\S]*?app\.post\('\/api\/auth\/local'/;

const replacement = `app.get('/api/auth/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/login.html');
  });
});

app.post('/api/auth/local'`;

code = code.replace(regex, replacement);

const trailingBraceRegex = /\}\);\s*\n\s*\n\s*\/\/ ==========================================/;
const trailingBraceReplacement = `\n\n// ==========================================`;
code = code.replace(trailingBraceRegex, trailingBraceReplacement);

fs.writeFileSync('server/index.js', code, 'utf8');
console.log('Fixed route nesting');
