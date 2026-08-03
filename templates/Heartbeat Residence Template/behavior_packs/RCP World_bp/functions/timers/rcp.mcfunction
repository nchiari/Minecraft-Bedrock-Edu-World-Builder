tag @p add rcp
event entity @e[family=dummy] dummy_reset
clear @p let:comprobar
clear @p let:phone
clear @p let:manos_rcp
clear @p let:respiracion
clear @p let:dea_item_off
clear @p let:dea_item_on

playsound rcpbg @p

dialogue change @e[family=human,tag=rcpNPC] rcpNPC_asegurar @a
dialogue open @e[family=human,tag=rcpNPC] @p rcpNPC_asegurar

setblock 14 68 367 redstone_block
setblock 8 68 366 redstone_block