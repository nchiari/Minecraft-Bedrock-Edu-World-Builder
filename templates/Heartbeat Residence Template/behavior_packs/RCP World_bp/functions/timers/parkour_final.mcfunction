scoreboard players set var active 0
tag @p[family=player,tag=parkour] remove parkour

setblock 53 68 279 air
setblock 53 68 279 air

stopsound @a race

execute if score var seconds matches 0.. if score var seconds matches 10.. run titleraw @a actionbar {"rawtext":[{ "translate" : "timer.title.tiempo" },{"score":{"name":"var","objective":"minutes"}},{"text":":"},{"score":{"name":"var","objective":"seconds"}}]}
execute if score var minutes matches 0.. if score var seconds matches ..9 run titleraw @a actionbar {"rawtext":[{ "translate" : "timer.title.tiempo" }, {"score":{"name":"var","objective":"minutes"}},{"text":":"},{"text":"0"},{"score":{"name":"var","objective":"seconds"}}]}

tag @p add parkour_ok