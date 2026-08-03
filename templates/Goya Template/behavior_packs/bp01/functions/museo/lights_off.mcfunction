## Función que apaga las luces del interior del museo

time set 18000

## Sala goya
clone -594 -3 -212 -623 -3 -202 -660 4 -208
setblock -637 1 -203 light_block ["block_light_level"=6]
setblock -654 1 -203 light_block ["block_light_level"=6]
## Sala niños
clone -655 8 -195 -661 8 -188 -661 2 -195
## Sala fondo
clone -665 9 -212 -669 8 -200 -669 3 -207

## Piso superior
clone -623 -4 -194 -602 -4 -174 -652 4 -194
## Piso inferior
clone -614 -10 -191 -626 -10 -179 -647 -7 -190

## Escaleras y grabados
clone -589 -6 -164 -622 -6 -145 -661 4 -170
setblock -638 -2 -165 light_block ["block_light_level"=6]
setblock -629 -2 -147 light_block ["block_light_level"=6]
setblock -649 -2 -147 light_block ["block_light_level"=6]
setblock -663 -2 -147 light_block ["block_light_level"=6]
setblock -663 -2 -170 light_block ["block_light_level"=6]
setblock -645 -8 -158 light_block ["block_light_level"=6]
setblock -642 -7 -160 light_block ["block_light_level"=6]
setblock -641 -4 -160 light_block ["block_light_level"=6]
setblock -646 -6 -156 light_block ["block_light_level"=6]
setblock -650 -5 -156 light_block ["block_light_level"=6]
setblock -650 -8 -158 light_block ["block_light_level"=6]
setblock -653 -5 -158 light_block ["block_light_level"=6]

setblock -657 -1 -166 light_block ["block_light_level"=6]
setblock -662 -1 -163 light_block ["block_light_level"=6]
setblock -656 -1 -158 light_block ["block_light_level"=6]
setblock -662 -1 -158 light_block ["block_light_level"=6]
setblock -662 -1 -152 light_block ["block_light_level"=6]
setblock -657 -1 -148 light_block ["block_light_level"=6]
setblock -648 -1 -148 light_block ["block_light_level"=6]
setblock -637 -1 -148 light_block ["block_light_level"=6]
setblock -638 -1 -158 light_block ["block_light_level"=6]
setblock -630 -1 -166 light_block ["block_light_level"=6]
setblock -630 -1 -159 light_block ["block_light_level"=6]
setblock -630 -1 -153 light_block ["block_light_level"=6]
setblock -637 -1 -166 light_block ["block_light_level"=6]
setblock -647 -1 -148 light_block ["block_light_level"=6]
setblock -662 -1 -151 light_block ["block_light_level"=6]
setblock -656 -1 -158 light_block ["block_light_level"=6]
setblock -662 -1 -164 light_block ["block_light_level"=6]
setblock -638 -1 -158 light_block ["block_light_level"=6]
setblock -638 -1 -158 light_block ["block_light_level"=6]
setblock -637 -1 -169 light_block ["block_light_level"=6]

## Salita luz
clone -655 6 -154 -668 6 -157 -668 4 -177

## Varios inferior
setblock -641 -7 -201 let:luz_techo_off ["minecraft:cardinal_direction"="south"]
setblock -655 -7 -176 let:luz_techo_off ["minecraft:cardinal_direction"="south"]
setblock -658 -7 -176 let:luz_techo_off ["minecraft:cardinal_direction"="south"]
setblock -661 -7 -176 let:luz_techo_off ["minecraft:cardinal_direction"="south"]
setblock -652 -7 -170 let:luz_techo_off ["minecraft:cardinal_direction"="east"]
setblock -648 -14 -166 light_block ["block_light_level"=6]

## Light dampen
fill -636 5 -179 -646 5 -189 let:light_dampen
fill -645 6 -188 -637 6 -180 let:light_dampen
fill -644 7 -187 -638 7 -181 let:light_dampen
fill -643 8 -186 -639 8 -182 let:light_dampen
fill -642 9 -185 -640 9 -183 let:light_dampen

## Debajo de los cuadros
setblock -634 -3 -209 light_block ["block_light_level"=6]
setblock -637 -3 -209 light_block ["block_light_level"=6]
setblock -641 -3 -209 light_block ["block_light_level"=6]
setblock -646 -3 -209 light_block ["block_light_level"=6]
setblock -651 -3 -209 light_block ["block_light_level"=6]
setblock -656 -3 -209 light_block ["block_light_level"=6]
setblock -634 -3 -198 light_block ["block_light_level"=6]
setblock -647 -3 -197 light_block ["block_light_level"=6]
setblock -650 -3 -197 light_block ["block_light_level"=6]
setblock -653 -3 -197 light_block ["block_light_level"=6]
setblock -655 -3 -193 light_block ["block_light_level"=6]
setblock -655 -3 -190 light_block ["block_light_level"=6]
setblock -661 -3 -190 light_block ["block_light_level"=6]
setblock -661 -3 -193 light_block ["block_light_level"=6]
setblock -658 -3 -188 light_block ["block_light_level"=6]
setblock -666 -3 -209 light_block ["block_light_level"=6] 
setblock -669 -3 -209 light_block ["block_light_level"=6]
setblock -671 -3 -204 light_block ["block_light_level"=6]
setblock -671 -3 -200 light_block ["block_light_level"=6]
setblock -667 -3 -194 light_block ["block_light_level"=6]

## Varios
setblock -650 -11 -159 light_block ["block_light_level"=6]
setblock -647 -11 -159 light_block ["block_light_level"=6]
setblock -647 -11 -159 light_block ["block_light_level"=6]
setblock -652 -10 -195 light_block ["block_light_level"=6]
setblock -652 -10 -173 light_block ["block_light_level"=6]
setblock -630 -10 -195 light_block ["block_light_level"=6]
setblock -630 -10 -173 light_block ["block_light_level"=6]
setblock -641 -8 -163 light_block ["block_light_level"=6]
setblock -653 -8 -163 light_block ["block_light_level"=6]
setblock -641 -4 -156 light_block ["block_light_level"=6]
setblock -653 -8 -156 light_block ["block_light_level"=6]
setblock -650 -4 -160 light_block ["block_light_level"=6]
setblock -641 -11 -198 light_block ["block_light_level"=6]
setblock -630 -10 -195 light_block ["block_light_level"=6]
setblock -630 -11 -188 light_block ["block_light_level"=6]
setblock -630 -11 -179 light_block ["block_light_level"=6]
setblock -630 -10 -173 light_block ["block_light_level"=6]
setblock -652 -10 -173 light_block ["block_light_level"=6]
setblock -652 -11 -183 light_block ["block_light_level"=6]
setblock -652 -10 -195 light_block ["block_light_level"=6]
setblock -648 -11 -190 light_block ["block_light_level"=6]
setblock -648 -11 -178 light_block ["block_light_level"=6]
setblock -645 -10 -171 light_block ["block_light_level"=6]
setblock -641 -8 -163 light_block ["block_light_level"=6]
setblock -653 -8 -163 light_block ["block_light_level"=6]
setblock -647 -6 -167 light_block ["block_light_level"=6]
setblock -649 -3 -169 light_block ["block_light_level"=6]
setblock -641 -4 -156 light_block ["block_light_level"=6]
setblock -650 -4 -160 light_block ["block_light_level"=6]
setblock -653 -8 -156 light_block ["block_light_level"=6]
setblock -653 0 -173 light_block ["block_light_level"=6]
setblock -653 -1 -180 light_block ["block_light_level"=6]
setblock -653 -1 -187 light_block ["block_light_level"=6]
setblock -653 0 -194 light_block ["block_light_level"=6]
setblock -648 -1 -195 light_block ["block_light_level"=6]
setblock -633 -1 -195 light_block ["block_light_level"=6]
setblock -653 0 -195 light_block ["block_light_level"=6]
setblock -630 -1 -189 light_block ["block_light_level"=6]
setblock -630 0 -183 light_block ["block_light_level"=6]
setblock -637 0 -173 light_block ["block_light_level"=6]
setblock -655 0 -173 light_block ["block_light_level"=6]
setblock -665 2 -178 light_block ["block_light_level"=6]
setblock -670 1 -175 light_block ["block_light_level"=6]
setblock -663 2 -170 light_block ["block_light_level"=6]
setblock -659 1 -161 light_block ["block_light_level"=6]
setblock -663 2 -156 light_block ["block_light_level"=6]
setblock -663 2 -147 light_block ["block_light_level"=6]
setblock -656 2 -147 light_block ["block_light_level"=6]
setblock -649 2 -147 light_block ["block_light_level"=6]
setblock -646 1 -154 light_block ["block_light_level"=6]
setblock -634 -1 -151 light_block ["block_light_level"=6]
setblock -629 2 -147 light_block ["block_light_level"=6]
setblock -629 2 -155 light_block ["block_light_level"=6]
setblock -633 -1 -161 light_block ["block_light_level"=6]
setblock -629 2 -162 light_block ["block_light_level"=6]
setblock -638 2 -165 light_block ["block_light_level"=6]
setblock -629 2 -170 light_block ["block_light_level"=6]
setblock -637 1 -203 light_block ["block_light_level"=6]
setblock -633 -1 -208 light_block ["block_light_level"=6]
setblock -642 -1 -208 light_block ["block_light_level"=6]
setblock -638 2 -147 light_block ["block_light_level"=6]
setblock -656 2 -170 light_block ["block_light_level"=6]
setblock -647 -1 -208 light_block ["block_light_level"=6]
setblock -654 -1 -208 light_block ["block_light_level"=6]
setblock -660 -1 -208 light_block ["block_light_level"=6]
setblock -660 -1 -198 light_block ["block_light_level"=6]
setblock -652 -1 -198 light_block ["block_light_level"=6]
setblock -647 -1 -198 light_block ["block_light_level"=6]
setblock -634 -1 -198 light_block ["block_light_level"=6]
setblock -630 -1 -203 light_block ["block_light_level"=6]
setblock -637 1 -203 light_block ["block_light_level"=6]
setblock -645 1 -203 light_block ["block_light_level"=6]
setblock -654 1 -203 light_block ["block_light_level"=6]
setblock -667 0 -197 light_block ["block_light_level"=6]
setblock -667 0 -201 light_block ["block_light_level"=6]
setblock -667 0 -204 light_block ["block_light_level"=6]
setblock -658 0 -192 light_block ["block_light_level"=6]
setblock -648 -3 -163 light_block ["block_light_level"=6]
setblock -632 -3 -204 light_block ["block_light_level"=6]
setblock -632 -3 -202 light_block ["block_light_level"=6]
setblock -663 -3 -195 light_block ["block_light_level"=6]
setblock -671 -3 -195 light_block ["block_light_level"=6]
setblock -671 -3 -209 light_block ["block_light_level"=6]
setblock -663 -3 -209 light_block ["block_light_level"=6]

## Luz al lado de la caja de fusibles
setblock -664 0 -178 light_block ["block_light_level"=6]

## Recuperar piso grabados
setblock -663 -2 -170 gray_concrete
setblock -638 -2 -165 gray_concrete
setblock -629 -2 -147 gray_concrete
setblock -649 -2 -147 gray_concrete
setblock -663 -2 -147 gray_concrete

## Inicia la secuencia de la misión
event entity @e[family=fusibles] panel_off
function dialogos/diag_lights_off
tp @e[tag=alfonso] -645 -14 -190
tp @e[tag=jero] -636 -14 -188
tp @e[tag=cecilia] -648 -14 -174
tp @e[tag=monica] -643 -8 -163