const MAX_WORLD_ICON_BYTES = 10 * 1024 * 1024;
const MAX_WORLD_ICON_PIXELS = 16_000_000;

export class WorldIconError extends Error {
  constructor(key, t) {
    super(t(key));
    this.key = key;
  }
}

export function validateWorldIconFile(file, t) {
  if (!/\.(png|jpe?g)$/i.test(file.name)) {
    throw new WorldIconError("worldIcon.errorFormat", t);
  }
  if (file.size > MAX_WORLD_ICON_BYTES) {
    throw new WorldIconError("worldIcon.errorSize", t);
  }
}

// Encode the pixels as JPEG; changing only the extension would leave PNG data.
export async function convertWorldIcon(file, t) {
  validateWorldIconFile(file, t);
  const signature = new Uint8Array(await file.slice(0, 8).arrayBuffer());
  const isPng = [137, 80, 78, 71, 13, 10, 26, 10].every((byte, index) => signature[index] === byte);
  const isJpeg = signature[0] === 255 && signature[1] === 216 && signature[2] === 255;
  if (!isPng && !isJpeg) {
    throw new WorldIconError("worldIcon.errorRead", t);
  }

  const url = URL.createObjectURL(file);
  const canvas = document.createElement("canvas");
  try {
    const image = new Image();
    image.src = url;
    try {
      await image.decode();
    } catch {
      throw new WorldIconError("worldIcon.errorRead", t);
    }
    const width = image.naturalWidth;
    const height = image.naturalHeight;
    if (!width || !height || width * height > MAX_WORLD_ICON_PIXELS) {
      throw new WorldIconError("worldIcon.errorDimensions", t);
    }
    canvas.width = 800;
    canvas.height = 450;
    const context = canvas.getContext("2d");
    if (!context) {
      throw new WorldIconError("worldIcon.errorConvert", t);
    }
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    const scale = Math.min(canvas.width / width, canvas.height / height);
    const drawWidth = width * scale;
    const drawHeight = height * scale;
    context.imageSmoothingQuality = "high";
    context.drawImage(image, (canvas.width - drawWidth) / 2, (canvas.height - drawHeight) / 2, drawWidth, drawHeight);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.95));
    // Some browsers fall back to PNG when an encoder is unavailable.
    if (!blob || blob.size === 0 || blob.type !== "image/jpeg") {
      throw new WorldIconError("worldIcon.errorConvert", t);
    }
    return new Uint8Array(await blob.arrayBuffer());
  } finally {
    URL.revokeObjectURL(url);
    canvas.width = 0;
    canvas.height = 0;
  }
}
