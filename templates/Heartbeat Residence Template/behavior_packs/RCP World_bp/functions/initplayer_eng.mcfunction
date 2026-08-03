scoreboard players reset var active
scoreboard players reset var minutes
scoreboard players reset var seconds
scoreboard players reset var musica
scoreboard players reset var tick
scoreboard players reset var heimlichRandom
scoreboard players reset var plates
scoreboard players reset var burp
scoreboard players set var rcp_check 0
scoreboard players set var rcp_112 0
scoreboard players set var rcp_rcp 0
scoreboard players set var rcp_dea 0
scoreboard players set @a rcp_help 0
scoreboard players set var dea_placed 5
scoreboard players set @p deas 0
scoreboard players reset @a color
scoreboard players reset @a colormix
scoreboard players reset @a color
scoreboard players reset @a simon
scoreboard players reset @a dispenser
scoreboard players reset @a heimlich
scoreboard players reset @a parkourCheckpoint
scoreboard objectives setdisplay sidebar

tag @a remove construction
tag @a remove rcp
tag @a remove simon
tag @a remove dispenser
tag @a remove heimlich
tag @a remove parkour
tag @a remove rcp_ok
tag @a remove simon_ok
tag @a remove dispenser_ok
tag @a remove heimlich_ok
tag @a remove parkour_ok
tag @a remove parkour_open
tag @a remove dea_ok
tag @a remove dea_1
tag @a remove final_ok

function reset_counters

dialogue change @e[tag=salvacorazones] salvacorazones_start_a @a
event entity @e[x=-51,y=70,z=297,r=1] let:despawn
summon let:dea_totem_2 -51 70 297 180

clear @a

gamemode a
tp -52 70 294 facing -53 70 297
spawnpoint @a

fill 47 70 280 47 70 282 border_block

titleraw @p title { "rawtext": [ { "translate" : "start.title.title" } ] }
titleraw @p subtitle { "rawtext": [ { "translate" : "start.title.subtitle" } ] }

dialogue change @e[tag=salvacorazones] salvacorazones_intro @a
dialogue open @e[tag=salvacorazones] @p salvacorazones_intro

tag @a remove init_eng