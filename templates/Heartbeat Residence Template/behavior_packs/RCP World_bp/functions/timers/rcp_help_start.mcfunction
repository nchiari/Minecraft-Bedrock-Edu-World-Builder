stopsound @a
tag @p add rcp_help
event entity @e[tag=enfermo] pix:sleep
event entity @e[tag=enfermo] npc_component_off
scoreboard players set @p rcp_help 2

give @p let:comprobar
give @p let:phone
give @p let:manos_rcp
give @p let:respiracion
give @p let:dea_item_off

playsound rcpbg @p

tp @e[family=human,tag=tecnico112] 16 66 365

setblock 15 70 368 iron_door ["direction"=3,"open_bit"=false]
setblock 16 70 368 iron_door ["direction"=2,"open_bit"=true]

fill 17 70 377 15 70 377 border_block

scoreboard players set @p rcp_help 2

setblock 14 68 367 redstone_block
setblock 8 68 366 redstone_block