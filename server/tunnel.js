const localtunnel = require('localtunnel');
const axios = require('axios');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // Bypass school firewall

async function initTunnel(port) {
    try {
        console.log('[TUNEL] Iniciando conexión con Localtunnel...');
        const tunnel = await localtunnel({ port: port });
        const url = tunnel.url;
        process.env.PUBLIC_URL = url;
        console.log('[TUNEL] Conectado a Localtunnel en:', url);

        tunnel.on('close', () => {
            console.log('[TUNEL] Localtunnel cerrado.');
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
                    headers: { 'Content-Type': 'application/json' }
                });
                console.log('[TUNEL] Tablón de Google actualizado exitosamente (' + response.data + ')');
            } catch(e) {
                console.error('[TUNEL] Error al actualizar Tablón de Google:', e.message);
            }
        } else {
            console.warn('[TUNEL] Falta GAS_TUNNEL_DB_URL o GAS_SECRET en el .env');
        }
        
        return url;
    } catch (err) {
        console.error('[TUNEL] Error al iniciar Localtunnel:', err.message);
    }
}
module.exports = { initTunnel };
