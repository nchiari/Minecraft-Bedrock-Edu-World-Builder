## Función que sirve para finalizar la mision de pintar los 4 edificios

## SOLO USAR PARA TESTING
tp @p -210 -57 -91
tp @e[tag=goya] -210 -57 -87

dialogue change @e[tag=goya] goya_24_0 @a

clear @a
function zaragoza/pinceles/picker

setblock -266 -57 -207 redstone_block
setblock -280 -57 -203 redstone_block
setblock -290 -57 -207 redstone_block
setblock -277 -57 -188 redstone_block

fill -242 -52 -166 -248 -47 -166 red_concrete replace let:ink_red
fill -200 -51 -154 -200 -44 -145 orange_concrete replace let:ink_orange
fill -219 -51 -116 -219 -45 -122 lime_concrete replace let:ink_green
fill -200 -50 -98 -200 -44 -86 purple_concrete replace let:ink_purple