const fs = require('fs');
let code = fs.readFileSync('server/api/rpc.js', 'utf8');

const regex = /color: e\.tipo\.includes\('BLOQUEO'\) \? '#dc3545' : '#3788d8'/;

const replacement = `color: (() => {
                    if (e.tipo && e.tipo.includes('BLOQUEO')) return '#dc3545';
                    if (!e.asignatura) return '#3788d8';
                    let hash = 0;
                    const nombre = e.asignatura.toUpperCase();
                    for (let i = 0; i < nombre.length; i++) {
                        hash = nombre.charCodeAt(i) + ((hash << 5) - hash);
                    }
                    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
                    return '#' + '00000'.substring(0, 6 - c.length) + c;
                })()`;

code = code.replace(regex, replacement);
fs.writeFileSync('server/api/rpc.js', code, 'utf8');
console.log('Fixed Asignatura colors');
