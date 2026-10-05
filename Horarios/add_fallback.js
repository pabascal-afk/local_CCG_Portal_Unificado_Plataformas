const fs = require('fs');
let code = fs.readFileSync('c:/Users/TI/Documents/Horarios/Asignador_Index.html.txt', 'utf8');

const oldFetch = `    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + apiKey, {`;

const newFetch = `    for (let i = 0; i < maxRetries; i++) {
      let modelUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + apiKey;
      if (i >= 3) { // Si falló 3 veces, usamos el modelo de respaldo
        modelUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + apiKey;
      }
      try {
        const response = await fetch(modelUrl, {`;

code = code.replace(oldFetch, newFetch);
fs.writeFileSync('c:/Users/TI/Documents/Horarios/Asignador_Index.html.txt', code);
console.log('Fallback model added.');
