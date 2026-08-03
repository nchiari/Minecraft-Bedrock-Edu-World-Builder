scoreboard players set var musica 0
clear @p let:comprobar
clear @p let:phone
clear @p let:manos_rcp
clear @p let:respiracion
clear @p let:dea_item_off
clear @p let:dea_item_on

stopsound @a rcpbg

tp @e[family=human,tag=tecnico112] 13 70 372 facing @p
dialogue change @e[family=human,tag=tecnico112] emergencia_help @p
dialogue open @e[family=human,tag=tecnico112] @p emergencia_help

setblock 8 68 366 air
setblock 14 68 367 air
setblock 17 68 370 air

setblock 15 70 368 iron_door ["direction"=3,"open_bit"=true]
setblock 16 70 368 iron_door ["direction"=2,"open_bit"=false]

fill 17 70 377 15 70 377 air

scoreboard players set @p rcp_help 4

testfor @p[scores={rcp_help=2..},x=17,y=70,z=378,dx=-3,dy=1]

tag @p remove rcp_help