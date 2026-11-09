@echo off
color 0B
title Actualizar Portal Unificado (UNIFIED PLATAFORM) desde GitHub - Colegio Cerro Grande
cd /d "%~dp0"

echo ===============================================================
echo     Actualizador Portal Unificado CCG - Colegio Cerro Grande
echo ===============================================================
echo.

echo [1/4] Deteniendo instancias previas en el puerto 9000...
powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 9000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }" >nul 2>&1
del /F /Q "Gestor_Servidores_CCG.exe.old*" >nul 2>&1
del /F /Q "ccg.exe.old*" >nul 2>&1
del /F /Q "Lanzador_Plataforma.exe.old*" >nul 2>&1
if exist "Gestor_Servidores_CCG.exe" (
    move /Y "Gestor_Servidores_CCG.exe" "Gestor_Servidores_CCG.exe.old" >nul 2>&1
    if exist "Gestor_Servidores_CCG.exe" move /Y "Gestor_Servidores_CCG.exe" "Gestor_Servidores_CCG.exe.old.%RANDOM%" >nul 2>&1
)
if exist "ccg.exe" (
    move /Y "ccg.exe" "ccg.exe.old" >nul 2>&1
    if exist "ccg.exe" move /Y "ccg.exe" "ccg.exe.old.%RANDOM%" >nul 2>&1
)
if exist "Lanzador_Plataforma.exe" (
    move /Y "Lanzador_Plataforma.exe" "Lanzador_Plataforma.exe.old" >nul 2>&1
    if exist "Lanzador_Plataforma.exe" move /Y "Lanzador_Plataforma.exe" "Lanzador_Plataforma.exe.old.%RANDOM%" >nul 2>&1
)

echo.
echo [2/4] Descargando ultimos cambios desde GitHub (origin/main)...
git config --global http.sslVerify false >nul 2>&1
git remote set-url origin https://github.com/pabascal-afk/local_CCG_Portal_Unificado_Plataformas.git >nul 2>&1
git config remote.origin.fetch "+refs/heads/*:refs/remotes/origin/*" >nul 2>&1
git fetch origin +refs/heads/main:refs/remotes/origin/main
git checkout -B main origin/main
git reset --hard origin/main
IF ERRORLEVEL 1 (
    git stash
    git pull origin main
)

echo.
echo [3/4] Verificando dependencias npm...
call npm install --no-audit

echo.
echo [4/4] Sincronizando base de datos y catalogo...
if exist "server\db\init_db.js" (
    node server/db/init_db.js
)
if exist "scripts\generate_curriculo_rich.js" (
    node scripts/generate_curriculo_rich.js
)

IF EXIST "ServerManager.cs" (
    IF EXIST "C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe" (
        echo.
        echo [EXTRA] Actualizando ejecutables Gestor_Servidores_CCG.exe y ccg.exe...
        "C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe" /nologo /target:winexe /out:"Gestor_Servidores_CCG.exe" /win32icon:"app.ico" /r:System.dll /r:System.Drawing.dll /r:System.Windows.Forms.dll /r:System.Net.Http.dll /r:System.Core.dll ServerManager.cs >nul 2>&1
        copy /y "Gestor_Servidores_CCG.exe" "ccg.exe" >nul 2>&1
    )
)

IF EXIST "Launcher.cs" (
    IF EXIST "C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe" (
        echo.
        echo [EXTRA] Actualizando ejecutable Lanzador_Plataforma.exe...
        "C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe" /nologo /target:winexe /out:"Lanzador_Plataforma.exe" /win32icon:"app.ico" /r:System.dll /r:System.Drawing.dll /r:System.Windows.Forms.dll /r:System.Net.Http.dll /r:System.Core.dll Launcher.cs >nul 2>&1
    )
)

IF EXIST "%~dp0Gestor_Servidores_CCG.exe" (
    powershell -NoProfile -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut([Environment]::GetFolderPath('Desktop') + '\Gestor de Servidores CCG.lnk'); $s.TargetPath = '%~dp0Gestor_Servidores_CCG.exe'; $s.WorkingDirectory = '%~dp0'; $s.IconLocation = '%~dp0app.ico'; $s.Description = 'Centro de Control de Servidores - Colegio Cerro Grande'; $s.Save()" >nul 2>&1
)

echo.
color 0A
echo ===============================================================
echo   [EXITO] Portal Unificado actualizado correctamente!
echo   [NUEVO] Acceso 'Gestor de Servidores CCG' actualizado en Escritorio.
echo ===============================================================
echo.
if exist "Iniciar_Plataforma.vbs" (
    start "" "Iniciar_Plataforma.vbs"
)
timeout /t 4 >nul
exit /b
