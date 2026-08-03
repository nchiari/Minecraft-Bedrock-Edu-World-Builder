## Función que se ejecuta con un comando escondido detrás del cuadro cuando el personaje llega a la zona en cuestión

event entity @e[tag=luisa] chase:off
particle minecraft:crop_growth_area_emitter -667 -3 -194
dialogue change @e[tag=luisa] luisa_05 @a
event entity @e[tag=luisa] chat_on
setblock -666 -3 -192 air

dialogue change @e[tag=felix] luisa_cuadro @a
dialogue change @e[tag=nina] luisa_cuadro @a

scoreboard players set var tooltips 52