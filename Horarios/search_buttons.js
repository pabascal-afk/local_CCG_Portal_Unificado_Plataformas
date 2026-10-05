const fs = require('fs');
const lines = fs.readFileSync('c:/Users/TI/Documents/Horarios/Asignador_Index.html.txt', 'utf8').split('\n');
lines.forEach((l, i) => {
  if (l.includes('id="btnAyudaGemini"')) {
    console.log((i-2) + ': ' + lines[i-2]);
    console.log((i-1) + ': ' + lines[i-1]);
    console.log((i) + ': ' + lines[i]);
    console.log((i+1) + ': ' + lines[i+1]);
    console.log((i+2) + ': ' + lines[i+2]);
  }
});
