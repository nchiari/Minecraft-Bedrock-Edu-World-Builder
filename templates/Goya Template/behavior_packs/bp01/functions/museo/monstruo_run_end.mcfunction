## Función que resetea la secuencia del monstruo cuando se escapa

dialogue change @e[tag=goya] goya_18 @a
tp @e[tag=goya] -631 -1 -159
event entity @e[tag=goya] chat_on

function dialogos/diag_lights_on

fill -654 -3 -177 -654 -3 -174 air

tag @a remove chase

fill -635 -1 -179 -635 2 -181 barrier
fill -660 -1 -171 -662 -1 -171 air
inputpermission set @a camera enabled
inputpermission set @a movement enabled
hud @a reset
camera @a clear

scoreboard players set var tooltips 100
setblock -641 -15 -201 redstone_block