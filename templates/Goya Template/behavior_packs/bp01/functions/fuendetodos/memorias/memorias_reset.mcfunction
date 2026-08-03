## Resetea las memorias

tag @e[tag=goya] remove memoria_cama
tag @e[tag=goya] remove memoria_cofre
tag @e[tag=goya] remove memoria_leche

dialogue change @e[tag=goya] goya_memorias @a
event entity @e[tag=goya] chat_off

function clear_pinceles
replaceitem entity @p slot.weapon.mainhand 0 let:pincel_picker 1 0 {"minecraft:can_destroy":{"blocks":["let:estatua_block","let:cama_block","let:leche_block","let:cofre_goya"]},"minecraft:item_lock":{ "mode": "lock_in_slot" }}