## Función que controla qué memorias activar y qué diálogos abrir en la Casa de Goya

## Esta es diferente al resto, no te preocupes

## Memoria estatua

function clear_pinceles
replaceitem entity @p slot.weapon.mainhand 0 let:pincel_memory 1 0 {"minecraft:item_lock":{ "mode": "lock_in_slot" }}
dialogue change @e[tag=goya] goya_36 @a
event entity @e[tag=goya] chat_on
scoreboard players set var tooltips 100
setblock -57 -53 -617 air
setblock -56 -57 -615 air
