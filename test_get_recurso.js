fetch('http://localhost:9000/api/recursos/config')
.then(r => r.json())
.then(data => console.log(data));
