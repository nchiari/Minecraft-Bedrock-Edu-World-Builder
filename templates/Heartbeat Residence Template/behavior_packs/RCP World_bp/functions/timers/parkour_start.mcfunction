## tracking
lesson @p activity cpr.parkour.start restart

stopsound @a
setblock 56 68 281 redstone_block
spawnpoint @initiator 50 70 282
dialogue change @e[family=human,tag=parkourNPC] parkourNPC_timer @a
fill 47 70 280 47 70 282 border_block