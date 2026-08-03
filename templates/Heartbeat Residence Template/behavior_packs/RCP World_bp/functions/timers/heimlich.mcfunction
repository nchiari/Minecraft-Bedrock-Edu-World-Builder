tag @p add heimlich
scoreboard objectives add seconds dummy
scoreboard objectives add minutes dummy
scoreboard players reset var minutes
scoreboard players reset var seconds
scoreboard players set var minutes 1
scoreboard players set var seconds 31
scoreboard players set var active 1
scoreboard objectives setdisplay sidebar heimlich
scoreboard players set @p heimlich 0
scoreboard players set var heimlichRandom 0
playsound 8bitbg @p
give @p let:toser
give @p let:manos_palmadas
give @p let:manos_heimlich
setblock -113 68 358 redstone_block
setblock -112 68 352 redstone_block