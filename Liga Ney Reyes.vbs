Dim fso, scriptDir, shell

Set fso = CreateObject("Scripting.FileSystemObject")
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)

Set shell = CreateObject("WScript.Shell")
shell.CurrentDirectory = scriptDir

' El "0" al final es lo que oculta la ventana por completo.
' El "False" significa que no espera a que termine (queda corriendo).
shell.Run """" & scriptDir & "\iniciar_liga.bat""", 0, False
