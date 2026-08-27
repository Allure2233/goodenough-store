@echo off
setlocal
chcp 65001 >nul
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\start-store.ps1" -Action Start
if errorlevel 1 (
    echo.
    echo Store startup failed. Check .store-runtime\frontend.err.log.
    pause
)
endlocal
