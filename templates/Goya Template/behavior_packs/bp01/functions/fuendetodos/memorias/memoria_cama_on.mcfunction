## Función que controla qué memorias activar y qué diálogos abrir en la Casa de Goya

## Memoria cama
tag @e[tag=goya] add memoria_cama

function clear_pinceles
replaceitem entity @p slot.weapon.mainhand 0 let:pincel_memory 1 0 {"minecraft:item_lock":{ "mode": "lock_in_slot" }}
dialogue change @e[tag=goya] goya_memorias_on @a
event entity @e[tag=goya] stay
scoreboard players set var tooltips 26
fill -50 -46 -611 -49 -46 -614 air
setblock -52 -46 -608 air
