# RCP to breath
execute if score var rcp_rcp matches 30 as @p run dialogue change @e[family=human,tag=rcpNPC] rcpNPC_breath @p
execute if score var rcp_rcp matches 30 as @p run dialogue open @e[family=human,tag=rcpNPC] @p rcpNPC_breath
execute if score var rcp_rcp matches 30 run scoreboard players add var rcp_rcp 1

# Breath to rcp
execute if score var rcp_breath matches 2 as @p run dialogue change @e[family=human,tag=rcpNPC] rcpNPC_dea @p
execute if score var rcp_breath matches 2 as @p run dialogue open @e[family=human,tag=rcpNPC] @p rcpNPC_dea
execute if score var rcp_breath matches 2 run scoreboard players add var rcp_breath 1

# DEA to final
execute if score var rcp_dea matches 1 as @p run dialogue change @e[family=human,tag=rcpNPC] rcpNPC_wait @p
execute if score var rcp_dea matches 1 as @p run dialogue open @e[family=human,tag=rcpNPC] @p rcpNPC_wait
execute if score var rcp_dea matches 1 run scoreboard players add var rcp_dea 1

# RCP counter reset
execute if score var rcp_counter matches 30.. run playsound random.levelup @p
execute if score var rcp_counter matches 30.. run scoreboard players set var rcp_counter 0