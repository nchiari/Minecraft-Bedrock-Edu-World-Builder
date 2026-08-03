scoreboard players set var active 0
scoreboard players set var rcp_check 0
scoreboard players set var rcp_112 0
scoreboard players set var rcp_rcp 0
scoreboard players set var rcp_breath 0
scoreboard players set var rcp_dea 0
scoreboard players set var rcp_counter 0
scoreboard players set var musica 0
tag @p remove rcp

tp @e[family=human,tag=tecnico112] 15 70 366 facing @p
dialogue open @e[family=human,tag=tecnico112] @p emergencia_final

dialogue change @e[family=human,tag=rcpNPC] rcpNPC_final_ok @a
event entity @e[family=dummy] dummy_reset

dialogue change @e[type=npc,name="911"] sos_a @a

clear @p let:comprobar
clear @p let:phone
clear @p let:manos_rcp
clear @p let:respiracion
clear @p let:dea_item_off
clear @p let:dea_item_on

execute as @p if score @p rcp_help matches 0 run scoreboard players set @p rcp_help 1

execute as @p if score @p rcp_help matches 1.. run setblock 15 70 368 iron_door ["direction"=3,"open_bit"=true]
execute as @p if score @p rcp_help matches 1.. run setblock 16 70 368 iron_door ["direction"=2,"open_bit"=false]

setblock 8 68 366 air
setblock 14 68 367 air

stopsound @a rcpbg
scoreboard objectives setdisplay sidebar deas

setblock 17 68 370 redstone_block

tag @p add rcp_ok