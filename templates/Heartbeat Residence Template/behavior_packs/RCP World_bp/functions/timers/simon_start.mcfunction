## tracking
lesson @p activity cpr.simon.start restart

stopsound @a
setblock -67 67 239 redstone_block
dialogue change @e[family=human,tag=simonNPC] simonNPC_timer @a
dialogue change @e[family=human,tag=dispenserNPC] school_playing @a
fill -87 69 248 -81 69 248 border_block