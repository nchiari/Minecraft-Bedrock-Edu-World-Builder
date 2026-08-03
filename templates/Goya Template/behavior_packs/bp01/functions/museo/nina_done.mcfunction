## Función que se ejecuta con un comando escondido detrás del cuadro cuando el personaje llega a la zona en cuestión

event entity @e[tag=nina] chase:off
particle minecraft:crop_growth_area_emitter -658 -3 -188
dialogue change @e[tag=nina] nina_05 @a
event entity @e[tag=nina] chat_on
setblock -657 -3 -186 air

dialogue change @e[tag=felix] nina_cuadro @a
dialogue change @e[tag=luisa] nina_cuadro @a

scoreboard players set var tooltips 53