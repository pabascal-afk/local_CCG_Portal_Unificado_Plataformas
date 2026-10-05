const fs = require('fs');
let code = fs.readFileSync('c:/Users/TI/Documents/Horarios/Asignador_Index.html.txt', 'utf8');

const oldFetchStart = `      try {
        const response = await fetch(modelUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({`;

const newFetchStart = `      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 18000); // 18 segundos de timeout
      try {
        const response = await fetch(modelUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({`;

code = code.replace(oldFetchStart, newFetchStart);

const oldFetchEnd = `        data = await response.json();`;
const newFetchEnd = `        clearTimeout(timeoutId);
        data = await response.json();`;

code = code.replace(oldFetchEnd, newFetchEnd);

fs.writeFileSync('c:/Users/TI/Documents/Horarios/Asignador_Index.html.txt', code);
console.log('Timeout added.');
