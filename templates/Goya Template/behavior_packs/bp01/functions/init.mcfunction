## Borra todos los scores y tags del jugador y hace TP al spawn

## TP y cambios de modo

tp @a -642 -14 -186 facing -642 -14 -182
gamerule sendcommandfeedback false
gamerule commandblockoutput false
gamerule showcoordinates false
gamemode a @a
clear @a

event entity @e[tag=sandra] chat_on

function dialogos/diag_museo

function scores

ability @a worldbuilder false