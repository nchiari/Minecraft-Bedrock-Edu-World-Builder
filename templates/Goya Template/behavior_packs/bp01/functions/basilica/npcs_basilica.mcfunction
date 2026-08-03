## Reinicia la posición y los diálogos iniciales de los NPC

worldbuilder

##########################
## Personajes principales
##########################

tp @a -768 -56 -185
kill @e[family=angel]
kill @e[family=human,tag=zacarias]
kill @e[family=item_angel]
kill @e[family=estatuas_iglesia]

summon pix:human -779 -56 -190 ~~ skin_38 "Padre Zacarías"
tag @e[family=human,name="Padre Zacarías"] add zacarias

summon let:angel -768 -53 -179 ~~ skin_0 "Ángel Ezequiel"
tag @e[family=angel,name="Ángel Ezequiel"] add angel_ezequiel

summon let:angel -739 -54 -123 ~~ skin_1 "Ángel Músico"
tag @e[family=angel,name="Ángel Músico"] add angel_musico
summon let:angel -742 -55 -179 ~~ skin_2 "Ángel Explorador"
tag @e[family=angel,name="Ángel Explorador"] add angel_explorador
summon let:angel -778 -55 -142 ~~ skin_3 "Ángel Glotón"
tag @e[family=angel,name="Ángel Glotón"] add angel_gloton

summon let:pilarica -700 -48 -108 135
summon let:santiago -807 -48 -64 -90
summon let:crucifijo -804 -53 -186 -45
summon let:apostoles -700 -48 -137 45

summon let:arpa -698 -40 -123
summon let:pergamino -735 -42 -154
summon let:uvas -781 -41 -166

worldbuilder