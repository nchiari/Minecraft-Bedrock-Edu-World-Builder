# Minecraft Bedrock/Edu World Builder

Live app: https://nchiari.github.io/Minecraft-Bedrock-Edu-World-Builder/

This tool creates a new `.mcworld` file that already includes the `.mcpack` / `.mcaddon` files you want to use.

It is useful when you want to share one world file that works without asking other users to install packs separately.

## What This Tool Does

- Takes one base `.mcworld` file
- Takes one or more `.mcpack` and/or `.mcaddon` files
- Merges valid packs into the world
- Generates a new downloadable file: `*_compiled.mcworld`

## How to Use

1. Upload your base `.mcworld` file.
2. Upload your `.mcpack` and/or `.mcaddon` files.
3. Click **Create new .mcworld**.
4. When processing finishes, click **Download .mcworld**.

## Important Notes

- If any uploaded pack is invalid, the tool stops and shows an error.
- Existing content already present in your world is preserved.
- Duplicate packs (same UUID) are skipped.

## File Size Limits

- `.mcworld`: up to **150 MB**
- Total `.mcpack` + `.mcaddon`: up to **100 MB**

## Privacy

All processing happens in your browser.
Your files are not uploaded to any server.
