# Minecraft Bedrock/Edu World Builder

Web app estatica para GitHub Pages que:

- recibe 1 archivo `.mcworld`
- recibe uno o varios `.mcpack` y/o `.mcaddon`
- inserta los packs dentro de `behavior_packs/` y `resource_packs/` usando carpetas `bpX` / `rpX`
- actualiza `world_behavior_packs.json` y `world_resource_packs.json`
- corrige `dependencies` cuando detecta el pack complementario en la misma compilacion
- genera y descarga un nuevo `*_compiled.mcworld`

Todo el procesamiento ocurre en el navegador del usuario.

## Estructura del proyecto

```text
.
├─ index.html
├─ assets/
│  ├─ css/
│  │  └─ styles.css
│  └─ js/
│     ├─ app.js
│     └─ i18n.js
└─ Ejemplos/
   └─ (archivos de referencia)
```

## Reglas implementadas

- Si `behavior_packs` o `resource_packs` no existen en el `.mcworld`, se crean.
- Si `world_behavior_packs.json` o `world_resource_packs.json` no existen, se crean como `[]`.
- Si hay cualquier pack invalido (sin `manifest.json`, JSON roto, sin tipo compatible, etc.), se cancela toda la compilacion.
- Si un pack nuevo repite `header.uuid` de un pack ya presente en el mundo, ese pack se omite.
- Se conserva lo que ya trae el `.mcworld`; solo se agrega lo nuevo.

## Limites recomendados (configurables)

En `assets/js/app.js`:

- `maxWorldBytes`: 150 MB
- `maxPacksBytes`: 100 MB (suma total)

## Despliegue en GitHub Pages

1. Sube estos archivos a un repositorio.
2. En GitHub: `Settings` -> `Pages`.
3. En `Build and deployment`, selecciona:
   - `Source`: `Deploy from a branch`
   - `Branch`: la rama principal y carpeta `/ (root)`
4. Guarda.
5. GitHub publicara la app en una URL tipo:
   - `https://TU-USUARIO.github.io/TU-REPO/`

## Personalizacion de marca

Si luego compartes tu branding (colores/fuentes/logo), se adapta desde:

- variables CSS en `assets/css/styles.css` (`:root`)
- textos en `assets/js/i18n.js`
