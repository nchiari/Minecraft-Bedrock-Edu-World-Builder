scoreboard players add var rcp_counter 1
execute if score var rcp_counter matches 1..25 run titleraw @p title {"rawtext":[{"text":"§f"}]}
execute if score var rcp_counter matches 1..25 run titleraw @p subtitle {"rawtext":[{"text":"§a"},{"score":{"name":"var","objective":"rcp_counter"}}]}
execute if score var rcp_counter matches 26..27 run titleraw @p title {"rawtext":[{"text":"§f"}]}
execute if score var rcp_counter matches 26..27 run titleraw @p subtitle {"rawtext":[{"text":"§g"},{"score":{"name":"var","objective":"rcp_counter"}}]}
execute if score var rcp_counter matches 28..29 run titleraw @p title {"rawtext":[{"text":"§f"}]}
execute if score var rcp_counter matches 28..29 run titleraw @p subtitle {"rawtext":[{"text":"§6"},{"score":{"name":"var","objective":"rcp_counter"}}]}
execute if score var rcp_counter matches 30 run titleraw @p title {"rawtext":[{"text":"§c"},{"score":{"name":"var","objective":"rcp_counter"}}]}
execute if score var rcp_counter matches 30 run titleraw @p subtitle {"rawtext":[{ "translate" : "rcp.title.breath" }]}