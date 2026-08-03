# Rojo - 1
# Bloque de comandos para que se escuche el sonido: function simon_music/red
execute if score var color matches 1 run titleraw @p title { "rawtext": [ { "translate" : "simon.title.rojo" } ] }
execute if score var color matches 1 run setblock -65 67 233 red_wool

# Verde - 2
# Bloque de comandos para que se escuche el sonido: function simon_music/green
execute if score var color matches 2 run titleraw @p title { "rawtext": [ { "translate" : "simon.title.verde" } ] }
execute if score var color matches 2 run setblock -65 67 233 green_wool

# Morado - 3
# Bloque de comandos para que se escuche el sonido: function simon_music/purple
execute if score var color matches 3 run titleraw @p title { "rawtext": [ { "translate" : "simon.title.morado" } ] }
execute if score var color matches 3 run setblock -65 67 233 purple_wool

# Amarillo - 4
# Bloque de comandos para que se escuche el sonido: function simon_music/yellow
execute if score var color matches 4 run titleraw @p title { "rawtext": [ { "translate" : "simon.title.amarillo" } ] }
execute if score var color matches 4 run setblock -65 67 233 yellow_wool

# Azul (DEA) - 4
# Bloque de comandos para que se escuche el sonido: function simon_music/blue
execute if score var color matches 5 run titleraw @p title { "rawtext": [ { "translate" : "simon.title.azul" } ] }
execute if score var color matches 5 run setblock -65 67 233 blue_wool

# Resets
execute if score var color matches 1..5 run scoreboard players set var color 0

execute if score var colormix matches 1 run titleraw @p title { "rawtext": [ { "translate" : "simon.title.rojo2" } ] }
execute if score var colormix matches 2 run titleraw @p title { "rawtext": [ { "translate" : "simon.title.rojo3" } ] }
execute if score var colormix matches 3 run titleraw @p title { "rawtext": [ { "translate" : "simon.title.rojo4" } ] }
execute if score var colormix matches 1..3 run setblock -65 67 233 red_wool

execute if score var colormix matches 4 run titleraw @p title { "rawtext": [ { "translate" : "simon.title.verde2" } ] }
execute if score var colormix matches 5 run titleraw @p title { "rawtext": [ { "translate" : "simon.title.verde3" } ] }
execute if score var colormix matches 6 run titleraw @p title { "rawtext": [ { "translate" : "simon.title.verde4" } ] }
execute if score var colormix matches 4..6 run setblock -65 67 233 green_wool

execute if score var colormix matches 7 run titleraw @p title { "rawtext": [ { "translate" : "simon.title.morado2" } ] }
execute if score var colormix matches 8 run titleraw @p title { "rawtext": [ { "translate" : "simon.title.morado3" } ] }
execute if score var colormix matches 9 run titleraw @p title { "rawtext": [ { "translate" : "simon.title.morado4" } ] }
execute if score var colormix matches 7..9 run setblock -65 67 233 purple_wool

execute if score var colormix matches 10 run titleraw @p title { "rawtext": [ { "translate" : "simon.title.amarillo2" } ] }
execute if score var colormix matches 11 run titleraw @p title { "rawtext": [ { "translate" : "simon.title.amarillo3" } ] }
execute if score var colormix matches 12 run titleraw @p title { "rawtext": [ { "translate" : "simon.title.amarillo4" } ] }
execute if score var colormix matches 10..12 run setblock -65 67 233 yellow_wool

# Resets
execute if score var colormix matches 1..12 run scoreboard players set var colormix 0