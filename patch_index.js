const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

const regex = /window\.location\.href = '\/auth\/google';/;
const replace = `window.location.href = '/login.html';`;
html = html.replace(regex, replace);

fs.writeFileSync('public/index.html', html, 'utf8');
