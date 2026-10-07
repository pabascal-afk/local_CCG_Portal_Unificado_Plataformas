const fs = require('fs');
let code = fs.readFileSync('Instalador_Servidor.bat', 'utf8');

code = code.replace(/echo Para arrancar el servidor de forma silenciosa[\s\S]*?pause/, "echo Arrancando el servidor automaticamente...\nstart \"\" \"Iniciar_Plataforma.vbs\"\ntimeout /t 5 >nul\nexit /b");

fs.writeFileSync('Instalador_Servidor.bat', code, 'utf8');
console.log("BAT arreglado");
