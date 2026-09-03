# Minecraft World Builder

Live app: https://nchiari.github.io/Minecraft-Bedrock-Edu-World-Builder/

This browser-based app provides three tools for Minecraft Bedrock and Education:

- A tool for adding `.mcpack` / `.mcaddon` files or pack folders to a world and creating a new `.mcworld`.
- A world template creator that converts a `.mcworld` into a localized `.mctemplate`.
- A world inspector that finds pack, manifest, reference, dependency, cleanup, and version compatibility issues and can export a repaired `.mcworld`.

## Add Packs to a World

- Takes one base `.mcworld` file
- Takes one or more `.mcpack` / `.mcaddon` files, pack folders, or a folder containing multiple packs
- Merges valid packs into the world
- Generates new header and module UUIDs for all packs in the resulting world by default, including retained packs, and updates matching pack dependencies and world references. Uncheck **Generate new pack UUIDs** to keep the existing UUID behavior. Script module dependencies, external pack dependencies, and versions remain unchanged when generating UUIDs.
- Generates a new downloadable file: `*_compiled.mcworld`

## How to Use

1. Choose your `.mcworld` file.
2. Choose your `.mcpack` / `.mcaddon` files, pack folders, or both.
3. Click **Create .mcworld**.
4. When processing finishes, click **Download .mcworld**.

## Create a World Template

1. Choose a `.mcworld` file.
2. Review the detected packs, languages, folder renames, base game version, and files that will be removed.
3. Enter one or more comma-separated authors.
4. Complete the World name (up to 30 characters) and World description (up to 200 characters) for every language detected in the resource packs.
5. Click **Create .mctemplate**, then download the generated file.

The creator preserves the world contents, renames embedded pack folders to `bp0`, `bp1`, `rp0`, `rp1`, and so on, generates new template UUIDs, and adds the root `manifest.json` and localized `texts` files required by a world template.

## Inspect and Repair a World

1. Choose a `.mcworld` file. Analysis starts automatically.
2. Review findings grouped by cleanup, manifests, references and dependencies, and version compatibility.
3. Select the fixes you want to apply. Safe cleanup and deterministic reference/version fixes are selected by default; changes that may affect compatibility remain optional.
4. Create and download a new `*_repaired.mcworld` file.

The inspector can remove unsupported pack files and dot-prefixed or empty folders, validate pack manifests and JSON, repair deterministic world references and dependency versions, and identify `format_version` values newer than their pack's `min_engine_version`. It does not blindly rewrite definition format versions because changing only the number can make content invalid or alter behavior.

## Important Notes

- If any uploaded pack is invalid, the tool stops and shows an error.
- The add-packs tool can either replace or preserve existing embedded packs.
- Duplicate packs (same UUID) are skipped.
- The template creator removes unsupported files and dot-prefixed folders only from embedded behavior and resource packs. Folders left without valid files are omitted, and complete folder removals are reported once instead of listing every contained file.

## File Size Limits

- `.mcworld`: up to **150 MB**
- Total `.mcpack` + `.mcaddon`: up to **100 MB**

## Privacy

All processing happens in your browser.
Your files are not uploaded to any server.
