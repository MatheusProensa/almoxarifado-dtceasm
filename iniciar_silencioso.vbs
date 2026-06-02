Dim shell
Set shell = CreateObject("WScript.Shell")

' Inicia o servidor backend em segundo plano (sem janela)
shell.Run "cmd /c node """ & CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName) & "\backend\server.js""", 0, False

' Aguarda 2 segundos para o servidor subir
WScript.Sleep 2000

' Inicia o front-end em segundo plano (sem janela)
shell.Run "cmd /c cd /d """ & CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName) & """ && npm run dev", 0, False

' Aguarda 3 segundos para o front-end compilar
WScript.Sleep 3000

' Abre o navegador
shell.Run "http://localhost:5173"
