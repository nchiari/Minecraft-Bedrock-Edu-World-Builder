# Minecraft World Tools

Live app: https://nchiari.github.io/Minecraft-Bedrock-Edu-World-Builder/

This browser-based app provides six tools for Minecraft Bedrock and Education:

- A tool for adding `.mcpack` / `.mcaddon` files or pack folders to a world and creating a new `.mcworld`.
- A world template creator that converts a `.mcworld` into a localized `.mctemplate`.
- A world inspector that finds pack, manifest, reference, dependency, cleanup, and version compatibility issues and can export a repaired `.mcworld`.
- An experiments editor that reads the Bedrock `level.dat`, enables or disables experiment flags, and exports a new `.mcworld`.
- An add-on merger that bundles `.mcpack` / `.mcaddon` files into one `.mcaddon`, with optional UUID regeneration enabled by default.
- A text generator for `rawtext`, `/tellraw`, `/titleraw` and localized `.lang` lines.

## Generate Texts and Commands

Open **Generate texts and commands** (`#localized-texts`). Choose `rawtext` JSON for a compatible dialogue field, `/tellraw` for chat, or `/titleraw` with `title`, `subtitle`, or `actionbar`. Commands accept a custom selector (default `@a`). Choose direct text or localized text, then write your message. Results update immediately; copy the JSON/command and, in localized mode, the `.lang` line separately.

Localized mode requires a nonempty key containing ASCII letters, digits, dots, underscores, hyphens or colons, such as `dialogue.welcome`. Paste the generated line into the resource pack's `texts/<language>.lang` file for each supported language, retaining the key and translating its value. Line breaks become `%1` in `.lang` and the JSON supplies a newline substitution. Formatting codes, quotes and backslashes are preserved through JSON serialization. Empty text or an invalid key disables copying and clears the generated output. This tool prepares localization; it does not translate text, create packs or modify worlds.

The interface uses the shared ES/EN language preference without changing your content, preserves inputs when switching tools, and includes reset and manual copy support if clipboard access fails. Adapted from [Minecraft-Localized-Texts](https://github.com/nchiari/Minecraft-Localized-Texts), source revision `d1679f5f6c58a23d1bee89a6889b3bc71c9f4f8a`.

## Merge Add-ons

Open **Merge add-ons** (`#addon-merger`) and add one or more `.mcpack` / `.mcaddon` files, up to 100 MB total. Files can be added repeatedly and removed individually. Create and download `*_merged.mcaddon`, containing separate `.mcpack` archives. Both nested `.mcpack` archives and packs stored directly in `.mcaddon` folders are supported.

**Generate new UUIDs for all packs** is enabled by default. It regenerates every included pack header and module UUID and updates dependencies between included packs. Versions, Script API dependencies, external pack dependencies, and other pack files remain unchanged. Uncheck it to preserve original manifests and UUIDs. Identical duplicate packs are skipped; different contents with the same UUID stop the operation so you can remove the unwanted input. Invalid packs stop the whole operation.

Packs remain independent: bundling does not resolve content conflicts or guarantee that add-ons work together. Import the archive into Minecraft, then activate the packs in your world. Successful creation clears inputs and resets the option while retaining the download and pack summary. Failed attempts retain inputs and any previous download.

## Add Packs to a World

- Takes one base `.mcworld` file
- Takes one or more `.mcpack` / `.mcaddon` files and separate Behavior Pack / Resource Pack folders. Files can be added repeatedly; each attached file, folder, or world has a red × to remove it.
- Merges valid packs into the world
- Generates new header and module UUIDs for all packs in the resulting world by default, including retained packs, and updates matching pack dependencies and world references. Uncheck **Generate new pack UUIDs** to keep the existing UUID behavior. Script module dependencies, external pack dependencies, and versions remain unchanged when generating UUIDs.
- Generates a new downloadable file: `*_compiled.mcworld`

## How to Use

1. Choose your `.mcworld` file.
2. Choose your `.mcpack` / `.mcaddon` files, separate BP/RP folders, or both. Use **Add more files** to keep adding pack files.
3. Click **Create .mcworld**.
4. When processing finishes, the view moves to **Download .mcworld** and focuses the button. Uploaded inputs and options reset for a new world, while the generated download stays available. If processing fails, inputs are kept for retry.

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
- The experiments editor targets the experiment catalog in Minecraft 1.26.30, preserves unknown flags for forward compatibility, and exposes legacy flags only when they already exist in the selected world.
- Disabling experiments is unsupported by Minecraft and may damage experimental content. Keep the original world as a backup.

## File Size Limits

- `.mcworld`: up to **150 MB**
- Total `.mcpack` + `.mcaddon`: up to **100 MB**

## Privacy

All processing happens in your browser.
Your files are not uploaded to any server.
