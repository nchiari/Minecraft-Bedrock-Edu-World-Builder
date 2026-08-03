scoreboard objectives add active dummy
scoreboard objectives add ticks dummy

scoreboard players add var ticks 1
scoreboard players add var active 0

execute if score var active matches 1 if score var ticks matches 20 run function countdown
execute if score var ticks matches 20 run scoreboard players set var ticks 0