## Función que sirve para iniciar la misión de pintar los 4 edificios

## SOLO USAR PARA TESTING
tp @p -241 -57 -181
tp @e[tag=goya] -237 -57 -180

dialogue change @e[tag=goya] goya_21 @a

clear @a
function zaragoza/pinceles/red

setblock -266 -57 -207 redstone_block

scoreboard players set var tooltips 13