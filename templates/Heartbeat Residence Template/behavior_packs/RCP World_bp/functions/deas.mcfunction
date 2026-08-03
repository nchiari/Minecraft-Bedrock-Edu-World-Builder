scoreboard objectives setdisplay sidebar deas
clear @p let:dea 0 1
scoreboard players add @p deas 1
playsound random.levelup @p
particle minecraft:crop_growth_emitter ~~2~
event entity @s variant2
titleraw @p title { "rawtext": [ { "translate" : "dea.title.placed" } ] }
execute if score @p deas matches 6 run titleraw @p subtitle { "rawtext": [ { "translate" : "dea.title.end" } ] }
execute if score @p deas matches 6 run playsound tada @a
execute if score @p deas matches ..5 run titleraw @p subtitle { "rawtext": [ { "translate" : "dea.title.remain" },{"score":{"name":"var","objective":"dea_placed"}} ] }
execute if score @p deas matches 6 run tag @a add dea_ok