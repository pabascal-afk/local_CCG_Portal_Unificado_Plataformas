const fs = require('fs');
let html = fs.readFileSync('public/recursos.html', 'utf8');

html = html.replace('slotDuration: "00:45:00",', 'slotDuration: "00:15:00",');
html = html.replace('slotLabelInterval: "00:45:00",', 'slotLabelInterval: "01:00:00",');
html = html.replace('slotMinTime: "08:00:00",', 'slotMinTime: "07:30:00",');

fs.writeFileSync('public/recursos.html', html, 'utf8');
