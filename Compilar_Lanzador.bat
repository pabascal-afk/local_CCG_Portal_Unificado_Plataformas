@echo off
cd /d "%~dp0"
echo Compilando Lanzador_Plataforma.exe con .NET Framework...
"C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe" /nologo /target:winexe /out:"Lanzador_Plataforma.exe" /win32icon:"app.ico" /r:System.dll /r:System.Drawing.dll /r:System.Windows.Forms.dll /r:System.Net.Http.dll /r:System.Core.dll Launcher.cs
if %errorlevel% equ 0 (
    echo [OK] Lanzador_Plataforma.exe compilado exitosamente.
) else (
    echo [ERROR] Fallo la compilacion de Lanzador_Plataforma.exe.
    pause
)
