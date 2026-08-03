## Función que hace aparecer a los personajes de los cuadros y continua la narrativa
## Se ejecuta desde el dialogo goya_08

summon pix:human_felix -633 -3 -198 ~~ skin_0 "Félix de Azara"
tag @e[family=felix,name="Félix de Azara"] add felix
summon pix:human_felix -635 -3 -198 ~~ skin_1 "María Luisa de Parma"
tag @e[family=felix,name="María Luisa de Parma"] add luisa
summon pix:human_felix -637 -3 -198 ~~ skin_2 Niña
tag @e[family=felix,name=Niña] add nina

setblock -635 -3 -199 light_block ["block_light_level"=3]

dialogue change @e[tag=felix] felix_01 @a
dialogue change @e[tag=luisa] luisa_01 @a
dialogue change @e[tag=nina] nina_01 @a

event entity @e[family=felix] chat_on