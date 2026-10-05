const fs = require('fs');
let code = fs.readFileSync('c:/Users/TI/Documents/Horarios/Asignador_Index.html.txt', 'utf8');

const oldArray = `    const modelosCascada = [
      'gemini-3.5-flash',
      'gemini-3.1-pro-preview',
      'gemini-3-flash-preview',
      'gemini-2.5-pro',
      'gemini-2.5-flash',
      'gemini-2.0-flash'
    ];`;

const newArray = `    const modelosCascada = [
      'gemini-3.1-flash-lite', // Límite de 500 RPD
      'gemini-3.5-flash', // Límite de 20 RPD
      'gemini-3-flash-preview', // Límite de 20 RPD
      'gemini-2.5-flash-lite', // Límite de 20 RPD
      'gemini-2.5-flash' // Límite de 20 RPD
    ];`;

code = code.replace(oldArray, newArray);

const oldDelay = `await new Promise(r => setTimeout(r, 2000)); // Espera corta`;
const newDelay = `await new Promise(r => setTimeout(r, 6000)); // Espera de 6 segundos para no ahogar el API (límite RPM)`;

code = code.replace(oldDelay, newDelay);

fs.writeFileSync('c:/Users/TI/Documents/Horarios/Asignador_Index.html.txt', code);
console.log('Cascade updated to respect RPM and quotas');
