Dim shell, fso, pasta

Set shell = CreateObject("WScript.Shell")
Set fso   = CreateObject("Scripting.FileSystemObject")

' Pasta raiz do projeto (onde este arquivo está)
pasta = fso.GetParentFolderName(WScript.ScriptFullName)

' Faz backup do banco de dados antes de iniciar
Dim dbPath, backupPasta
dbPath      = pasta & "\backend\almox.db"
backupPasta = pasta & "\backups"

If fso.FileExists(dbPath) Then
    If Not fso.FolderExists(backupPasta) Then fso.CreateFolder backupPasta

    ' Nome do backup com data e hora
    Dim agora, ts
    agora = Now()
    ts = Year(agora) & "-" & Right("0" & Month(agora), 2) & "-" & Right("0" & Day(agora), 2) & _
         "_" & Right("0" & Hour(agora), 2) & "-" & Right("0" & Minute(agora), 2)
    fso.CopyFile dbPath, backupPasta & "\almox-" & ts & ".db"

    ' Mantém apenas os 10 backups mais recentes
    Dim arquivos, arq, nomes(), total, i, j, tmp
    Set arquivos = fso.GetFolder(backupPasta).Files
    total = 0
    For Each arq In arquivos
        If LCase(Right(arq.Name, 3)) = ".db" Then total = total + 1
    Next

    If total > 10 Then
        ReDim nomes(total - 1)
        i = 0
        For Each arq In arquivos
            If LCase(Right(arq.Name, 3)) = ".db" Then
                nomes(i) = arq.Name
                i = i + 1
            End If
        Next
        ' Ordena por nome (timestamp no nome = ordem cronológica)
        For i = 0 To total - 2
            For j = 0 To total - 2 - i
                If nomes(j) > nomes(j + 1) Then
                    tmp = nomes(j) : nomes(j) = nomes(j + 1) : nomes(j + 1) = tmp
                End If
            Next
        Next
        ' Apaga os mais antigos
        For i = 0 To total - 11
            If nomes(i) <> "" Then fso.DeleteFile backupPasta & "\" & nomes(i)
        Next
    End If
End If

' Reconstrói o frontend para garantir que a versão mais recente está sendo servida
shell.Run "cmd /c cd /d """ & pasta & """ && npm run build", 1, True

' Inicia o servidor (backend + frontend) em segundo plano
shell.Run "cmd /c cd /d """ & pasta & "\backend"" && node server.js", 0, False

' Aguarda o servidor subir
WScript.Sleep 3000

' Abre o sistema no navegador padrão
shell.Run "http://localhost:3001"
