@echo off
rem Double-click to play Lab Rivals locally: installs what's missing, builds the client,
rem starts the game server on http://localhost:3219 (or the next free port if another program
rem has 3219) and opens the browser once the server answers.
rem Close this window to stop the server.
setlocal
title Lab Rivals - local server
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
    echo Node.js is not installed. Install Node 20 or newer from https://nodejs.org and try again.
    goto :fail
)

set STATE=
set PORT=3219
for /f "tokens=1,2" %%a in ('node tools\local-port.mjs') do (
    set "STATE=%%a"
    set "PORT=%%b"
)
if "%STATE%"=="running" (
    echo Lab Rivals is already running - opening http://localhost:%PORT% ...
    start "" http://localhost:%PORT%
    goto :end
)
if not "%STATE%"=="free" (
    echo No free port between 3219 and 3225. Close another local game server and try again.
    goto :fail
)
if not "%PORT%"=="3219" echo Port 3219 is used by another program, so Lab Rivals will use port %PORT%.

if not exist "server\node_modules" call npm --prefix server install || goto :fail
if not exist "client\node_modules" call npm --prefix client install || goto :fail
echo Building the game...
call npm run build || goto :fail

start "" /b powershell -NoProfile -WindowStyle Hidden -Command "for ($i = 0; $i -lt 60; $i++) { try { Invoke-WebRequest -UseBasicParsing -TimeoutSec 2 http://localhost:%PORT%/health | Out-Null; Start-Process 'http://localhost:%PORT%'; break } catch { Start-Sleep -Milliseconds 500 } }"

echo Starting the server on http://localhost:%PORT% ...
call npm start
echo.
echo The server stopped.
goto :end

:fail
echo.
echo Could not start the game. See the messages above.
:end
pause
