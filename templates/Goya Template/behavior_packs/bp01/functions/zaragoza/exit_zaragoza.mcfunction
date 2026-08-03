## Función que controla la salida de Zaragoza

## VERSIÓN ANTERIOR
## tp @e[tag=goya] -779 -56 -196 facing -777 -56 -197
## dialogue change @e[tag=goya] goya_24_b @a

## NUEVA VERSIÓN

event entity @e[tag=goya] let:despawn
tp @e[tag=goya3] -779 -56 -196 facing -777 -56 -197
tag @e[tag=goya3] add goya
tag @e[tag=goya3] remove goya3

setblock -226 -60 -58 air
event entity @e[tag=goya] stay
event entity @e[tag=goya] chat_on
tp @a -777 -56 -197 facing -778 -56 -193

scoreboard players set var tooltips 100