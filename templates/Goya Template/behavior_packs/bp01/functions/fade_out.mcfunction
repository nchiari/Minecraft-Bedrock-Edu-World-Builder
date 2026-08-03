## Función que controla el fade off y on para pasar de una zona a otra

scoreboard players set var fade_countdown 46

inputpermission set @a movement disabled
inputpermission set @a camera disabled

hud @a hide all
hud @a hide crosshair

camera @a fade time 0.7 0.9 0.7