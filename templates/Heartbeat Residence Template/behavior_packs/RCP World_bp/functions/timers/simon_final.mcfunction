scoreboard players set var active 0
scoreboard players set var color 0
scoreboard players set var colormix 0

titleraw @a title { "rawtext": [ { "translate" : "timer.title.timeup" } ] }
titleraw @a subtitle {"rawtext":[{ "translate" : "timer.title.puntaje" },{"score":{"name":"@p","objective":"simon"}}]}

scoreboard players set var musica 0
tag @p remove simon
playsound tada @a

dialogue change @e[family=human,tag=simonNPC] simonNPC_final @a
dialogue change @e[family=human,tag=dispenserNPC] dispenserNPC_start @a

fill -87 69 248 -81 69 248 air

setblock -67 67 233 air
setblock -67 67 235 air
setblock -64 67 229 air
setblock -65 67 233 air

## Ojos off
setblock -49 70 234 air

stopsound @a 8bitbg
scoreboard objectives setdisplay sidebar deas

tag @p add simon_ok