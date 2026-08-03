# Check if the timer exists and is greater than 0
execute if score var fade_countdown matches 1.. run scoreboard players remove var fade_countdown 1

# When the timer reaches 0, execute the second set of actions
execute if score var fade_countdown matches 0 run inputpermission set @a camera enabled
execute if score var fade_countdown matches 0 run inputpermission set @a movement enabled
execute if score var fade_countdown matches 0 run hud @a reset

# Clean up the countdown when done
execute if score var fade_countdown matches 0 run scoreboard players reset var fade_countdown
