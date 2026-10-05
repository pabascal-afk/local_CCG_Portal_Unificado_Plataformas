const fs = require('fs');
let code = fs.readFileSync('c:/Users/TI/Documents/Horarios/Asignador_Index.html.txt', 'utf8');

const oldFetch = `try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + apiKey, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json"
          }
        })
      });
      
      const data = await response.json();
      
      if (data.error) {
        if (data.error.code === 400 && data.error.message.includes("API key not valid")) {
          localStorage.removeItem('gemini_api_key');
          showAlert('API Key inválida. Por favor, ingrésala de nuevo.', 'danger');
        } else {
          showAlert('Error de Gemini: ' + data.error.message, 'danger');
        }
        btn.disabled = false;
        txt.innerText = 'Asistente IA';
        return;
      }
      
      let textRes = data.candidates[0].content.parts[0].text;
      const parsed = JSON.parse(textRes);
      
      geminiSugerenciasPendientes = parsed.movimientos || [];
      if(parsed.analisis) { showAlert('🤖 IA: ' + parsed.analisis, 'info'); }
      aplicarGeminiSugerencias();
      
    } catch (e) {
      showAlert('Falló la conexión con Gemini: ' + e.message, 'danger');
    }`;

const newFetch = `let maxRetries = 6;
    let data = null;
    let success = false;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + apiKey, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
            generationConfig: {
              temperature: 0.2,
              responseMimeType: "application/json"
            }
          })
        });
        
        data = await response.json();
        
        if (data.error) {
          if (data.error.code === 503 || data.error.code === 429 || String(data.error.message).includes("high demand") || String(data.error.message).includes("overloaded")) {
            txt.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Alta demanda. Reintentando (' + (i+1) + '/' + maxRetries + ')...';
            await new Promise(r => setTimeout(r, 4000 * (i + 1))); // Respaldo exponencial
            continue;
          }
          
          if (data.error.code === 400 && data.error.message.includes("API key not valid")) {
            localStorage.removeItem('gemini_api_key');
            showAlert('API Key inválida. Por favor, ingrésala de nuevo.', 'danger');
          } else {
            showAlert('Error de Gemini: ' + data.error.message, 'danger');
          }
          btn.disabled = false;
          txt.innerText = 'Asistente IA';
          return;
        }
        
        success = true;
        break; // Éxito
        
      } catch (e) {
        if (i === maxRetries - 1) {
          showAlert('Falló la conexión con Gemini: ' + e.message, 'danger');
          btn.disabled = false;
          txt.innerText = 'Asistente IA';
          return;
        }
        txt.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Fallo de red. Reintentando (' + (i+1) + '/' + maxRetries + ')...';
        await new Promise(r => setTimeout(r, 4000 * (i + 1)));
      }
    }
    
    if (success && data && data.candidates) {
      let textRes = data.candidates[0].content.parts[0].text;
      const parsed = JSON.parse(textRes);
      
      geminiSugerenciasPendientes = parsed.movimientos || [];
      if(parsed.analisis) { showAlert('🤖 IA: ' + parsed.analisis, 'info'); }
      aplicarGeminiSugerencias();
    }`;

code = code.replace(oldFetch, newFetch);
fs.writeFileSync('c:/Users/TI/Documents/Horarios/Asignador_Index.html.txt', code);
console.log('Retry mechanism implemented.');
