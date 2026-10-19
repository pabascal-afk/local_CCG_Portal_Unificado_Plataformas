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
    echo [INFO] Deteniendo servidor actual en puerto 9000 si estaba encendido...
    powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 9000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }" >nul 2>&1
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

IF EXIST "ServerManager.cs" (
    IF EXIST "C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe" (
        echo [EXTRA] Actualizando ejecutable Gestor_Servidores_CCG.exe...
        "C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe" /nologo /target:winexe /out:"Gestor_Servidores_CCG.exe" /win32icon:"app.ico" /r:System.dll /r:System.Drawing.dll /r:System.Windows.Forms.dll /r:System.Net.Http.dll /r:System.Core.dll ServerManager.cs >nul 2>&1
    )
)

IF EXIST "%~dp0Gestor_Servidores_CCG.exe" (
    powershell -NoProfile -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut([Environment]::GetFolderPath('Desktop') + '\Gestor de Servidores CCG.lnk'); $s.TargetPath = '%~dp0Gestor_Servidores_CCG.exe'; $s.WorkingDirectory = '%~dp0'; $s.IconLocation = '%~dp0app.ico'; $s.Description = 'Centro de Control de Servidores - Colegio Cerro Grande'; $s.Save()" >nul 2>&1
)

echo.
color 0A
echo ==========================================================
echo   [EXITO] Todo listo y actualizado.
echo   [NUEVO] Se ha creado 'Gestor de Servidores CCG' en el Escritorio.
echo ==========================================================
echo.
echo Arrancando el servidor automaticamente...
start "" "Iniciar_Plataforma.vbs"
timeout /t 5 >nul
exit /b
