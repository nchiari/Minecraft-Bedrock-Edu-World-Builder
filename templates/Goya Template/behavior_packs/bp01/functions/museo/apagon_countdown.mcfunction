############
## Apagón
############

# Check if the timer exists and is greater than 0
execute if score var apagon_countdown matches 1.. run scoreboard players remove var apagon_countdown 1

# When the timer reaches 0, execute the second set of actions
execute if score var apagon_countdown matches 0 run dialogue change @e[tag=pablo] guia_pablo_3 @a
execute if score var apagon_countdown matches 0 run dialogue open @e[tag=pablo] @p guia_pablo_3
execute if score var apagon_countdown matches 0 run inputpermission set @a movement enabled

# Clean up the countdown when done
execute if score var apagon_countdown matches 0 run setblock -643 -14 -162 air