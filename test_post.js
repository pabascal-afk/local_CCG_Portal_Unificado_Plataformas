const id = '70d92781-aad4-4005-9a04-0f42e81b87f6';
fetch('http://localhost:9000/api/envios/enviar/' + id, {
    method: 'POST',
    body: new URLSearchParams({ link_doc: 'http://test' })
}).then(r => r.json().then(j => console.log(r.status, j))).catch(console.error);
