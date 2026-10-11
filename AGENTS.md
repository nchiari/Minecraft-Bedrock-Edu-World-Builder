# Minecraft World Builder — guía para agentes

## Qué es este proyecto

Aplicación web estática para preparar, convertir, revisar y modificar mundos de Minecraft Bedrock y Minecraft Education. El repositorio se llama `Minecraft-Bedrock-Edu-World-Builder`, aunque la carpeta local todavía se llama `Minecraft Compilator`.

- Producción: https://nchiari.github.io/Minecraft-Bedrock-Edu-World-Builder/
- Rama de publicación actual: `main`
- No hay backend: todos los mundos y packs se procesan localmente en el navegador.
- Los archivos originales nunca se modifican; cada operación genera una descarga nueva.
- El objetivo estable actual de Minecraft Bedrock / Education es `1.26.30` (`26.30`).

La aplicación ofrece cuatro herramientas independientes:

1. **Compilador de mundos**: añade `.mcpack`, `.mcaddon` o carpetas de packs a un `.mcworld` y exporta `*_compiled.mcworld`.
2. **Creador de plantillas**: convierte un `.mcworld` en una `.mctemplate` localizada.
3. **Inspector y reparador**: detecta problemas en packs, manifests, referencias, dependencias, limpieza y compatibilidad, y exporta `*_repaired.mcworld`.
4. **Editor de experimentos**: lee y reescribe el NBT little-endian de `level.dat`, conserva flags desconocidos y exporta `*_experiments.mcworld`.

Las herramientas deben seguir separadas en la interfaz. Una feature nueva con flujo propio debe tener su propio selector, workspace, estado y hash; no debe incrustarse dentro del compilador salvo que el usuario lo pida expresamente.

## Arquitectura

No hay build step, framework, servidor ni gestor de paquetes. Es HTML, CSS y JavaScript ES modules:

- `index.html`: estructura, selectores de herramientas, workspaces, modales y carga de dependencias CDN.
- `assets/css/styles.css`: estilos compartidos y responsive.
- `assets/js/app.js`: arranque, navegación por hash, idioma y flujo del compilador.
- `assets/js/template.js`: análisis y creación de `.mctemplate`.
- `assets/js/inspector.js`: análisis, selección de correcciones y exportación reparada.
- `assets/js/experiments.js`: lectura/escritura de `level.dat` y UI de experimentos.
- `assets/js/pack-utils.js`: utilidades compartidas para rutas, packs, limpieza y versiones.
- `assets/js/i18n.js`: todo el texto visible en español e inglés.
- `README.md`: contrato funcional y documentación pública; actualizarlo cuando cambie el comportamiento de cara al usuario.
- `templates/`: fixtures y mundos de referencia versionados. Pueden ser grandes y contienen proyectos reales; no editarlos ni borrarlos salvo que la tarea los requiera.
- `examples/`, `.tmp-test/` y `.playwright-cli/`: material local/de prueba ignorado por Git. No incorporarlo ni borrarlo salvo pedido explícito.

Dependencias de runtime actuales:

- JSZip `3.10.1`, cargado como global desde jsDelivr.
- nbtify `2.2.0`, importado como ESM desde jsDelivr únicamente por el editor de experimentos.

Los hashes públicos vigentes son:

- compilador: sin hash o hash no reconocido;
- plantilla: `#template-creator`;
- inspector: `#world-inspector`;
- experimentos: `#experiments-editor`.

## Contratos que se deben preservar

### Procesamiento y privacidad

- Todo el procesamiento debe permanecer en el navegador. No subir mundos, packs ni NBT a servicios externos.
- Validar entradas antes de generar salidas y detener la operación completa si un pack cargado es inválido.
- Límite de `.mcworld`: 150 MB. Límite total de packs del compilador: 100 MB.
- Mantener los originales intactos y entregar siempre un archivo nuevo descargable.
- Normalizar rutas ZIP con `/`, contemplar diferencias de mayúsculas/minúsculas al buscar archivos conocidos y no permitir que rutas externas escapen de su raíz lógica.

### Compilador y UUID de packs

- El usuario puede reemplazar o conservar los packs ya embebidos en el mundo.
- Los packs duplicados por UUID se omiten.
- La regeneración de UUID está activada por defecto y abarca packs nuevos y packs embebidos conservados.
- Al regenerar, actualizar de forma coherente:
  - `header.uuid` y los UUID de `modules` en cada `manifest.json`;
  - dependencias internas que apunten a esos packs;
  - `world_behavior_packs.json` y `world_resource_packs.json`.
- Conservar versiones, dependencias de módulos de Script API y dependencias de packs externos. No reinterpretarlas como referencias internas.
- Los checkboxes relacionados del compilador comparten una única caja visual `.option-box`.

### Plantillas

- Preservar el contenido del mundo.
- Renombrar packs embebidos secuencialmente como `bp0`, `bp1`, `rp0`, `rp1`, etc.
- Generar UUID nuevos para la plantilla y producir el `manifest.json` raíz y los archivos `texts` localizados requeridos.
- Detectar idiomas desde los resource packs y mantener los límites de 30 caracteres para el nombre y 200 para la descripción.
- La limpieza de archivos no admitidos, carpetas con punto y carpetas vacías se limita a los behavior/resource packs embebidos.

### Inspector

- El análisis es de solo lectura. Las correcciones se aplican a una copia exportada.
- Las limpiezas seguras y reparaciones deterministas pueden venir seleccionadas por defecto; cambios con riesgo de compatibilidad deben seguir siendo opcionales.
- No subir mecánicamente `format_version`. El formato correcto depende del tipo de asset y cambiar solo el número puede invalidar o alterar el contenido.
- Para estructuras Bedrock nuevas o dudosas, consultar primero los vanilla packs `1.26.30`:
  - `C:\Dev MC\🍦 Vanilla Packs\Vanilla BP 1.26.30`
  - `C:\Dev MC\🍦 Vanilla Packs\Vanilla RP 1.26.30`

### Editor de experimentos

- `level.dat` es NBT Bedrock little-endian; leerlo y escribirlo explícitamente con ese endian.
- El catálogo visible apunta a Minecraft `1.26.30`.
- Preservar flags desconocidos para compatibilidad futura.
- Mostrar flags legacy únicamente cuando ya existen en el mundo y conservarlos mientras sigan seleccionados.
- Conservar correctamente los metadatos `experiments_ever_used` y `saved_with_toggled_experiments`.
- No presentar la desactivación de experimentos como segura: Minecraft no la admite oficialmente y puede dañar contenido experimental.
- Antes de cambiar el catálogo, verificar las notas oficiales de la versión objetivo; no copiar sin más un catálogo de terceros potencialmente desactualizado.

## Localización e interfaz

- Todo texto visible debe vivir en `assets/js/i18n.js`, con claves equivalentes en `I18N.es` e `I18N.en`.
- No dejar claves de traducción renderizadas como texto. Comprobar tanto la paridad de claves como el valor mostrado cuando el cambio afecte la UI.
- Mantener los atributos `data-i18n`, `data-i18n-placeholder`, labels, estados `aria-*`, regiones `aria-live`, navegación de teclado y devolución de foco de los modales.
- El idioma elegido se conserva en `localStorage` bajo `world-builder-language`.
- Al cambiar de idioma, refrescar textos derivados, estados, análisis y campos ya renderizados, no solo el HTML estático.
- Conservar el comportamiento responsive. No hacer una comprobación visual o de navegador por defecto; realizarla si el cambio afecta significativamente layout/interacción o si el usuario la pide.
- Si una actualización publicada parece servir CSS, JS o traducciones antiguas, actualizar de manera coherente los query strings de cache busting de `styles.css`, `app.js` y los imports internos afectados.

## Forma de trabajar

1. Antes de editar, leer el archivo implicado, `git status --short` y el diff relevante. El árbol puede contener trabajo local del usuario.
2. Hacer cambios estrechos y coherentes con el patrón existente. Reutilizar `pack-utils.js` para lógica compartida en lugar de duplicarla.
3. No migrar manifests, `format_version`, dependencias ni scripts solo porque el target sea `1.26.30`; hacerlo únicamente cuando el pedido lo requiera.
4. Si se necesita Script API para una feature nueva, el objetivo estable es `@minecraft/server` `2.8.0` y `@minecraft/server-ui` `2.1.0`. Consultar la documentación versionada de `1.26.30` y las notas oficiales `1.26.0`, `1.26.10`, `1.26.20` y `1.26.30`.
5. No editar archivos no relacionados, no limpiar artefactos ajenos y no sobrescribir cambios locales.
6. Por autorización permanente del usuario, al completar y validar los cambios pedidos en este proyecto, hacer commit y push automáticamente a la rama de trabajo, sin pedir confirmación adicional, salvo que el usuario indique lo contrario. Revisar primero el estado y el diff e incluir todos los cambios pendientes intencionales; excluir archivos personales, pruebas locales y trabajo ajeno no relacionado. Si el push requiere resolver divergencias o conflictos, preservar los cambios locales y no usar force push.
7. Mantener `README.md` sincronizado cuando cambien herramientas, límites, formatos aceptados, nombres de salida, defaults o advertencias relevantes.

## Validación mínima proporcional

No existe una suite automatizada ni un `package.json`. Usar la comprobación más pequeña que cubra el cambio:

- JavaScript editado: `node --check <archivo>`.
- Cambios generales: `git diff --check` y revisión focalizada de `git diff`.
- Traducciones: verificar que ES y EN tengan exactamente las mismas claves y que cada `data-i18n`/`t(...)` nuevo exista.
- HTML/UI: comprobar correspondencia entre IDs, selectores, `aria-controls` y el workspace asociado.
- ZIP/packs/UUID: probar las combinaciones afectadas y revisar manifests, dependencias y referencias dentro del ZIP generado.
- NBT/experimentos: hacer round trip con un mundo real (abrir, modificar, exportar y reabrir) cuando cambie la serialización.
- Cambios de riesgo alto: conservar archivos originales de prueba y comparar contenido no relacionado antes/después.

No afirmar que algo funciona dentro de Minecraft solo por pasar análisis estático. Distinguir entre validación de estructura/navegador y prueba real en Minecraft Education o Bedrock.

## Prueba multi-instancia

Cuando el usuario escriba exactamente `IDENTIFICATE`, responder únicamente con el nombre indicado en `identidad-codex.txt`.
