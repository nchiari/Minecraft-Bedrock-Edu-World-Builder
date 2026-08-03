export const ALLOWED_PACK_EXTENSIONS = new Set([
  "fontdata",
  "fragment",
  "fsb",
  "glsl",
  "hdr",
  "hlsl",
  "jpeg",
  "jpg",
  "js",
  "json",
  "lang",
  "material",
  "mcfunction",
  "ogg",
  "otf",
  "png",
  "tga",
  "ttf",
  "vertex"
]);

export function normalizePath(path) {
  return String(path)
    .replace(/\\/g, "/")
    .split("/")
    .filter((part) => part && part !== "." && part !== "..")
    .join("/");
}

export function fileExtension(path) {
  const leaf = normalizePath(path).split("/").pop() || "";
  const dot = leaf.lastIndexOf(".");
  return dot > 0 && dot < leaf.length - 1 ? leaf.slice(dot + 1).toLowerCase() : "";
}

export function packPrefix(type) {
  return type === "behavior" ? "behavior_packs" : "resource_packs";
}

export function parsePackPath(path) {
  const parts = normalizePath(path).split("/");
  const first = parts[0]?.toLowerCase();
  if ((first !== "behavior_packs" && first !== "resource_packs") || !parts[1]) {
    return null;
  }
  return {
    type: first === "behavior_packs" ? "behavior" : "resource",
    root: parts[1],
    rest: parts.slice(2).join("/")
  };
}

export function isPackPath(path) {
  return Boolean(parsePackPath(path));
}

export function isAllowedPackFile(path) {
  return ALLOWED_PACK_EXTENSIONS.has(fileExtension(path));
}

export function findHiddenPackFolder(path, pathIsDirectory = false) {
  const parts = normalizePath(path).split("/");
  const lastFolderIndex = pathIsDirectory ? parts.length - 1 : parts.length - 2;
  for (let index = 1; index <= lastFolderIndex; index += 1) {
    if (parts[index]?.startsWith(".")) {
      return parts.slice(0, index + 1).join("/");
    }
  }
  return null;
}

export function analyzePackRemovals(entries) {
  const packEntries = entries
    .map((entry) => ({ entry, path: normalizePath(entry.name) }))
    .filter((item) => item.path && isPackPath(item.path));

  const allowedFiles = packEntries
    .filter((item) => !item.entry.dir && !findHiddenPackFolder(item.path) && isAllowedPackFile(item.path))
    .map((item) => item.path);

  const seeds = [];
  for (const item of packEntries) {
    const hiddenFolder = findHiddenPackFolder(item.path, item.entry.dir);
    if (hiddenFolder) {
      seeds.push({ path: hiddenFolder, type: "folder" });
      continue;
    }
    if (!item.entry.dir && !isAllowedPackFile(item.path)) {
      seeds.push({ path: item.path, type: "file" });
    }
  }

  const removals = new Map();
  for (const seed of seeds) {
    const seedParts = seed.path.split("/");
    const folderParts = seed.type === "folder" ? seedParts : seedParts.slice(0, -1);
    const firstCandidateLength = folderParts[1]?.startsWith(".") ? 2 : 3;
    let collapsedFolder = null;

    for (let length = firstCandidateLength; length <= folderParts.length; length += 1) {
      const candidate = folderParts.slice(0, length).join("/");
      const prefix = `${candidate.toLowerCase()}/`;
      const containsAllowedFile = allowedFiles.some((path) => path.toLowerCase().startsWith(prefix));
      if (!containsAllowedFile) {
        collapsedFolder = candidate;
        break;
      }
    }

    const removal = collapsedFolder ? { path: collapsedFolder, type: "folder" } : seed;
    removals.set(removal.path.toLowerCase(), removal);
  }

  const all = Array.from(removals.values());
  return all
    .filter((removal) => !all.some((parent) => (
      parent !== removal
      && parent.type === "folder"
      && removal.path.toLowerCase().startsWith(`${parent.path.toLowerCase()}/`)
    )))
    .sort((a, b) => a.path.localeCompare(b.path));
}

export function collectPackRoots(entries, type) {
  const prefix = `${packPrefix(type)}/`;
  const roots = new Map();
  for (const entry of entries) {
    const path = normalizePath(entry.name);
    if (!path.toLowerCase().startsWith(prefix)) {
      continue;
    }
    const root = path.slice(prefix.length).split("/")[0];
    if (root && !roots.has(root.toLowerCase())) {
      roots.set(root.toLowerCase(), root);
    }
  }
  return Array.from(roots.values()).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

export function findEntryCaseInsensitive(zip, wantedPath) {
  const wanted = normalizePath(wantedPath).toLowerCase();
  return Object.values(zip.files).find((entry) => normalizePath(entry.name).toLowerCase() === wanted) || null;
}

export function normalizeVersion(version) {
  if (!Array.isArray(version) || version.length === 0) {
    return null;
  }
  const normalized = version.slice(0, 3).map((value) => Number.parseInt(String(value), 10));
  if (normalized.some((value) => !Number.isFinite(value) || value < 0)) {
    return null;
  }
  while (normalized.length < 3) {
    normalized.push(0);
  }
  return normalized;
}

export function parseVersionString(version) {
  if (typeof version !== "string" && typeof version !== "number") {
    return null;
  }
  const parts = String(version).trim().split(".");
  if (parts.length < 1 || parts.length > 3 || parts.some((part) => !/^\d+$/.test(part))) {
    return null;
  }
  return normalizeVersion(parts);
}

export function compareVersions(a, b) {
  for (let index = 0; index < 3; index += 1) {
    const delta = (a[index] || 0) - (b[index] || 0);
    if (delta !== 0) {
      return delta < 0 ? -1 : 1;
    }
  }
  return 0;
}

export function maxVersion(a, b) {
  return compareVersions(a, b) >= 0 ? a : b;
}
