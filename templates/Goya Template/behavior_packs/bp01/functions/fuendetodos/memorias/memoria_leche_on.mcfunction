## Función que controla qué memorias activar y qué diálogos abrir en la Casa de Goya

## Memoria leche
tag @e[tag=goya] add memoria_leche

function clear_pinceles
replaceitem entity @p slot.weapon.mainhand 0 let:pincel_memory 1 0 {"minecraft:item_lock":{ "mode": "lock_in_slot" }}
dialogue change @e[tag=goya] goya_memorias_on @a
event entity @e[tag=goya] stay
scoreboard players set var tooltips 26
fill -63 -55 -628 -63 -54 -628 air
setblock -60 -57 -628 air
