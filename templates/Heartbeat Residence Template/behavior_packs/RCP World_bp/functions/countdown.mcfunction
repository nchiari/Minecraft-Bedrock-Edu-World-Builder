scoreboard players remove var seconds 1

execute if score var minutes matches 1.. if score var seconds matches 0 run function substract

execute if score var seconds matches 0.. if score var seconds matches 10.. run titleraw @a actionbar {"rawtext":[{ "translate" : "timer.title.tiempo" },{"score":{"name":"var","objective":"minutes"}},{"text":":"},{"score":{"name":"var","objective":"seconds"}}]}
execute if score var minutes matches 0.. if score var seconds matches ..9 run titleraw @a actionbar {"rawtext":[{ "translate" : "timer.title.tiempo" },{"score":{"name":"var","objective":"minutes"}},{"text":":"},{"text":"0"},{"score":{"name":"var","objective":"seconds"}}]}

execute if score var minutes matches 0 if score var seconds matches 0 run scoreboard players set var active 0
execute if score var minutes matches 0 if score var seconds matches 0 run titleraw @a title {"rawtext":[{ "translate" : "timer.title.timeup" }]}
execute if score var minutes matches 0 if score var seconds matches 0 run playsound block.bell.hit @a

execute as @p[tag=parkour] if score var minutes matches 0 if score var seconds matches 0 run function timers/parkour_reset

execute as @p[tag=simon] if score var minutes matches 0 if score var seconds matches 0 run function timers/simon_final

execute as @p[tag=dispenser] if score var minutes matches 0 if score var seconds matches 0 run function timers/dispenser_final

execute as @p[tag=rcp] if score var minutes matches 0 if score var seconds matches 0 if score var rcp_dea matches 0 run function timers/rcp_final_no
execute as @p[tag=rcp] if score var minutes matches 0 if score var seconds matches 0 if score var rcp_dea matches 1.. run function timers/rcp_final_ok

execute as @p[tag=rcp_help] if score var minutes matches 0 if score var seconds matches 0 if score @p rcp_help matches 3 run function timers/rcp_help_final

execute as @p[tag=heimlich] if score var minutes matches 0 if score var seconds matches 0 run function timers/heimlich_final