## Función que controla la secuencia del monstruo cuando se escapa

## Habilitar lo de abajo solo para testeo
#kill @e[tag=bat]
#kill @e[family=dummy_marker]
#summon let:monster_bat -632 2 -180 facing -635 0 -180
#tag @e[family=monster_bat] add bat
#event entity @e[tag=bat] marker_on
#event entity @e[tag=bat] look_off

## Habilitar de aquí hacia abajo la versión final

inputpermission set @a movement disabled
inputpermission set @a camera disabled
hud @a hide all
hud @a hide crosshair

fill -635 -1 -179 -635 2 -181 air

#event entity @e[tag=bat] look_off
tp @e[tag=bat] -632 2 -180 facing -635 0 -180
camera @a set minecraft:free pos -646 1 -179 facing -639 -7 -186
playanimation @s animation.goya_monster.run

#summon let:dummy_marker -635 0 -180
#summon let:dummy_marker -641 -5 -183
##summon let:dummy_marker -641 -9 -189
#summon let:dummy_marker -640 -9 -187
#summon let:dummy_marker -641 -9 -199