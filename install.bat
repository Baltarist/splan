@echo off
echo Installing packages...
"C:\Program Files\nodejs\node.exe" "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" install
echo.
echo Generating Prisma client...
"C:\Program Files\nodejs\node.exe" "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" exec prisma generate
echo.
echo Packages and Prisma client installed!
pause 