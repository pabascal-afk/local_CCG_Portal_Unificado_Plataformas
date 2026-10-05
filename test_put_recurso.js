fetch('http://localhost:9000/api/recursos/config/1', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ horarios_exactos: "08:00,09:00" })
}).then(r => r.json()).then(console.log);
