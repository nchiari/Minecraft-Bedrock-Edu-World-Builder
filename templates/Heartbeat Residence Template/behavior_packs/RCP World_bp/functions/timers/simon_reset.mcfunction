## tracking
lesson @p activity cpr.simon.start restart

scoreboard players set var active 0
scoreboard players set var color 0
scoreboard players set var colormix 0
scoreboard players set @p simon 0
scoreboard players set var musica 0
tag @p remove simon

dialogue change @e[family=human,tag=simonNPC] simonNPC_start @a
dialogue change @e[family=human,tag=dispenserNPC] dispenserNPC_start @a

titleraw @a title { "rawtext": [ { "translate" : "timer.title.stopped" } ] }

fill -87 69 248 -81 69 248 air

setblock -67 67 233 air
setblock -67 67 235 air
setblock -64 67 229 air
setblock -65 67 233 air

## Ojos off
setblock -49 70 234 air

stopsound @a 8bitbg
scoreboard objectives setdisplay sidebar deas
