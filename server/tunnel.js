const { startTunnel } = require('untun');
const axios = require('axios');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // Bypass school firewall para Cloudflare fetch

async function initTunnel(port) {
    try {
        console.log('[TÚNEL] Iniciando conexión con Cloudflare...');
        const t = await startTunnel({ port: port });
        const url = await t.getURL();
        console.log('[TÚNEL] Conectado a Cloudflare en:', url);
        
        // Registrar la URL en el Tablón de Anuncios de Google Apps Script
        const gasDbUrl = process.env.GAS_TUNNEL_DB_URL;
        const gasSecret = process.env.GAS_SECRET;
        
        if (gasDbUrl && gasSecret) {
            try {
                const response = await axios.post(gasDbUrl, {
                    secret: gasSecret,
                    url: url
                }, {
                    headers: { 'Content-Type': 'application/json' }
                });
                console.log('[TÚNEL] Tablón de Google actualizado exitosamente (' + response.data + ')');
            } catch(e) {
                console.error('[TÚNEL] Error al actualizar Tablón de Google:', e.message);
            }
        } else {
            console.warn('[TÚNEL] Falta GAS_TUNNEL_DB_URL o GAS_SECRET en el .env');
        }
        
        return url;
    } catch (err) {
        console.error('[TÚNEL] Error al iniciar Cloudflare:', err.message);
    }
}
module.exports = { initTunnel };
