## tracking
lesson @p activity cpr.rcp.start restart

scoreboard players set var active 0
scoreboard players set var rcp_check 0
scoreboard players set var rcp_112 0
scoreboard players set var rcp_rcp 0
scoreboard players set var rcp_breath 0
scoreboard players set var rcp_dea 0
scoreboard players set var rcp_counter 0
scoreboard players set var musica 0
tag @p remove rcp

tp @e[family=human,tag=tecnico112] 16 66 365

dialogue change @e[family=human,tag=rcpNPC] rcpNPC_start @a
event entity @e[family=dummy] dummy_reset

dialogue change @e[type=npc,name="911"] sos_a @a

titleraw @a title { "rawtext": [ { "translate" : "timer.title.stopped" } ] }

clear @p let:comprobar
clear @p let:phone
clear @p let:manos_rcp
clear @p let:respiracion
clear @p let:dea_item_off
clear @p let:dea_item_on

setblock 15 70 368 iron_door ["direction"=3,"open_bit"=true]
setblock 16 70 368 iron_door ["direction"=2,"open_bit"=false]

fill 17 70 377 15 70 377 air

setblock 8 68 366 air
setblock 14 68 367 air

stopsound @a rcpbg
scoreboard objectives setdisplay sidebar deas