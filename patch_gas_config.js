const fs = require('fs');
let code = fs.readFileSync('server/index.js', 'utf8');

const injection = `
app.get('/api/auth/gas-url', (req, res) => {
    res.json({ url: process.env.GAS_WEB_APP_URL || '' });
});
`;

code = code.replace("app.get('/api/auth/gas'", injection + "\napp.get('/api/auth/gas'");
fs.writeFileSync('server/index.js', code, 'utf8');
