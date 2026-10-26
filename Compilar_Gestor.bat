@echo off
cd /d "%~dp0"
echo Compilando Gestor_Servidores_CCG.exe con .NET Framework...
"C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe" /target:winexe /out:"Gestor_Servidores_CCG.exe" /win32icon:"app.ico" /r:System.dll /r:System.Drawing.dll /r:System.Windows.Forms.dll /r:System.Net.Http.dll /r:System.Core.dll ServerManager.cs
if %errorlevel% equ 0 (
    echo [OK] Gestor_Servidores_CCG.exe compilado exitosamente.
    copy /y "Gestor_Servidores_CCG.exe" "ccg.exe" >nul
    echo [OK] Copiado a ccg.exe
    if exist "..\ENSAYOS SIMCE" (
        copy /y "Gestor_Servidores_CCG.exe" "..\ENSAYOS SIMCE\" >nul
        copy /y "ccg.exe" "..\ENSAYOS SIMCE\" >nul
    )
    if exist "..\PRUEBAS CCG" (
        copy /y "Gestor_Servidores_CCG.exe" "..\PRUEBAS CCG\" >nul
        copy /y "ccg.exe" "..\PRUEBAS CCG\" >nul
    )
    if exist "..\..\New folder\labdesk" (
        copy /y "Gestor_Servidores_CCG.exe" "..\..\New folder\labdesk\" >nul
        copy /y "ccg.exe" "..\..\New folder\labdesk\" >nul
    )
    if exist "..\New folder\labdesk" (
        copy /y "Gestor_Servidores_CCG.exe" "..\New folder\labdesk\" >nul
        copy /y "ccg.exe" "..\New folder\labdesk\" >nul
    )
) else (
    echo [ERROR] Fallo la compilacion de Gestor_Servidores_CCG.exe.
    pause
)
