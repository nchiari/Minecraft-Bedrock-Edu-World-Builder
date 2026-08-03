## Función que se ejecuta con un comando escondido detrás del cuadro cuando el personaje llega a la zona en cuestión

event entity @e[tag=felix] chase:off
particle minecraft:crop_growth_area_emitter -656 -3 -209
dialogue change @e[tag=felix] felix_05 @a
event entity @e[tag=felix] chat_on
setblock -657 -3 -211 air

dialogue change @e[tag=nina] felix_cuadro @a
dialogue change @e[tag=luisa] felix_cuadro @a

scoreboard players set var tooltips 51