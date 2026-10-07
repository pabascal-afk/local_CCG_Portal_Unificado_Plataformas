const fs = require('fs');
let code = fs.readFileSync('server/tray.js', 'utf8');

const b64 = fs.readFileSync('icon.txt', 'utf8');
const target = 'const icon = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAcSURBVDhPY3h/Q/1/1DCMYcPAoIEYzWCAI0D/BwB1hR9Rj2889QAAAABJRU5ErkJggg==";';
const replacement = `const icon = "${b64}";`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('server/tray.js', code, 'utf8');
    console.log('Fix aplicado a tray');
} else {
    console.log('No encontrado en tray');
}
