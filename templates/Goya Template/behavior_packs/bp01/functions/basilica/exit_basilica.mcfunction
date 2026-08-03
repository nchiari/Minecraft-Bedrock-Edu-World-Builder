## Función que controla la salida de la Basílica

## VERSIÓN ANTERIOR
## tp @e[tag=goya] 23 -57 -607 facing 24 -57 -603
## dialogue change @e[tag=goya] goya_28 @a

## NUEVA VERSIÓN

event entity @e[tag=goya] let:despawn
tp @e[tag=goya4] 23 -57 -607 facing 24 -57 -603
tag @e[tag=goya4] add goya
tag @e[tag=goya4] remove goya4

setblock -226 -60 -58 air
event entity @e[tag=goya] stay
tp @a 24 -57 -603 facing 27 -57 -609

scoreboard players set var tooltips 100
event entity @e[tag=goya] chat_on