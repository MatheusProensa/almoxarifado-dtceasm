Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Backend
Start-Process -FilePath "D:\Node\node.exe" -ArgumentList "server.js" -WorkingDirectory "D:\almox-proensa\backend" -WindowStyle Hidden
Start-Sleep -Seconds 2

# Frontend (usando caminho completo do vite)
Start-Process -FilePath "D:\almox-proensa\node_modules\.bin\vite.cmd" -WorkingDirectory "D:\almox-proensa" -WindowStyle Hidden
Start-Sleep -Seconds 15

# Abre o sistema
Start-Process "msedge" -ArgumentList "--app=http://localhost:5173", "--window-size=1400,900"
