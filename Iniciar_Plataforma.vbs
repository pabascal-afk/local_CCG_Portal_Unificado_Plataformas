Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "cmd /c node server/index.js", 0
Set WshShell = Nothing
