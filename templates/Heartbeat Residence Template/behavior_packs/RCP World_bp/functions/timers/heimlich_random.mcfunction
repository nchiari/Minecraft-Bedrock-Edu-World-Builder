execute if score var minutes matches 1 if score var seconds matches 29 run scoreboard players random var heimlichRandom 1 3
execute if score var minutes matches 1 if score var seconds matches 25 run scoreboard players random var heimlichRandom 1 3
execute if score var minutes matches 1 if score var seconds matches 21 run scoreboard players random var heimlichRandom 1 3
execute if score var minutes matches 1 if score var seconds matches 17 run scoreboard players random var heimlichRandom 1 3
execute if score var minutes matches 1 if score var seconds matches 13 run scoreboard players random var heimlichRandom 1 3
execute if score var minutes matches 1 if score var seconds matches 9 run scoreboard players random var heimlichRandom 1 3
execute if score var minutes matches 1 if score var seconds matches 5 run scoreboard players random var heimlichRandom 1 3
execute if score var minutes matches 1 if score var seconds matches 1 run scoreboard players random var heimlichRandom 1 3

# Pausa
execute if score var minutes matches 0 if score var seconds matches 58 run scoreboard players random var heimlichRandom 1 3
execute if score var minutes matches 0 if score var seconds matches 55 run scoreboard players random var heimlichRandom 1 3
execute if score var minutes matches 0 if score var seconds matches 52 run scoreboard players random var heimlichRandom 1 3
execute if score var minutes matches 0 if score var seconds matches 49 run scoreboard players random var heimlichRandom 1 3
execute if score var minutes matches 0 if score var seconds matches 46 run scoreboard players random var heimlichRandom 1 3
execute if score var minutes matches 0 if score var seconds matches 43 run scoreboard players random var heimlichRandom 1 3
execute if score var minutes matches 0 if score var seconds matches 40 run scoreboard players random var heimlichRandom 1 3
execute if score var minutes matches 0 if score var seconds matches 37 run scoreboard players random var heimlichRandom 1 3
execute if score var minutes matches 0 if score var seconds matches 34 run scoreboard players random var heimlichRandom 1 3
execute if score var minutes matches 0 if score var seconds matches 31 run scoreboard players random var heimlichRandom 1 3

# Pausa
execute if score var minutes matches 0 if score var seconds matches 27 run scoreboard players random var heimlichRandom 1 3
execute if score var minutes matches 0 if score var seconds matches 25 run scoreboard players random var heimlichRandom 1 3
execute if score var minutes matches 0 if score var seconds matches 23 run scoreboard players random var heimlichRandom 1 3
execute if score var minutes matches 0 if score var seconds matches 21 run scoreboard players random var heimlichRandom 1 3
execute if score var minutes matches 0 if score var seconds matches 19 run scoreboard players random var heimlichRandom 1 3
execute if score var minutes matches 0 if score var seconds matches 17 run scoreboard players random var heimlichRandom 1 3
execute if score var minutes matches 0 if score var seconds matches 15 run scoreboard players random var heimlichRandom 1 3
execute if score var minutes matches 0 if score var seconds matches 13 run scoreboard players random var heimlichRandom 1 3
execute if score var minutes matches 0 if score var seconds matches 11 run scoreboard players random var heimlichRandom 1 3
# Faster
execute if score var minutes matches 0 if score var seconds matches 10 run scoreboard players random var heimlichRandom 1 3
execute if score var minutes matches 0 if score var seconds matches 9 run scoreboard players random var heimlichRandom 1 3
execute if score var minutes matches 0 if score var seconds matches 8 run scoreboard players random var heimlichRandom 1 3
execute if score var minutes matches 0 if score var seconds matches 7 run scoreboard players random var heimlichRandom 1 3
execute if score var minutes matches 0 if score var seconds matches 6 run scoreboard players random var heimlichRandom 1 3
execute if score var minutes matches 0 if score var seconds matches 5 run scoreboard players random var heimlichRandom 1 3
execute if score var minutes matches 0 if score var seconds matches 4 run scoreboard players random var heimlichRandom 1 3
execute if score var minutes matches 0 if score var seconds matches 3 run scoreboard players random var heimlichRandom 1 3

execute if score var heimlichRandom matches 1 run event entity @r[type=!player,tag=!sick,x=-123,dx=12,y=70,dy=2,z=355,dz=14,c=1] dummy_sick
execute if score var heimlichRandom matches 1 run scoreboard players set var heimlichRandom 0

execute if score var heimlichRandom matches 2 run event entity @r[type=!player,tag=!sick,x=-123,dx=12,y=70,dy=2,z=355,dz=14,c=1] dummy_sick2
execute if score var heimlichRandom matches 2 run scoreboard players set var heimlichRandom 0

execute if score var heimlichRandom matches 3 run event entity @r[type=!player,tag=!sick,x=-123,dx=12,y=70,dy=2,z=355,dz=14,c=1] dummy_sick3
execute if score var heimlichRandom matches 3 run scoreboard players set var heimlichRandom 0