## Función que controla el fade off y on para pasar de una zona a otra

scoreboard players set var fade_countdown 48

inputpermission set @a movement disabled
inputpermission set @a camera disabled

hud @a hide all
hud @a hide crosshair

camera @a fade time 0.7 1 0.7