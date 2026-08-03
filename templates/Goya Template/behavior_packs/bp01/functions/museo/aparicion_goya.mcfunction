## Función que tiene los comandos cuando aparece Goya por primera vez al recoger el pincel. Se ejecuta desde el pincel_display queue command

scoreboard players set var tooltips 111
give @p let:pincel_base 1 0 {"minecraft:item_lock":{ "mode": "lock_in_slot" }}
tp @e[tag=goya] -636 -3 -207 facing -635 -3 -204
setblock -636 -3 -206 light_block ["block_light_level"=3]
event entity @e[tag=goya] chat_on
dialogue change @e[tag=goya] goya_00 @a
setblock -628 -3 -207 redstone_block