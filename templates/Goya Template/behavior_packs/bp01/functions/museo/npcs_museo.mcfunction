## Reinicia la posición y los diálogos iniciales de los NPC del Museo

worldbuilder

##########################
## Personajes principales
##########################

tp @a -641 -4 -182
kill @e[family=human,r=50]
kill @e[family=laptop,r=40]
kill @e[family=display_grabado]
kill @e[family=fusibles]

## Inferior
summon pix:human -631 -14 -182 ~~ guia_2 "Guía Joaquín"
tag @e[name="Guía Joaquín"] add guia
tag @e[name="Guía Joaquín"] add joaquin
summon pix:human -651 -14 -178 ~~ guia_1 "Guía Luis"
tag @e[name="Guía Luis"] add guia
tag @e[name="Guía Luis"] add luis
summon pix:human -642 -14 -182 ~~ guia_3 "Guía Sandra"
tag @e[name="Guía Sandra"] add guia
tag @e[name="Guía Sandra"] add sandra
summon pix:human -648 -8 -163 ~~ alumno_2 Beatriz
summon pix:human -637 -14 -178 ~~ alumno_4 Lucía
summon pix:human -648 -14 -188 ~~ skin_29 Nicolás

## Grabados
summon pix:human -648 -1 -152 ~~ guia_3 "Guía Mónica"
tag @e[name="Guía Mónica"] add guia
tag @e[name="Guía Mónica"] add monica
summon pix:human -658 -1 -165 ~~ alumno_1 Jero
tag @e[name=Jero] add jero
summon pix:human -660 -1 -153 ~~ skin_12 Cecilia
tag @e[name=Cecilia] add cecilia
summon pix:human -634 -1 -168 ~~ skin_10 Alfonso
tag @e[name=Alfonso] add alfonso

## Mecánico
summon pix:human -664 -1 -175 ~~ obrero Antonio
tag @e[name=Antonio] add mecanico

## Superior
summon pix:human -651 -3 -176 ~~ guia_1 "Guía Roberto"
tag @e[name="Guía Roberto"] add guia
tag @e[name="Guía Roberto"] add roberto
summon pix:human -648 -3 -194 ~~ alumno_4 Alicia
summon pix:human -638 -3 -177 ~~ skin_30 María
summon pix:human -632 -3 -195 ~~ skin_13 Eduardo
summon pix:human -652 -3 -186 ~~ skin_12 Raquel

## Sala Goya
summon pix:human -633 -3 -201 ~~ guia_2 "Guía Pablo"
tag @e[name="Guía Pablo"] add guia
tag @e[name="Guía Pablo"] add pablo

tag @e[tag=!guia,tag=!mecanico,family=human,r=40] add visitante

summon let:laptop -632 -13 -181 -90
summon let:tv -652 -11 -186 270
summon let:tv -635 -11 -173 180

summon let:display_grabado -647 -1 -147
summon let:fusibles -665 0 -178

worldbuilder