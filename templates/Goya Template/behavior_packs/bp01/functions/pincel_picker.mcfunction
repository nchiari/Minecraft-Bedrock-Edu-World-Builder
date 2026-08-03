## Función que cambia el pincel picker en base al color que se quiera recoger
function clear_pinceles
replaceitem entity @p slot.weapon.mainhand 0 let:pincel_red 1 0 {"minecraft:item_lock":{ "mode": "lock_in_slot" }}

