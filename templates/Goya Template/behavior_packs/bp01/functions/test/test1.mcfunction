## Función que sirve para iniciar la misión de llevar a los 3 personajes a sus cuadros

## SOLO USAR PARA TESTING
function init

tp @p -634 -3 -203

function museo/lights_off
function dialogos/diag_lights_off


tp @e[tag=pablo] -639 -13 -193

event entity @e[family=pincel_display] pincel:off_test

function museo/aparicion_goya