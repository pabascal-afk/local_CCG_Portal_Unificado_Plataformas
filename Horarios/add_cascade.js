const fs = require('fs');
let code = fs.readFileSync('c:/Users/TI/Documents/Horarios/Asignador_Index.html.txt', 'utf8');

const oldLoopStart = `    let maxRetries = 8;
    let data = null;
    let success = false;
    let parsed = null;
    
    for (let i = 0; i < maxRetries; i++) {
      let modelUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + apiKey;
      if (i >= 5) { // Si falló 5 veces, usamos el modelo de respaldo
        modelUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + apiKey;
      }
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000); // 25 segundos de timeout
      try {`;

const newLoopStart = `    const modelosCascada = [
      'gemini-3.5-flash',
      'gemini-3.1-pro',
      'gemini-3-flash',
      'gemini-2.5-pro',
      'gemini-2.5-flash',
      'gemini-2.0-flash'
    ];
    let maxRetries = modelosCascada.length;
    let data = null;
    let success = false;
    let parsed = null;
    
    for (let i = 0; i < maxRetries; i++) {
      let nombreModelo = modelosCascada[i];
      let modelUrl = 'https://generativelanguage.googleapis.com/v1beta/models/' + nombreModelo + ':generateContent?key=' + apiKey;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000); // 25 segundos de timeout
      try {`;

code = code.replace(oldLoopStart, newLoopStart);

const oldError1 = `txt.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Alta demanda. Reintentando (' + (i+1) + '/' + maxRetries + ')...';`;
const newError1 = `txt.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Alta demanda. Probando ' + (modelosCascada[i+1] || 'siguiente') + '...';`;
code = code.replace(oldError1, newError1);

const oldError2 = `txt.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Fallo de red. Reintentando (' + (i+1) + '/' + maxRetries + ')...';`;
const newError2 = `txt.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Fallo. Cambiando a ' + (modelosCascada[i+1] || 'siguiente') + '...';`;
code = code.replace(oldError2, newError2);

fs.writeFileSync('c:/Users/TI/Documents/Horarios/Asignador_Index.html.txt', code);
console.log('Cascade logic applied');
