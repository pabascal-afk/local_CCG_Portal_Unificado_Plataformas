const localtunnel = require('localtunnel');

async function initTunnel(port) {
    try {
        const tunnel = await localtunnel({ port: port, subdomain: 'ccg-plataforma-2026' });
        console.log('[TÚNEL] Conectado a internet en:', tunnel.url);
        
        tunnel.on('close', () => {
            console.log('[TÚNEL] El túnel se cerró.');
        });
        
        return tunnel.url;
    } catch (err) {
        console.error('[TÚNEL] Error al iniciar:', err);
    }
}
module.exports = { initTunnel };
