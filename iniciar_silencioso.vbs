Dim shell, fso, pasta

Set shell = CreateObject("WScript.Shell")
Set fso   = CreateObject("Scripting.FileSystemObject")

' Pasta raiz do projeto (onde este arquivo está)
pasta = fso.GetParentFolderName(WScript.ScriptFullName)

' Se a pasta dist/ não existir, compila o frontend antes de iniciar
If Not fso.FolderExists(pasta & "\dist") Then
    shell.Run "cmd /c cd /d """ & pasta & """ && npm run build", 1, True
End If

' Inicia o servidor (backend + frontend) em segundo plano
shell.Run "cmd /c cd /d """ & pasta & "\backend"" && node server.js", 0, False

' Aguarda o servidor subir
WScript.Sleep 3000

' Descobre o nome deste computador para mostrar no título
Dim nomePC
nomePC = shell.ExpandEnvironmentStrings("%COMPUTERNAME%")

' Abre o sistema no navegador padrão
shell.Run "http://localhost:3001"
