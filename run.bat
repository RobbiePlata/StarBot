@echo off
TITLE OcularPatdownBot
if not defined in_subprocess (cmd /k set in_subprocess=y ^& %0 %*) & exit )
COLOR F9
mode con:cols=90 lines=30
node bot.js