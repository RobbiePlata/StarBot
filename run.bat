@echo off
COLOR F9
if not defined in_subprocess (cmd /k set in_subprocess=y ^& %0 %*) & exit )
::mode con:cols=100 lines=50
::TIMEOUT /T 2
::mode con:cols=80 lines=30
node bot.js