const fs = require('fs');
let code = fs.readFileSync('c:/Users/TI/Documents/Horarios/Asignador_Index.html.txt', 'utf8');

const oldErrorBlock = `        if (data.error) {
          if (data.error.code === 503 || data.error.code === 429 || String(data.error.message).includes("high demand") || String(data.error.message).includes("overloaded")) {
            txt.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Alta demanda. Probando ' + (modelosCascada[i+1] || 'siguiente') + '...';
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
        }`;

const newErrorBlock = `        if (data.error) {
          if (data.error.code === 400 && data.error.message.includes("API key not valid")) {
            localStorage.removeItem('gemini_api_key');
            showAlert('API Key inválida. Por favor, ingrésala de nuevo.', 'danger');
            btn.disabled = false;
            txt.innerText = 'Asistente IA';
            return;
          }
          
          // Si es cualquier otro error (404 Not Found, 429 Quota, 503 Overloaded, 400 Bad Request por modelo no soportado), pasa al siguiente
          txt.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Probando ' + (modelosCascada[i+1] || 'siguiente') + '...';
          await new Promise(r => setTimeout(r, 2000)); // Espera corta
          continue;
        }`;

code = code.replace(oldErrorBlock, newErrorBlock);

fs.writeFileSync('c:/Users/TI/Documents/Horarios/Asignador_Index.html.txt', code);
console.log('Error block fixed');
