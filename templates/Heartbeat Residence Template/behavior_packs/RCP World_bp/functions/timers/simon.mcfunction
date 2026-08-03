tag @p add simon
scoreboard objectives add seconds dummy
scoreboard objectives add minutes dummy
scoreboard players reset var minutes
scoreboard players reset var seconds
scoreboard players set var minutes 1
scoreboard players set var seconds 01
scoreboard players set var active 1
scoreboard objectives setdisplay sidebar simon
scoreboard players set @p simon 0
playsound 8bitbg @p
setblock -67 67 233 redstone_block
setblock -64 67 229 redstone_block

## Ojos on
setblock -49 70 234 redstone_wire
setblock -49 70 238 redstone_block