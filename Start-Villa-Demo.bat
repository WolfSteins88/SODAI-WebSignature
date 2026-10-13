@echo off
setlocal
title Villa Studio - Offline Demo
pushd "%~dp0"
if errorlevel 1 goto path_error
where node.exe >nul 2>&1
if errorlevel 1 goto missing_node
node "scripts\launch-demo.mjs" %*
set "VILLA_EXIT=%ERRORLEVEL%"
if not "%VILLA_EXIT%"=="0" pause
popd
exit /b %VILLA_EXIT%
:missing_node
echo Node.js 24 LTS is required. Install it, then follow docs\windows-offline-launcher.md.
pause
popd
exit /b 1
:path_error
echo Cannot open the project folder. Keep this BAT beside package.json.
pause
exit /b 1
