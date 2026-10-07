const fs = require('fs');

let rpcCode = fs.readFileSync('server/api/rpc.js', 'utf8');
if (!rpcCode.includes('SELECT valor FROM config_global')) {
    const target = 'if (process.env.SMTP_USER && process.env.SMTP_PASS) {';
    const rep = `const confRows = await queryAll("SELECT valor FROM config_global WHERE clave = 'emails_activados'");
               const emailsActivados = confRows.length > 0 ? confRows[0].valor === 'true' : true;
               
               if (emailsActivados && process.env.SMTP_USER && process.env.SMTP_PASS) {`;
    rpcCode = rpcCode.replace(target, rep);
    fs.writeFileSync('server/api/rpc.js', rpcCode, 'utf8');
}

let enviosCode = fs.readFileSync('server/api/envios.js', 'utf8');
if (!enviosCode.includes('SELECT valor FROM config_global')) {
    const target = 'if (process.env.SMTP_USER && process.env.SMTP_PASS) {';
    const rep = `const confRows = await queryAll("SELECT valor FROM config_global WHERE clave = 'emails_activados'");
        const emailsActivados = confRows.length > 0 ? confRows[0].valor === 'true' : true;
        
        if (emailsActivados && process.env.SMTP_USER && process.env.SMTP_PASS) {`;
    enviosCode = enviosCode.replace(target, rep);
    fs.writeFileSync('server/api/envios.js', enviosCode, 'utf8');
}
console.log("Mails condicionados");
