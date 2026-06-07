Dim shell, fso, pasta

Set shell = CreateObject("WScript.Shell")
Set fso   = CreateObject("Scripting.FileSystemObject")

pasta = fso.GetParentFolderName(WScript.ScriptFullName)

Dim dbPath, backupPasta
dbPath      = pasta & "\backend\almox.db"
backupPasta = pasta & "\backups"

If Not fso.FileExists(dbPath) Then
    MsgBox "Banco de dados não encontrado." & vbCrLf & _
           "Inicie o sistema pelo menos uma vez antes de fazer backup.", _
           vbExclamation, "Almox Proensa — Backup"
    WScript.Quit
End If

If Not fso.FolderExists(backupPasta) Then fso.CreateFolder backupPasta

Dim agora, ts
agora = Now()
ts = Year(agora) & "-" & Right("0" & Month(agora), 2) & "-" & Right("0" & Day(agora), 2) & _
     "_" & Right("0" & Hour(agora), 2) & "-" & Right("0" & Minute(agora), 2)

Dim destino
destino = backupPasta & "\almox-" & ts & ".db"
fso.CopyFile dbPath, destino

MsgBox "Backup realizado com sucesso!" & vbCrLf & vbCrLf & _
       "Arquivo: backups\almox-" & ts & ".db", _
       vbInformation, "Almox Proensa — Backup"
