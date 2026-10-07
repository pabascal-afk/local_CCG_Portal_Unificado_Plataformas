const fs = require('fs');

function patchFile(file) {
    if (!fs.existsSync(file)) return;
    let code = fs.readFileSync(file, 'utf8');
    const target = `auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }`;
    const rep = `auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
    tls: {
        rejectUnauthorized: false
    }`;
    
    if (code.includes(target)) {
        code = code.replace(target, rep);
        fs.writeFileSync(file, code, 'utf8');
        console.log("Patched " + file);
    }
}

patchFile('server/index.js');
patchFile('server/api/rpc.js');
patchFile('server/api/envios.js');
