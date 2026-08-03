## Función que sirve para finalizar la misión de devolver a los 3 personajes a los cuadros

## SOLO USAR PARA TESTING

function museo/lights_off
function dialogos/diag_lights_off

clear @a
replaceitem entity @p slot.weapon.mainhand 0 let:pincel_light  1 0 {"minecraft:item_lock":{ "mode": "lock_in_slot" }}

tp @e[tag=goya] -636 -3 -207 facing -635 -3 -204
dialogue change @e[tag=goya] goya_15_b @a

setblock -666 -3 -192 redstone_block
setblock -657 -3 -211 redstone_block
setblock -657 -3 -186 redstone_block

summon pix:human_felix -656 -3 -209 ~~ skin_0 "Félix de Azara"
tag @e[family=felix,name="Félix de Azara"] add felix
summon pix:human_felix -667 -3 -194 ~~ skin_1 "María Luisa de Parma"
tag @e[family=felix,name="María Luisa de Parma"] add luisa
summon pix:human_felix -658 -3 -188 ~~ skin_2 Niña
tag @e[family=felix,name=Niña] add nina

event entity @e[tag=felix] let:despawn
event entity @e[tag=luisa] let:despawn
event entity @e[tag=nina] let:despawn