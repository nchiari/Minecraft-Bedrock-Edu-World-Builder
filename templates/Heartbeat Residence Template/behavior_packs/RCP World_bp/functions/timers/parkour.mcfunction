fill 53 67 285 54 67 285 redstone_block
tag @p add parkour
scoreboard objectives add seconds dummy
scoreboard objectives add minutes dummy
scoreboard players reset var minutes
scoreboard players reset var seconds
scoreboard players set var minutes 5
scoreboard players set var seconds 01
scoreboard players set var active 1
playsound race @p
setblock 53 68 279 redstone_block
dialogue change @e[tag=parkour1] parkour1 @a
dialogue change @e[tag=parkour2] parkour2 @a
dialogue change @e[tag=parkour3] parkour3 @a
dialogue change @e[tag=parkour4] parkour4 @a
dialogue change @e[tag=parkour5] parkour5 @a