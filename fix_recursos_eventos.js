const fs = require('fs');
let html = fs.readFileSync('public/recursos.html', 'utf8');

// 1. Add global variable
html = html.replace(/let todasReservas = \[\];/, 'let todasReservas = [];\n      let eventosInstitucionales = [];');

// 2. Add fetch logic to cargarReservas (so it fetches both together)
const regexFetch = /function cargarReservas\(\) \{[\s\S]*?fetch\('\/api\/reservas'\)[\s\S]*?\.then\(data => \{[\s\S]*?todasReservas = data;[\s\S]*?filtrarCalendario\(\);[\s\S]*?\}\);[\s\S]*?\}/;
const replaceFetch = `function cargarReservas() {
        Promise.all([
            fetch('/api/reservas').then(r => r.json()),
            fetch('/api/rpc/getEventosCalendario', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({args:[]}) }).then(r => r.json())
        ]).then(([reservas, eventosResp]) => {
            todasReservas = reservas;
            if (eventosResp && eventosResp.result) {
                eventosInstitucionales = eventosResp.result.filter(e => e.extendedProps.esInstitucional);
            }
            filtrarCalendario();
        });
      }`;
html = html.replace(regexFetch, replaceFetch);

// 3. Inject logic in generarEventosDinamicos
const regexLoop = /if \(bloqueadoDiaCompleto\) \{/;
const replaceLoop = `
                // BLOQUEOS INSTITUCIONALES (EVENTOS)
                eventosInstitucionales.forEach(evInst => {
                    if (evInst.start === currFechaStr) {
                        const evtBloques = evInst.extendedProps.bloques;
                        if (evtBloques === 'TODOS' || !evtBloques) {
                            bloqueadoDiaCompleto = evInst.title;
                            permitidos = [];
                        } else {
                            const bks = evtBloques.split(',').map(Number);
                            permitidos = permitidos.filter(b => !bks.includes(b));
                            
                            // Visual indication of partial blocks
                            bks.forEach(bk => {
                                const hBk = getHoras(bk);
                                eventos.push({
                                    start: \`\${currFechaStr}T\${hBk.start}\`,
                                    end: \`\${currFechaStr}T\${hBk.end}\`,
                                    display: 'background',
                                    color: '#ffc107',
                                    title: evInst.title
                                });
                            });
                        }
                    }
                });

                if (bloqueadoDiaCompleto) {`;
html = html.replace(regexLoop, replaceLoop);

fs.writeFileSync('public/recursos.html', html, 'utf8');
console.log('recursos.html updated with eventos institucionales blocking');
