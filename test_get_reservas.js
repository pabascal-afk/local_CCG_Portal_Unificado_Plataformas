fetch('http://localhost:9000/api/reservas')
.then(r => r.json())
.then(data => console.log(data));
