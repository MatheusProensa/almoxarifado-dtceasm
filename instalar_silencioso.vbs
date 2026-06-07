Dim shell, fso, pasta

Set shell = CreateObject("WScript.Shell")
Set fso   = CreateObject("Scripting.FileSystemObject")

pasta = fso.GetParentFolderName(WScript.ScriptFullName)

MsgBox "Instalando dependências do Almox Proensa..." & vbCrLf & _
       "Isso pode levar alguns minutos. Aguarde.", _
       vbInformation, "Almox Proensa — Instalação"

' Instala dependências do frontend
shell.Run "cmd /c cd /d """ & pasta & """ && npm install", 1, True

' Instala dependências do backend
shell.Run "cmd /c cd /d """ & pasta & "\backend"" && npm install", 1, True

MsgBox "Instalação concluída!" & vbCrLf & _
       "Agora clique em iniciar.bat para abrir o sistema.", _
       vbInformation, "Almox Proensa — Instalação"
