## Reinicia la posición y los diálogos iniciales de los NPC

worldbuilder

##########################
## Personajes principales
##########################

tp @a -248 -51 -128
kill @e[family=human,r=80]
kill @e[family=bat,r=80]

summon pix:human -255 -57 -178 ~~ skin_9 Isabel
tag @e[family=human,name=Isabel] add pedestrian
summon pix:human -262 -57 -184 ~~ skin_10 José
tag @e[family=human,name=José] add pedestrian
summon pix:human -244 -57 -181 ~~ skin_11 Sara
tag @e[family=human,name=Sara] add pedestrian
summon pix:human -246 -57 -178 ~~ skin_13 Manuel
tag @e[family=human,name=Manuel] add pedestrian
summon pix:human -240 -57 -186 ~~ skin_12 Remedios
tag @e[family=human,name=Remedios] add pedestrian
summon pix:human -238 -57 -174 ~~ skin_15 Alejandro
tag @e[family=human,name=Alejandro] add pedestrian
summon pix:human -241 -57 -176 ~~ skin_14 Andrea
tag @e[family=human,name=Andrea] add pedestrian

summon pix:human -226 -57 -181 ~~ skin_16 Vicente
summon pix:human -206 -57 -175 ~~ skin_17 Marcos
summon pix:human -205 -57 -89 ~~ skin_20 Elena
summon pix:human -184 -57 -129 ~~ obrera Luisa 
summon pix:human -183 -57 -127 ~~ obrero Mario
summon pix:human -187 -57 -126 ~~ obrero Jaime
summon pix:human -253 -57 -128 ~~ skin_28 Fernando 
summon pix:human -259 -57 -119 ~~ skin_33 Daniela 
summon pix:human -207 -57 -149 ~~ skin_31 Carlos 
summon pix:human -212 -57 -116 ~~ skin_24 Victoria 
summon pix:human -211 -57 -188 ~~ skin_34 Marta
summon pix:human -208 -57 -188 ~~ skin_35 Borja 
summon pix:human -198 -57 -178 ~~ skin_37 Cristina  
summon pix:human -198 -57 -173 ~~ skin_18 Raúl
summon pix:human -276 -57 -134 ~~ skin_25 Gonzalo 
summon pix:human -207 -57 -153 ~~ skin_29 Mariano
summon pix:human -213 -57 -122 ~~ skin_36 Antonia
summon pix:human -205 -57 -95 ~~ skin_27 Emilio

summon pix:human -203 -58 -56 ~~ alumno_1 Leandro
summon pix:human -208 -57 -69 ~~ skin_30 Patricia
summon pix:human -214 -57 -77 ~~ alumno_4 Lorena
summon pix:human -215 -57 -65 ~~ alumno_2 Carmen

summon let:monster_bat -210 -58 -52 facing -210 -58 -54
tag @e[family=monster_bat,r=80] add bat
event entity @e[tag=bat,r=80] skin_1

summon pix:human -221 -58 -58 ~~ skin_32 Alberto
tag @e[family=human,name=Alberto] add alberto

tag @e[family=human,r=80] add zaragoza

worldbuilder