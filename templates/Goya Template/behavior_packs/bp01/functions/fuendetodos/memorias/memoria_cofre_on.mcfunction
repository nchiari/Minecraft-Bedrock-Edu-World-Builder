## Función que controla qué memorias activar y qué diálogos abrir en la Casa de Goya

## Memoria cofre
tag @e[tag=goya] add memoria_cofre

function clear_pinceles
replaceitem entity @p slot.weapon.mainhand 0 let:pincel_memory 1 0 {"minecraft:item_lock":{ "mode": "lock_in_slot" }}
dialogue change @e[tag=goya] goya_memorias_on @a
event entity @e[tag=goya] stay
scoreboard players set var tooltips 26
setblock -63 -47 -627 let:cofre_antiguo
setblock -66 -47 -629 air
