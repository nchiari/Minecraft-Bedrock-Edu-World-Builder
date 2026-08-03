## Función que controla la salida del museo

## VERSIÓN ANTERIOR
## tp @e[tag=goya] -267 -57 -180
## dialogue change @e[tag=goya] goya_19 @a

## NUEVA VERSIÓN

event entity @e[tag=goya] let:despawn
tp @e[tag=goya2] -267 -57 -180
tag @e[tag=goya2] add goya
tag @e[tag=goya2] remove goya2

setblock -641 -15 -201 air
event entity @e[tag=goya] stay
event entity @e[tag=goya] chat_on
tp @a -269 -57 -177 facing -265 -57 -179

scoreboard players set var tooltips 100