execute if score var active matches 1 run scoreboard players add var musica 1
execute if score var musica matches 1340 run playsound 8bitbg @p
execute if score var musica matches 1340 run scoreboard players set var musica 0

execute if score var active matches 0 run scoreboard players set var musica 0
execute if score var active matches 0 run stopsound @a 8bitbg
execute if score var active matches 0 run setblock -112 68 352 air
execute if score var active matches 0 run setblock -89 67 233 air