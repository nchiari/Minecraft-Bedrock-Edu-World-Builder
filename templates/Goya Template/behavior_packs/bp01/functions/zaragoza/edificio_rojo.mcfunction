## Función que se activa en bloque de comandos cuando se pinta el 1er edificio (rojo) 
## tp -269 -57 -209

particle let:sparks_edificios -245 -50 -167
titleraw @a title {"rawtext":[{"translate":"edificio_rojo.title","with":{"rawtext":[{"text":"\n"}]}}]}
event entity @e[tag=goya] chat_on
dialogue change @e[tag=goya] goya_22 @a
setblock -266 -57 -207 air
scoreboard players set var tooltips 100