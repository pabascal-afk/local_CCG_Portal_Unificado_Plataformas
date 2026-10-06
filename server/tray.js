const SysTray = require('systray2').default;
const { exec } = require('child_process');
const os = require('os');

function getLocalIp() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return '127.0.0.1';
}

function initTray(port) {
    const localIp = getLocalIp();
    
    // A simple blue square base64 icon 
    const icon = "AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAADIMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/yDIy/8gyMv/IMjL/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==";

    const systray = new SysTray({
        menu: {
            icon: icon,
            title: "Plataforma Unificada",
            tooltip: "Servidor Plataforma Escolar",
            items: [
                {
                    title: "🌐 Abrir en este PC",
                    tooltip: `Abre http://localhost:${port}`,
                    checked: false,
                    enabled: true
                },
                {
                    title: `📱 Abrir desde otros equipos (IP: ${localIp})`,
                    tooltip: `Abre http://${localIp}:${port}`,
                    checked: false,
                    enabled: true
                },
                {
                    title: "<SEPARATOR>",
                    tooltip: "",
                    checked: false,
                    enabled: true
                },
                {
                    title: "❌ Detener Servidor",
                    tooltip: "Apaga el servidor y cierra esta aplicación",
                    checked: false,
                    enabled: true
                }
            ]
        },
        debug: false,
        copyDir: true
    });

    systray.onClick(action => {
        if (action.item.title === '❌ Detener Servidor') {
            systray.kill();
            process.exit(0);
        } else if (action.item.title === '🌐 Abrir en este PC') {
            exec(`start http://localhost:${port}`);
        } else if (action.item.title.startsWith('📱 Abrir desde otros')) {
            exec(`start http://${localIp}:${port}`);
        }
    });

    systray.ready().then(() => {
        console.log('Tray icon ready');
    }).catch(err => {
        console.error('Tray icon error:', err);
    });
}

module.exports = { initTray };
