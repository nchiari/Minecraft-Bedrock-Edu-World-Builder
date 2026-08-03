## Función que inicia la secuencia de los grabados

## Esto va en command block en el mundo:
tp @e[tag=goya] -658 -1 -168

fill -662 -1 -171 -660 -1 -171 border_block
fill -632 -1 -171 -630 -1 -171 border_block

dialogue change @e[tag=goya] goya_17 @a
event entity @e[tag=goya] stay
setblock -662 -3 -165 redstone_block