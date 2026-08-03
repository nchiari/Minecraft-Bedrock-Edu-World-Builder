## Función que controla la entrada a la Casa de Goya

## VERSIÓN ANTERIOR
## tp @e[tag=goya] -60 -54 -615 facing -60 -54 -612
## dialogue change @e[tag=goya] goya_29 @a

## NUEVA VERSIÓN

event entity @e[tag=goya] let:despawn
tp @e[tag=goya5] -60 -54 -615 facing -60 -54 -612
tag @e[tag=goya5] add goya
tag @e[tag=goya5] remove goya5

setblock 18 -59 -620 air
event entity @e[tag=goya] stay
event entity @e[tag=goya] chat_on
tp @a -60 -54 -612 facing -60 -54 -615

scoreboard players set var tooltips 100