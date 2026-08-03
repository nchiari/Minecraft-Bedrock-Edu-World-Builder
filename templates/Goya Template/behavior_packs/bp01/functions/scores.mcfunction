## Crea los scoreboards
## Ejecutar una sola vez

scoreboard objectives add tooltips dummy
scoreboard objectives add exitMuseo_countdown dummy
scoreboard objectives add exitZaragoza_countdown dummy
scoreboard objectives add exitBasilica_countdown dummy
scoreboard objectives add apagon_countdown dummy
scoreboard objectives add fade_countdown dummy

## Mision 0: inicio hasta M1. Mision 1: museo goya. Mision 2: monstruos. Mision 3: pintar edificios. Mision 4: basilica. Mision 5: casa de goya
scoreboard objectives add misiones dummy
scoreboard objectives add intro dummy
scoreboard objectives add personajesInit dummy
scoreboard objectives add personajesEnd dummy
scoreboard objectives add batTracker dummy
scoreboard objectives add genteZaragoza dummy
scoreboard objectives add edificios dummy
scoreboard objectives add edificiosTracker dummy
scoreboard objectives add angeles dummy
scoreboard objectives add angelesTracker dummy
scoreboard objectives add fuendetodos dummy
scoreboard objectives add memorias dummy
scoreboard objectives add memoriasTracker dummy

## Setea los scoreboards a 0

scoreboard players set var misiones 0
scoreboard players set var exitMuseo_countdown 0
scoreboard players set var exitZaragoza_countdown 0
scoreboard players set var exitBasilica_countdown 0
scoreboard players set var apagon_countdown 0
scoreboard players set var fade_countdown 0
scoreboard players set var tooltips 0
scoreboard players set var intro 0
scoreboard players set var personajesInit 0
scoreboard players set var personajesEnd 0
scoreboard players set var batTracker 0
scoreboard players set var genteZaragoza 0
scoreboard players set var edificios 0
scoreboard players set var edificiosTracker 3
scoreboard players set var angeles 0
scoreboard players set var angelesTracker 3
scoreboard players set var fuendetodos 0
scoreboard players set var memorias 0
scoreboard players set var memoriasTracker 3