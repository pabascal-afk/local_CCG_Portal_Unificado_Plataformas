const SysTray = require('systray2').default;

const systray = new SysTray({
    menu: {
        icon: "", // base64 icon, we can omit it or generate a simple one
        title: "Plataforma",
        tooltip: "Servidor Plataforma Unificada",
        items: [
            {
                title: "Abrir Plataforma",
                tooltip: "Abre http://localhost:9000",
                checked: false,
                enabled: true
            },
            {
                title: "Salir",
                tooltip: "Detiene el servidor",
                checked: false,
                enabled: true
            }
        ]
    },
    debug: false,
    copyDir: true // copy go binary to temp
});

systray.onClick(action => {
    if (action.item.title === 'Salir') {
        systray.kill();
        process.exit(0);
    } else if (action.item.title === 'Abrir Plataforma') {
        require('child_process').exec('start http://localhost:9000');
    }
});

systray.ready().then(() => {
    console.log('Tray started');
});
