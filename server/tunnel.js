const axios = require('axios');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // Bypass school firewall inspection

let activeTunnel = null;
let isStarting = false;

async function initTunnel(port) {
    if (isStarting) return;
    isStarting = true;

    try {
        console.log('[TUNEL] Iniciando conexión con Cloudflare Quick Tunnel...');
        
        if (activeTunnel) {
            try { await activeTunnel.close(); } catch(e) {}
            activeTunnel = null;
        }

        const { startTunnel } = await import('untun');
        const tunnel = await startTunnel({
            url: `http://127.0.0.1:${port}`,
            acceptCloudflareNotice: true
        });
        activeTunnel = tunnel;

        const url = await tunnel.getURL();
        process.env.PUBLIC_URL = url;
        console.log('[TUNEL] Conectado exitosamente a Cloudflare en:', url);

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
                    timeout: 7000
                });
                console.log('[TUNEL] Tablón de Google actualizado exitosamente (' + response.data + ')');
            } catch(e) {
                console.error('[TUNEL] Error al actualizar Tablón de Google:', e.message);
            }
        }

        isStarting = false;
        return url;
    } catch (err) {
        console.error('[TUNEL] Error crítico al iniciar Cloudflare Tunnel:', err.message);
        isStarting = false;
        setTimeout(() => {
            initTunnel(port);
        }, 10000);
    }
}

// Monitor de salud para auto-reconectar si el túnel se interrumpe
setInterval(async () => {
    if (!process.env.PUBLIC_URL || !process.env.PUBLIC_URL.startsWith('http') || isStarting) return;
    try {
        await axios.get(process.env.PUBLIC_URL + '/api/ping', { timeout: 8000 });
    } catch (e) {
        console.warn('[TUNEL] Alerta: El túnel público no respondió al ping (' + e.message + '). Reconectando...');
        initTunnel(process.env.PORT || 9000);
    }
}, 120000);

module.exports = { initTunnel };
