# Iniciar dialogos
### DESACTIVAR PARA TESTEO
########
execute as @a[tag=!init] run function initplayer
execute as @a[tag=init_eng] run function initplayer_eng

# Clear de items
clear @a ender_pearl
clear @a chorus_fruit

# Congelar al jugador cuando arranca
### DESACTIVAR PARA TESTEO
########
execute if score @p deas matches 0 run inputpermission set @p movement disabled

# Abrir zona parkour cuando se hayan hecho las demas actividades
execute as @a[tag=simon_ok,tag=rcp_ok,tag=heimlich_ok,tag=!parkour_open] run fill 47 70 280 47 70 282 air 
execute as @a[tag=simon_ok,tag=rcp_ok,tag=heimlich_ok,tag=!parkour_open] run dialogue change @e[family=human,tag=parkour_introNPC] parkour_intro @a
execute as @a[tag=simon_ok,tag=rcp_ok,tag=heimlich_ok,tag=!parkour_open] run tag @a add parkour_open

# Abre dialogho de la Dra. Salvacorazones al colocar el 1er DEA
execute if score @p deas matches 1 as @a[tag=!dea_1] run dialogue change @e[family=human,tag=salvacorazones] salvacorazones_start_d @p
execute if score @p deas matches 1 as @a[tag=!dea_1] run dialogue open @e[family=human,tag=salvacorazones] @p salvacorazones_start_d
execute if score @p deas matches 1 as @a[tag=!dea_1] run scoreboard objectives setdisplay sidebar deas
execute if score @p deas matches 1 run inputpermission set @p movement enabled
execute if score @p deas matches 1 as @a[tag=!dea_1] run tag @a add dea_1

# Cambia el dialogho de la Dra. Salvacorazones al haber acabado todas las actividades
execute as @a[tag=simon_ok,tag=rcp_ok,tag=heimlich_ok,tag=parkour_ok,tag=dea_ok,tag=!final_ok] run titleraw @s title {"rawtext":[{"translate" : "ending.title.top" }]}
execute as @a[tag=simon_ok,tag=rcp_ok,tag=heimlich_ok,tag=parkour_ok,tag=dea_ok,tag=!final_ok] run titleraw @s subtitle {"rawtext":[{"translate" : "ending.title.bottom" }]}
execute as @a[tag=simon_ok,tag=rcp_ok,tag=heimlich_ok,tag=parkour_ok,tag=dea_ok,tag=!final_ok] run dialogue change @e[family=human,tag=salvacorazones] salvacorazones_final_a @p
execute as @a[tag=simon_ok,tag=rcp_ok,tag=heimlich_ok,tag=parkour_ok,tag=dea_ok,tag=!final_ok] run tag @a add final_ok

# DEAs restantes
execute if score @p deas matches 1 run scoreboard players set var dea_placed 4
execute if score @p deas matches 2 run scoreboard players set var dea_placed 3
execute if score @p deas matches 3 run scoreboard players set var dea_placed 2
execute if score @p deas matches 4 run scoreboard players set var dea_placed 1
execute if score @p deas matches 5 run scoreboard players set var dea_placed 0