## Función que se ejecuta en tick y chequea el estado de los scores para cambiar cosas del mundo

## Va en tick.json

########
# Intro
########

execute if entity @e[tag=pablo,x=-651,y=-3,z=-193,r=3] as @p run event entity @e[family=pincel_display] pincel:sparkles
execute if entity @e[tag=pablo,x=-651,y=-3,z=-193,r=3] as @p run setblock -633 -3 -203 light_block ["block_light_level"=6]
execute if entity @e[tag=pablo,x=-651,y=-3,z=-193,r=3] as @p run fill -639 -3 -196 -643 -3 -196 minecraft:border_block
execute if entity @e[tag=pablo,x=-651,y=-3,z=-193,r=3] as @p run scoreboard players set var tooltips 2
execute if entity @e[tag=pablo,x=-651,y=-3,z=-193,r=3] as @p run inputpermission set @a movement enabled
execute if entity @e[tag=pablo,x=-651,y=-3,z=-193,r=3] as @e[tag=pablo] run tp @s -639 -13 -193

########
## Museo Goya
########

## Este controla lo que sucede una vez hablas con los 3 personajes apenas aparecen
execute if score var personajesInit matches 3 run dialogue change @e[tag=goya] goya_09 @a
execute if score var personajesInit matches 3 run event entity @e[tag=goya] chat_on
execute if score var personajesInit matches 3 run scoreboard players set var tooltips 100
execute if score var personajesInit matches 3 run scoreboard players set var personajesInit 99

## Este controla lo que sucede una vez que los 3 personajes fueron devueltos a sus cuadros
execute if score var personajesEnd matches 3 run dialogue change @e[tag=goya] goya_16 @a
execute if score var personajesEnd matches 3 run event entity @e[tag=goya] chat_on
execute if score var personajesEnd matches 3 run titleraw @a title {"rawtext":[{"translate":"completado.title","with":{"rawtext":[{"text":"\n"}]}}]}
execute if score var personajesEnd matches 3 run scoreboard players set var tooltips 100
execute if score var personajesEnd matches 3 run scoreboard players set var personajesEnd 99

## Este tracker va moviendo al monstruo de un punto a otro. Primer punto:
#execute if score var batTracker matches 1 run inputpermission set @p movement disabled
#execute if score var batTracker matches 1 run summon let:dummy_marker -659 2 -151
#execute if score var batTracker matches 1 run summon let:dummy_marker -646 2 -151
#execute if score var batTracker matches 1 run scoreboard players set var batTracker 2
#execute if entity @e[tag=bat,x=-646,y=2,z=-151,r=3] if score var batTracker matches 2 run tp @e[tag=bat] -646 1 -151 facing -654 -1 -150
#execute if entity @e[tag=bat,x=-646,y=2,z=-151,r=3] if score var batTracker matches 2 run inputpermission set @a movement enabled
#execute if entity @e[tag=bat,x=-646,y=2,z=-151,r=3] if score var batTracker matches 2 run scoreboard players set var batTracker 99

## Este tracker va moviendo al monstruo de un punto a otro. Segundo punto:
execute if score var batTracker matches 3 run inputpermission set @p movement disabled
execute if score var batTracker matches 3 run summon let:dummy_marker -640 1 -151
execute if score var batTracker matches 3 run summon let:dummy_marker -634 1 -164
execute if score var batTracker matches 3 run scoreboard players set var batTracker 4
execute if entity @e[tag=bat,x=-634,y=2,z=-164,r=3] if score var batTracker matches 4 run tp @e[tag=bat] -634 1 -164 facing -634 -1 -159
execute if entity @e[tag=bat,x=-634,y=2,z=-164,r=3] if score var batTracker matches 4 run inputpermission set @a movement enabled
execute if entity @e[tag=bat,x=-634,y=2,z=-164,r=3] if score var batTracker matches 4 run scoreboard players set var batTracker 99

########
## Zaragoza
########

execute if score var genteZaragoza matches 3 run dialogue change @e[tag=goya] goya_19_b @a
execute if score var genteZaragoza matches 3 run event entity @e[tag=goya] chat_on
execute if score var genteZaragoza matches 3 run event entity @e[tag=pedestrian] chat_off
execute if score var genteZaragoza matches 3 run dialogue change @e[name=José] jose_b @a
execute if score var genteZaragoza matches 3 run dialogue change @e[name=Isabel] isabel_b @a
execute if score var genteZaragoza matches 3 run dialogue change @e[name=Sara] sara_b @a
execute if score var genteZaragoza matches 3 run dialogue change @e[name=Manuel] manuel_b @a
execute if score var genteZaragoza matches 3 run dialogue change @e[name=Remedios] remedios_b @a
execute if score var genteZaragoza matches 3 run dialogue change @e[name=Alejandro] alejandro_b @a
execute if score var genteZaragoza matches 3 run scoreboard players set var tooltips 100
execute if score var genteZaragoza matches 3 run scoreboard players set var genteZaragoza 99

execute as @p[hasitem={item=let:pincel_red,quantity=1}] if score var tooltips matches 12 run dialogue change @e[tag=goya] goya_21 @a
execute as @p[hasitem={item=let:pincel_red,quantity=1}] if score var tooltips matches 12 run dialogue open @e[tag=goya] @p goya_21
execute as @p[hasitem={item=let:pincel_red,quantity=1}] if score var tooltips matches 12 run event entity @e[tag=goya] chat_on
execute as @p[hasitem={item=let:pincel_red,quantity=1}] if score var tooltips matches 12 run scoreboard players set var tooltips 100

execute as @p[hasitem={item=let:pincel_picker,quantity=1}] if score var tooltips matches 14 run dialogue change @e[tag=goya] goya_23 @a
execute as @p[hasitem={item=let:pincel_picker,quantity=1}] if score var tooltips matches 14 run event entity @e[tag=goya] chat_on
execute as @p[hasitem={item=let:pincel_picker,quantity=1}] if score var tooltips matches 14 run scoreboard players set var tooltips 100

execute if score var edificios matches 3 run titleraw @a title {"rawtext":[{"translate":"completado.title","with":{"rawtext":[{"text":"\n"}]}}]}
execute if score var edificios matches 3 run event entity @e[tag=goya] chat_on
execute if score var edificios matches 3 run dialogue change @e[tag=goya] goya_24_0 @a
execute if score var edificios matches 3 run dialogue open @e[tag=goya] @p goya_24_0
execute if score var edificios matches 3 run scoreboard players set var tooltips 100
execute if score var edificios matches 3 run scoreboard players set var edificios 99

########
## Basílica
########

execute if score var angeles matches 3 run titleraw @a title {"rawtext":[{"translate":"completado.title","with":{"rawtext":[{"text":"\n"}]}}]}
execute if score var angeles matches 3 run dialogue change @e[tag=angel_ezequiel] angel_ezequiel_04 @a
execute if score var angeles matches 3 run event entity @e[tag=angel_ezequiel] chat_on
execute if score var angeles matches 3 run scoreboard players set var tooltips 19
execute if score var angeles matches 3 run scoreboard players set var angeles 99


########
## Fuendetodos
########

execute if score var fuendetodos matches 3 run setblock 18 -59 -620 redstone_block
execute if score var fuendetodos matches 3 run scoreboard players set var tooltips 24
execute if score var fuendetodos matches 3 run scoreboard players set var fuendetodos 99

execute if score var memorias matches 3 run titleraw @a title {"rawtext":[{"translate":"completado.title","with":{"rawtext":[{"text":"\n"}]}}]}
execute if score var memorias matches 3 run dialogue change @e[tag=goya] goya_39 @a
execute if score var memorias matches 3 run event entity @e[tag=goya] skin_1
execute if score var memorias matches 3 run event entity @e[tag=goya] chat_on
execute if score var memorias matches 3 run scoreboard players set var tooltips 100
execute if score var memorias matches 3 run scoreboard players set var memorias 99


## Mata todos los tiles del bloque "nube" al romper ese bloque
kill @e[type=item,name=Nubes]