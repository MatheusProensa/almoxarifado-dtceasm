Dim shell, fso, pasta

Set shell = CreateObject("WScript.Shell")
Set fso   = CreateObject("Scripting.FileSystemObject")

pasta = fso.GetParentFolderName(WScript.ScriptFullName)

' Baixa atualizações do GitHub
Dim ret
ret = shell.Run("cmd /c cd /d """ & pasta & """ && git pull", 1, True)

If ret <> 0 Then
    MsgBox "Erro ao baixar atualizações." & vbCrLf & _
           "Verifique se o computador tem acesso à internet.", _
           vbExclamation, "Almox Proensa — Atualização"
    WScript.Quit
End If

MsgBox "Sistema atualizado com sucesso!" & vbCrLf & _
       "Clique em iniciar.bat para abrir o sistema.", _
       vbInformation, "Almox Proensa — Atualização"
