
## Si es correcto
#execute if block -65 67 233 red_wool run titleraw @a title { "rawtext": [ { "translate" : "simon.title.correcto" } ] }
execute as @p[tag=simon] if block -65 67 233 red_wool run playsound note.chime @a ~~~ 2 1.7
execute as @p[tag=simon] if block -65 67 233 red_wool run scoreboard players add @p simon 1

## Si es incorrecto
#execute unless block -65 67 233 red_wool run titleraw @a title { "rawtext": [ { "translate" : "simon.title.incorrecto" } ] }
execute as @p[tag=simon] unless block -65 67 233 red_wool run playsound block.false_permissions @a ~~~ 2
execute as @p[tag=simon] unless block -65 67 233 red_wool run scoreboard players remove @p simon 1

setblock -65 67 233 air