@echo off
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
    echo [INFO] Obteniendo actualizaciones de GitHub...
    git pull origin main
) ELSE (
    echo [INFO] Iniciando instalacion por primera vez...
    echo [INFO] Clonando repositorio desde GitHub...
    git clone https://github.com/pabascal-afk/local_CCG_Portal_Unificado_Plataformas.git .
    IF ERRORLEVEL 1 (
        color 0C
        echo [ERROR] Hubo un problema al clonar. Asegurate de ejecutar este archivo en una carpeta vacia.
        pause
        exit /b
    )
)

echo.
echo [INFO] Instalando/Actualizando modulos y dependencias...
call npm install

echo [INFO] Inicializando base de datos...
node server/db/init_db.js

echo.
IF NOT EXIST ".env" (
    echo [ATENCION] No se encontro un archivo .env de configuracion.
    echo Creando plantilla base .env...
    echo SESSION_SECRET=secreto_seguro_123> .env
    echo GOOGLE_CLIENT_ID=>> .env
    echo GOOGLE_CLIENT_SECRET=>> .env
    echo PORT=9000>> .env
    echo MASTER_PIN=1234>> .env
    echo.
    echo [AVISO] Se ha creado un archivo ".env". Por favor abrelo y pega las credenciales de Google.
)

echo.
color 0A
echo ==========================================================
echo   [EXITO] Todo listo y actualizado.
echo ==========================================================
echo.
echo Para arrancar el servidor de forma silenciosa, haz doble click 
echo en el archivo "Iniciar_Plataforma.vbs".
echo.
pause

