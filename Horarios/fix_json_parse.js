const fs = require('fs');
let code = fs.readFileSync('c:/Users/TI/Documents/Horarios/Asignador_Index.html.txt', 'utf8');

const oldStructure = `        success = true;
        break; // Éxito
        
      } catch (e) {`;

const newStructure = `        
        let textRes = data.candidates[0].content.parts[0].text;
        textRes = textRes.replace(/\`\`\`json\\n?|\`\`\`\\n?/g, '').trim();
        parsed = JSON.parse(textRes); // Se intenta parsear aquí adentro para que atrape errores de formato
        
        success = true;
        break; // Éxito
        
      } catch (e) {`;

code = code.replace(oldStructure, newStructure);

const oldEnd = `    if (success && data && data.candidates) {
      let textRes = data.candidates[0].content.parts[0].text;
      const parsed = JSON.parse(textRes);
      
      geminiSugerenciasPendientes = parsed.movimientos || [];`;

const newEnd = `    if (success && parsed) {
      geminiSugerenciasPendientes = parsed.movimientos || [];`;

code = code.replace(oldEnd, newEnd);

code = code.replace('let success = false;', 'let success = false;\n    let parsed = null;');

fs.writeFileSync('c:/Users/TI/Documents/Horarios/Asignador_Index.html.txt', code);
console.log('JSON parsing fixed.');
