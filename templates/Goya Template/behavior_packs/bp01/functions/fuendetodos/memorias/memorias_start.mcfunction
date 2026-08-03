## Función que inicia la secuencia de las memorias post la estatuilla

# Bloques que permiten interactuar con los objetos
fill -63 -55 -628 -63 -54 -628 let:leche_block
setblock -63 -47 -627 let:cofre_goya
fill -50 -46 -614 -49 -46 -611 let:cama_block

# Redstone block que pone partículas
# Leche
setblock -60 -57 -628 redstone_block
# Cofre
setblock -66 -47 -629 redstone_block
# Cama
setblock -52 -46 -608 redstone_block

############################
## A partir de acá es solo para el testing, comentar cuando no se use
############################

#tp @p -60 -54 -616
#event entity @e[tag=goya_test] let:despawn
#summon pix:human_goya Goya -61 -54 -612
#tag @e[x=-61,y=-54,z=-612,family=goya] add goya
#tag @e[x=-61,y=-54,z=-612,family=goya] add goya_test
## bloque estatua
#setblock -57 -53 -617 let:estatua_block
## particulas estatua
#setblock -56 -57 -615 redstone_block
#function clear_pinceles
#function fuendetodos/pincel_memorias
#scoreboard players set var tooltips 25
#dialogue change @e[tag=goya_test] goya_35_b @a
#gamemode a
#tag @e[tag=goya_test] list