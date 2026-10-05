const fs = require('fs'); const html = fs.readFileSync('Frontend.html', 'utf8'); const match = html.match(/<script>([\s\S]*?)<\/script>/i); if (match) { fs.writeFileSync('temp.js', match[1]); }
