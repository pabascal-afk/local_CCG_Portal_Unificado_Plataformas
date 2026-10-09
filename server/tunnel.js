const localtunnel = require('localtunnel');
const axios = require('axios');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // Bypass school firewall

let isRetrying = false;

async function initTunnel(port) {
    try {
        console.log('[TUNEL] Iniciando conexión con Localtunnel...');
        const subdomainTarget = process.env.TUNNEL_SUBDOMAIN || 'plataformaccg';
        
        const tunnel = await localtunnel({ port: port, subdomain: subdomainTarget });
        const url = tunnel.url;
        process.env.PUBLIC_URL = url;
        console.log('[TUNEL] Conectado a Localtunnel en:', url);

        tunnel.on('close', () => {
            console.log('[TUNEL] Localtunnel cerrado inesperadamente.');
            if (!isRetrying) {
                isRetrying = true;
                console.log('[TUNEL] Reconectando en 5 segundos...');
                setTimeout(() => {
                    isRetrying = false;
                    initTunnel(port);
                }, 5000);
            }
        });
        
        tunnel.on('error', (err) => {
            console.error('[TUNEL] Error en el túnel:', err.message);
        });
        
        // Registrar la URL en el Tablón de Anuncios de Google Apps Script
        const gasDbUrl = process.env.GAS_TUNNEL_DB_URL;
        const gasSecret = process.env.GAS_SECRET;
        
        if (gasDbUrl && gasSecret) {
            try {
                const response = await axios.post(gasDbUrl, {
                    secret: gasSecret,
                    url: url
                }, {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 5000
                });
                console.log('[TUNEL] Tablón de Google actualizado exitosamente (' + response.data + ')');
            } catch(e) {
                console.error('[TUNEL] Error al actualizar Tablón de Google:', e.message);
            }
        }
        
        return url;
    } catch (err) {
        console.error('[TUNEL] Error crítico al iniciar Localtunnel:', err.message);
        if (!isRetrying) {
            isRetrying = true;
            setTimeout(() => { isRetrying = false; initTunnel(port); }, 5000);
        }
    }
}
module.exports = { initTunnel };
