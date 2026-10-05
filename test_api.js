fetch('http://localhost:9000/api/rpc/procesarEvento', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ args: [{ fecha: '2026-10-02', texto: 'Test', tipo: 'General', bloquea: false, externos: [] }] })
}).then(r => r.text()).then(console.log);
