## Reinicia la posición y los diálogos iniciales de los NPC de Fuendetodos

worldbuilder

##########################
## Personajes principales
##########################

tp @a 27 -57 -609
kill @e[family=human,r=40]
kill @e[family=atril]
kill @e[family=items_goya]
kill @e[family=firmas_goya]

summon pix:human 33 -57 -609 ~~ skin_33 Camila
tag @e[family=human,name=Camila] add camila
summon pix:human 36 -52 -596 ~~ skin_29 Tomás
tag @e[family=human,name=Tomás] add tomas
summon pix:human 23 -57 -618 ~~ skin_27 Leandro
tag @e[family=human,name=Leandro] add leandro

summon let:firma_18x3 42 -51 -589
summon let:firma_6x3 56 -51 -589
summon let:firma_2x4 63 -52 -589

summon let:cama_goya -50 -46 -618 0 0 cama_goya_2
fill -50 -46 -617 -51 -46 -620 barrier

summon let:lechera -63 -55 -628
summon let:estatua -57 -53 -617 90
summon let:cama_goya -49 -46 -612

summon let:estatua -43 -54 -620 180
summon let:cama_goya -41 -55 -626 90
fill -42 -55 -626 -39 -55 -627 barrier
summon let:lechera -45 -55 -620

summon let:atril_goya -41 -55 -623 90

worldbuilder