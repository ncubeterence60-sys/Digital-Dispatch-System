@echo off
title Digital Dispatch Admin Launcher

:menu
cls
echo ================================
echo  Digital Dispatch Admin Launcher
echo ================================
echo 1. Development Mode (Live Reload)
echo 2. Production Build & Launch
echo 3. Install Dependencies
echo 4. Exit
echo ================================
set /p choice="Choose option (1-4): "

if "%choice%"=="1" goto dev
if "%choice%"=="2" goto prod
if "%choice%"=="3" goto install
if "%choice%"=="4" goto exit
echo Invalid choice. Try again.
timeout /t 2 >nul
goto menu

:install
cd /d "admin-app"
echo Installing dependencies...
npm ci
echo Done! Press any key to return.
pause >nul
goto menu

:dev
cd /d "admin-app"
echo Starting Development Mode...
npm run electron-dev
goto menu

:prod
cd /d "admin-app"
echo Building for Production...
npm run dist
if %errorlevel% neq 0 (
    echo Build failed!
    pause
    goto menu
)
echo Launching Production App...
start "" "dist-electron/Digital Dispatch Admin.exe"
echo App launched! Close this window when done.
pause
goto menu

:exit
exit
