Dim shell, fso, pasta, configFile, servidor, url

Set shell = CreateObject("WScript.Shell")
Set fso   = CreateObject("Scripting.FileSystemObject")

pasta      = fso.GetParentFolderName(WScript.ScriptFullName)
configFile = pasta & "\servidor.txt"

' Lê o nome/IP do servidor salvo, ou pergunta na primeira vez
If fso.FileExists(configFile) Then
    Dim f
    Set f   = fso.OpenTextFile(configFile, 1)
    servidor = Trim(f.ReadLine())
    f.Close
Else
    servidor = InputBox( _
        "Digite o NOME ou IP do computador servidor:" & vbCrLf & _
        "(ex: ALMOX-PC  ou  192.168.1.100)" & vbCrLf & vbCrLf & _
        "Você só precisa fazer isso uma vez.", _
        "Almox Proensa — Configuração", "ALMOX-PC")

    If servidor = "" Then
        MsgBox "Nenhum servidor informado. Encerrando.", vbExclamation, "Almox Proensa"
        WScript.Quit
    End If

    ' Salva para não perguntar de novo
    Dim fw
    Set fw = fso.CreateTextFile(configFile, True)
    fw.WriteLine Trim(servidor)
    fw.Close
End If

url = "http://" & servidor & ":3001"
shell.Run url
