const fs = require('fs');
let code = fs.readFileSync('server/api/rpc.js', 'utf8');

// Find the boundaries of the `obtenerDatosCompletos` block
const startBlock = "if (functionName === 'obtenerDatosCompletos') {";
const endBlock = "if (functionName === 'procesarEvento') {";

const idx1 = code.indexOf(startBlock);
const idx2 = code.indexOf(endBlock);

if (idx1 !== -1 && idx2 !== -1) {
    const newBlock = `if (functionName === 'obtenerDatosCompletos') {
             const data = await queryAll("SELECT * FROM eventos");
             
             const coloresUnicos = {};
             const paleta = ['#e74c3c', '#2ecc71', '#3498db', '#f1c40f', '#9b59b6', '#34495e', '#e67e22', '#1abc9c', '#95a5a6'];
             let cIdx = 0;
             data.forEach(e => {
                 if (!coloresUnicos[e.categoria]) {
                     coloresUnicos[e.categoria] = paleta[cIdx % paleta.length];
                     cIdx++;
                 }
             });

             const eventos = data.map(e => ({
                 id: e.id,
                 dia: new Date(e.fecha).getDate(),
                 mes: new Date(e.fecha).getMonth(),
                 anio: new Date(e.fecha).getFullYear(),
                 texto: e.titulo,
                 tipo: e.categoria,
                 bloquea: e.bloques === 'TODOS' ? 'si' : '',
                 bloques: e.bloques,
                 cursos: e.cursos || 'TODOS',
                 color: coloresUnicos[e.categoria] || '#e74c3c'
             }));

             const isAdmin = user.rol.toLowerCase().includes('admin') || user.rol.toLowerCase().includes('directivo') || user.rol.toLowerCase().includes('convivencia');
             
             return res.json({ result: { eventos, esAdmin: isAdmin, colores: coloresUnicos, usuario: user.email } });
        }

        `;
    code = code.substring(0, idx1) + newBlock + code.substring(idx2);
    fs.writeFileSync('server/api/rpc.js', code, 'utf8');
    console.log("obtenerDatosCompletos block replaced successfully.");
} else {
    console.log("Could not find the block boundaries.");
}
