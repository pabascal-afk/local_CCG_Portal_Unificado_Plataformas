const fs = require('fs');
let code = fs.readFileSync('public/index.html', 'utf8');

const target = `        fetch('/api/perfil/preferencias', {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({preferencias: pref})
        })`;

const replacement = `        const pinInput = document.getElementById('inputPinLocal').value;
        const payload = { preferencias: pref };
        if (pinInput && pinInput.trim() !== '') {
            payload.pin = pinInput.trim();
        }
        
        fetch('/api/perfil/preferencias', {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        })`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('public/index.html', code, 'utf8');
    console.log("Fix aplicado HTML");
} else {
    console.log("No encontrado en HTML");
}
