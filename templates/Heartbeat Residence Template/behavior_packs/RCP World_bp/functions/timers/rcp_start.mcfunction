## tracking
lesson @p activity cpr.rcp.start restart

stopsound @a
setblock 8 68 362 redstone_block
dialogue change @e[family=human,tag=rcpNPC] rcpNPC_asegurar @a
setblock 15 70 368 iron_door ["direction"=3,"open_bit"=false]
setblock 16 70 368 iron_door ["direction"=2,"open_bit"=true]