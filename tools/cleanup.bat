@echo off
setlocal
:PROMPT
SET /P AREYOUSURE=Are you sure (Y/[N])?
IF /I "%AREYOUSURE%" NEQ "Y" GOTO END
endlocal
del LICENSE
del package.json
del bot.js
del requirements.txt
del compile.bat
del README.md
del bot-linux
del bot-macos
del icon.ico
del bot-win.exe
del ResourceHacker.exe
del ResourceHacker.ini
del temp.exe
rmdir /S node_modules
del cleanup.bat
:END
