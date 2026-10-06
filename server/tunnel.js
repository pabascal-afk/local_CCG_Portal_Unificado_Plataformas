const { startTunnel } = require('untun');
const axios = require('axios');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // Bypass school firewall for Node.js TLS

async function initTunnel(port) {
    try {
        console.log('[TÚNEL] Iniciando conexión con Cloudflare...');
        const t = await startTunnel({ port: port });
        const url = await t.getURL();
        console.log('[TÚNEL] Conectado a Cloudflare en:', url);
        
        // Registrar la URL en Google Apps Script
        const gasUrl = process.env.GAS_WEB_APP_URL;
        const gasSecret = process.env.GAS_SECRET;
        
        if (gasUrl && gasSecret) {
            try {
                const response = await axios.post(gasUrl, {
                    secret: gasSecret,
                    url: url
                }, {
                    headers: { 'Content-Type': 'application/json' }
                });
                console.log('[TÚNEL] Tablón de Google actualizado:', response.data);
            } catch(e) {
                console.error('[TÚNEL] Error al actualizar Google:', e.message);
            }
        } else {
            console.warn('[TÚNEL] Falta GAS_WEB_APP_URL o GAS_SECRET en el .env');
        }
        
        return url;
    } catch (err) {
        console.error('[TÚNEL] Error al iniciar Cloudflare:', err.message);
    }
}
module.exports = { initTunnel };
