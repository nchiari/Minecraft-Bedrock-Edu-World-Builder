## tracking
lesson @p activity cpr.choking.start restart

scoreboard players set var active 0
scoreboard players set var heimlichRandom 0
scoreboard players set var musica 0
scoreboard players set @p heimlich 0
tag @p remove heimlich

clear @p let:toser
clear @p let:manos_palmadas
clear @p let:manos_heimlich

event entity @e[family=dummy_2] dummy_reset

dialogue change @e[family=human,tag=heimlichNPC] heimlichNPC_start @p

titleraw @a title { "rawtext": [ { "translate" : "timer.title.stopped" } ] }

fill -131 70 348 -131 70 344 air
setblock -113 68 358 air

stopsound @a 8bitbg

scoreboard objectives setdisplay sidebar deas