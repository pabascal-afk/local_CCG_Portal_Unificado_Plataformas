const fs = require('fs');
const content = `@echo off
color 0B
echo ==========================================================
echo    Instalador / Actualizador - Plataforma Unificada
echo ==========================================================
echo.

:: Verificar Git
git --version >nul 2>&1
IF ERRORLEVEL 1 (
    color 0C
    echo [ERROR] Git no esta instalado. Descargalo de https://git-scm.com/
    pause
    exit /b
)

:: Verificar Node.js
node --version >nul 2>&1
IF ERRORLEVEL 1 (
    color 0C
    echo [ERROR] Node.js no esta instalado. Descargalo de https://nodejs.org/
    pause
    exit /b
)

:: Revisar si ya esta clonado
IF EXIST ".git" (
    echo [INFO] Detectado como repositorio existente.
    echo [INFO] Deteniendo servidor actual si estaba encendido...
    taskkill /F /IM node.exe >nul 2>&1
    echo [INFO] Obteniendo actualizaciones de GitHub...
    git pull origin main
) ELSE (
    echo [INFO] Iniciando instalacion por primera vez...
    echo [INFO] Clonando repositorio desde GitHub...
    git clone https://github.com/pabascal-afk/local_CCG_Portal_Unificado_Plataformas.git .
    IF ERRORLEVEL 1 (
        color 0C
        echo [ERROR] Hubo un problema al clonar.
        pause
        exit /b
    )
)

echo.
echo [INFO] Instalando/Actualizando modulos...
call npm install

echo [INFO] Inicializando base de datos...
node server/db/init_db.js

echo.
IF NOT EXIST ".env" (
    echo [ATENCION] Creando plantilla base .env...
    echo SESSION_SECRET=secreto_seguro_123> .env
    echo GOOGLE_CLIENT_ID=>> .env
    echo GOOGLE_CLIENT_SECRET=>> .env
    echo PORT=9000>> .env
    echo MASTER_PIN=1234>> .env
    echo.
)

echo.
color 0A
echo ==========================================================
echo   [EXITO] Todo listo y actualizado.
echo ==========================================================
echo.
echo Arrancando el servidor automaticamente...
start "" "Iniciar_Plataforma.vbs"
timeout /t 5 >nul
exit /b
`;

fs.writeFileSync('Instalador_Servidor.bat', content.replace(/\r?\n/g, '\r\n'), 'utf8');
console.log("Bat reescrito con CRLF");
