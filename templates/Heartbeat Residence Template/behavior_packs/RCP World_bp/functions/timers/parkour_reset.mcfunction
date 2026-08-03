## tracking
lesson @p activity cpr.parkour.start restart

scoreboard players set var active 0
scoreboard players set @p parkourCheckpoint 0
scoreboard players set var musica 0
spawnpoint @p[family=player] 52 70 282
tag @p remove parkour

dialogue change @e[family=human,tag=parkourNPC] parkourNPC_start @a
dialogue change @e[family=human,tag=parkour_finalNPC] parkourNPC_board_2 @a
dialogue change @e[family=human,tag=parkour_introNPC] parkourNPC_board_2 @a

titleraw @a title { "rawtext": [ { "translate" : "timer.title.stopped" } ] }

dialogue change @e[tag=parkour1] parkour_timeup @a
fill 64 78 306 64 78 309 border_block
dialogue change @e[tag=parkour2] parkour_timeup @a
fill 84 79 320 84 79 323 border_block
dialogue change @e[tag=parkour3] parkour_timeup @a
fill 81 79 338 84 79 338 border_block
dialogue change @e[tag=parkour4] parkour_timeup @a
fill 69 70 347 69 70 345 border_block
dialogue change @e[tag=parkour5] parkour_timeup @a
fill 69 80 360 69 80 363 border_block

fill 71 71 351 89 71 351 air replace lime_wool
fill 71 71 351 89 71 351 air replace red_wool
fill 91 70 363 91 70 365 border_block
fill 53 67 285 54 67 285 air
fill 47 70 280 47 70 282 air
setblock 71 68 373 air

setblock 53 68 279 air

stopsound @a race

scoreboard objectives setdisplay sidebar deas