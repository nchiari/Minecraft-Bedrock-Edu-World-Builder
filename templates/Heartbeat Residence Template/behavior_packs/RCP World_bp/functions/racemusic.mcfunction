execute if score var active matches 1 run scoreboard players add var musica 1
execute if score var musica matches 860 run playsound race @p
execute if score var musica matches 860 run scoreboard players set var musica 0

execute if score var active matches 0 run scoreboard players set var musica 0
execute if score var active matches 0 run stopsound @p race