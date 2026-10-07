const fs = require('fs');
let code = fs.readFileSync('Instalador_Servidor.bat', 'utf8');

// Inject taskkill before git pull
if (!code.includes('taskkill /F /IM node.exe')) {
    code = code.replace("echo [INFO] Obteniendo actualizaciones de GitHub...", "echo [INFO] Deteniendo servidor actual (si estaba encendido)...\n    taskkill /F /IM node.exe >nul 2>&1\n    echo [INFO] Obteniendo actualizaciones de GitHub...");
}

// Inject VBS start at the end
if (!code.includes('start "" "Iniciar_Plataforma.vbs"')) {
    code = code.replace("echo [AVISO] Se ha creado un archivo \".env\". Por favor abrelo y pega las credenciales de Google.\r\n)", "echo [AVISO] Se ha creado un archivo \".env\". Por favor abrelo y pega las credenciales de Google.\r\n)\r\n\r\necho [INFO] Iniciando el servidor en segundo plano...\r\nstart \"\" \"Iniciar_Plataforma.vbs\"");
    code = code.replace("echo [AVISO] Se ha creado un archivo \".env\". Por favor abrelo y pega las credenciales de Google.\n)", "echo [AVISO] Se ha creado un archivo \".env\". Por favor abrelo y pega las credenciales de Google.\n)\n\necho [INFO] Iniciando el servidor en segundo plano...\nstart \"\" \"Iniciar_Plataforma.vbs\"");
    
    // Remove the pause if we are automatically starting it (wait, I should keep the pause so they can read? No, a timeout is better)
    code = code.replace("pause", "timeout /t 5 >nul\nexit /b");
}

fs.writeFileSync('Instalador_Servidor.bat', code, 'utf8');
console.log("BAT actualizado");
