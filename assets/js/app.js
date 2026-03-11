import { I18N } from "./i18n.js";

const MB = 1024 * 1024;
const LIMITS = {
  maxWorldBytes: 150 * MB,
  maxPacksBytes: 100 * MB
};

const state = {
  lang: detectInitialLang(),
  worldFile: null,
  packFiles: [],
  busy: false,
  generatedBlob: null,
  generatedName: ""
};

const nodes = {
  worldInput: document.getElementById("world-input"),
  packsInput: document.getElementById("packs-input"),
  worldPickerBtn: document.getElementById("world-picker-btn"),
  packsPickerBtn: document.getElementById("packs-picker-btn"),
  worldPickerText: document.getElementById("world-picker-text"),
  packsPickerText: document.getElementById("packs-picker-text"),
  worldInfo: document.getElementById("world-file-info"),
  packsInfo: document.getElementById("packs-file-info"),
  limitsCopy: document.getElementById("limits-copy"),
  compileBtn: document.getElementById("compile-btn"),
  resetBtn: document.getElementById("reset-btn"),
  downloadBtn: document.getElementById("download-btn"),
  downloadBox: document.getElementById("download-box"),
  downloadNote: document.getElementById("download-note"),
  howtoOpen: document.getElementById("howto-open"),
  howtoClose: document.getElementById("howto-close"),
  howtoModal: document.getElementById("howto-modal"),
  howtoOverlay: document.getElementById("howto-overlay"),
  statusSummary: document.getElementById("status-summary"),
  statusLog: document.getElementById("status-log"),
  langButtons: Array.from(document.querySelectorAll(".lang-btn"))
};

init();

function init() {
  if (!globalThis.JSZip) {
    setStatus("error", t("error.jszipMissing"));
    return;
  }

  bindEvents();
  applyI18n();
  refreshSelectedFiles();
  updateActionState();
  setStatus("idle", t("status.idle"));
}

function bindEvents() {
  nodes.worldPickerBtn.addEventListener("click", () => {
    nodes.worldInput.click();
  });

  nodes.worldInput.addEventListener("change", () => {
    state.worldFile = nodes.worldInput.files && nodes.worldInput.files[0] ? nodes.worldInput.files[0] : null;
    clearGeneratedOutput();
    refreshSelectedFiles();
    updateActionState();
  });

  nodes.packsPickerBtn.addEventListener("click", () => {
    nodes.packsInput.click();
  });

  nodes.packsInput.addEventListener("change", () => {
    const newFiles = nodes.packsInput.files ? Array.from(nodes.packsInput.files) : [];
    state.packFiles = mergePackFiles(state.packFiles, newFiles);
    nodes.packsInput.value = "";
    clearGeneratedOutput();
    refreshSelectedFiles();
    updateActionState();
  });

  nodes.compileBtn.addEventListener("click", () => {
    void compileWorld();
  });

  nodes.resetBtn.addEventListener("click", () => {
    resetForm();
  });

  nodes.downloadBtn.addEventListener("click", () => {
    if (!state.generatedBlob || !state.generatedName) {
      return;
    }
    downloadBlob(state.generatedBlob, state.generatedName);
  });

  nodes.howtoOpen.addEventListener("click", () => {
    showHowtoModal();
  });
  nodes.howtoClose.addEventListener("click", () => {
    hideHowtoModal();
  });
  nodes.howtoOverlay.addEventListener("click", () => {
    hideHowtoModal();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      hideHowtoModal();
    }
  });

  for (const button of nodes.langButtons) {
    button.addEventListener("click", () => {
      const lang = ["en", "es", "ja"].includes(button.dataset.lang) ? button.dataset.lang : "en";
      state.lang = lang;
      applyI18n();
      refreshSelectedFiles();
      updateActionState();
    });
  }
}

function detectInitialLang() {
  return "en";
}

function t(key, vars = {}) {
  const langTable = I18N[state.lang] || I18N.es;
  const fallback = I18N.en[key] || key;
  const text = langTable[key] || fallback;
  return text.replace(/\{(\w+)\}/g, (_, token) => {
    return Object.prototype.hasOwnProperty.call(vars, token) ? String(vars[token]) : `{${token}}`;
  });
}

function applyI18n() {
  document.documentElement.lang = state.lang;
  for (const el of document.querySelectorAll("[data-i18n]")) {
    const key = el.getAttribute("data-i18n");
    if (!key) {
      continue;
    }
    el.textContent = t(key);
  }

  nodes.limitsCopy.textContent = t("limits.body", {
    worldMb: LIMITS.maxWorldBytes / MB,
    packsMb: LIMITS.maxPacksBytes / MB
  });
  if (!state.worldFile) {
    nodes.worldPickerText.textContent = t("upload.noWorldChosen");
  }
  if (state.packFiles.length === 0) {
    nodes.packsPickerText.textContent = t("upload.noPacksChosen");
  }
  if (state.generatedName) {
    nodes.downloadNote.textContent = t("status.downloadReady");
  }

  for (const button of nodes.langButtons) {
    button.setAttribute("aria-pressed", String(button.dataset.lang === state.lang));
  }
}

function refreshSelectedFiles() {
  if (state.worldFile) {
    nodes.worldPickerText.textContent = state.worldFile.name;
    nodes.worldInfo.textContent = t("status.worldFileSelected", {
      name: state.worldFile.name,
      size: formatBytes(state.worldFile.size)
    });
  } else {
    nodes.worldPickerText.textContent = t("upload.noWorldChosen");
    nodes.worldInfo.textContent = t("status.worldFileMissing");
  }

  if (state.packFiles.length > 0) {
    nodes.packsPickerText.textContent = t("upload.packsChosenInline", { count: state.packFiles.length });
    const total = state.packFiles.reduce((sum, file) => sum + file.size, 0);
    nodes.packsInfo.textContent = t("status.packsSelected", {
      count: state.packFiles.length,
      size: formatBytes(total)
    });
  } else {
    nodes.packsPickerText.textContent = t("upload.noPacksChosen");
    nodes.packsInfo.textContent = t("status.packsMissing");
  }
}

function updateActionState() {
  const hasInputs = Boolean(state.worldFile) && state.packFiles.length > 0;
  nodes.compileBtn.disabled = state.busy || !hasInputs;
  nodes.resetBtn.disabled = state.busy;
}

function setStatus(kind, message) {
  nodes.statusSummary.className = "status-summary";
  if (kind === "error") {
    nodes.statusSummary.classList.add("error");
    nodes.statusSummary.textContent = message;
    return;
  }
  if (kind === "success") {
    nodes.statusSummary.classList.add("success");
    nodes.statusSummary.textContent = message;
    return;
  }
  if (kind === "processing") {
    nodes.statusSummary.textContent = t("status.processing");
    return;
  }
  nodes.statusSummary.textContent = message;
}

function clearLog() {
  nodes.statusLog.innerHTML = "";
}

function appendLog(message, level = "info") {
  void message;
  void level;
}

function resetForm() {
  state.worldFile = null;
  state.packFiles = [];
  clearGeneratedOutput();
  nodes.worldInput.value = "";
  nodes.packsInput.value = "";
  clearLog();
  setStatus("idle", t("status.idle"));
  refreshSelectedFiles();
  updateActionState();
}

async function compileWorld() {
  if (state.busy) {
    return;
  }

  try {
    state.busy = true;
    updateActionState();
    clearGeneratedOutput();
    clearLog();
    setStatus("processing");
    appendLog(t("log.start"));
    validateInputs();

    appendLog(t("log.readWorld", { name: state.worldFile.name }));
    const worldZip = await loadZipFromFile(state.worldFile);
    const worldState = await loadWorldState(worldZip);

    appendLog(t("log.readPacks"));
    const packs = await extractPacks(state.packFiles);
    appendLog(t("log.packsFound", { count: packs.length }));

    const { included, skipped } = filterDuplicatedPacks(packs, worldState.existingUuids);
    for (const skip of skipped) {
      appendLog(t("log.skipDuplicate", { name: skip.displayName }), "warn");
    }

    const depResult = applyDependencyFixes(included);
    for (const packName of depResult.updatedPackNames) {
      appendLog(t("log.depsUpdated", { name: packName }));
    }
    for (const sourceFile of depResult.ambiguousSourceFiles) {
      appendLog(t("log.ambiguousDeps", { file: sourceFile }), "warn");
    }

    const placed = placePacksInWorld(worldZip, worldState, included);
    for (const item of placed) {
      appendLog(t("log.injectPack", { folder: item.targetFolder, name: item.displayName }));
    }
    for (const warning of worldState.folderWarnings) {
      appendLog(t("log.folderConflict", { requested: warning.requested, assigned: warning.assigned }), "warn");
    }

    appendLog(t("log.writeWorldRefs"));
    writeWorldReferenceFiles(worldZip, worldState);

    const outputName = makeCompiledName(state.worldFile.name);
    appendLog(t("log.generating"));
    let lastLoggedProgress = -1;
    const blob = await worldZip.generateAsync(
      { type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } },
      (metadata) => {
        const rounded = Math.floor(metadata.percent);
        if (rounded >= 0 && rounded % 10 === 0 && rounded !== lastLoggedProgress) {
          lastLoggedProgress = rounded;
          appendLog(t("log.progress", { percent: rounded }));
        }
      }
    );

    state.generatedBlob = blob;
    state.generatedName = outputName;
    nodes.downloadNote.textContent = t("status.downloadReady");
    nodes.downloadBox.hidden = false;
    setStatus("success", t("success.simple"));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    setStatus("error", message);
  } finally {
    state.busy = false;
    updateActionState();
  }
}

function validateInputs() {
  if (!state.worldFile) {
    throw new Error(t("error.worldRequired"));
  }
  if (state.packFiles.length === 0) {
    throw new Error(t("error.packsRequired"));
  }

  if (!state.worldFile.name.toLowerCase().endsWith(".mcworld")) {
    throw new Error(t("error.worldExtension"));
  }
  if (state.worldFile.size > LIMITS.maxWorldBytes) {
    throw new Error(t("error.worldSize", { limit: formatBytes(LIMITS.maxWorldBytes) }));
  }

  const totalPacksSize = state.packFiles.reduce((sum, file) => sum + file.size, 0);
  if (totalPacksSize > LIMITS.maxPacksBytes) {
    throw new Error(t("error.packsSize", { limit: formatBytes(LIMITS.maxPacksBytes) }));
  }

  for (const file of state.packFiles) {
    const lower = file.name.toLowerCase();
    if (!lower.endsWith(".mcpack") && !lower.endsWith(".mcaddon")) {
      throw new Error(t("error.packExtension", { name: file.name }));
    }
  }
}

async function loadZipFromFile(file) {
  try {
    const data = await file.arrayBuffer();
    return await globalThis.JSZip.loadAsync(data);
  } catch {
    throw new Error(t("error.badZip", { name: file.name }));
  }
}

async function loadWorldState(worldZip) {
  worldZip.folder("behavior_packs");
  worldZip.folder("resource_packs");

  const behaviorRefs = await readWorldReferenceFile(worldZip, "world_behavior_packs.json");
  const resourceRefs = await readWorldReferenceFile(worldZip, "world_resource_packs.json");

  const existingUuids = new Set();
  for (const ref of [...behaviorRefs, ...resourceRefs]) {
    if (ref && typeof ref.pack_id === "string") {
      existingUuids.add(ref.pack_id.toLowerCase());
    }
  }

  const nextBp = findNextPackIndex(worldZip, "behavior");
  const nextRp = findNextPackIndex(worldZip, "resource");
  const usedBehaviorFolders = collectExistingPackFolderNames(worldZip, "behavior");
  const usedResourceFolders = collectExistingPackFolderNames(worldZip, "resource");

  return {
    behaviorRefs,
    resourceRefs,
    existingUuids,
    nextBp,
    nextRp,
    usedBehaviorFolders,
    usedResourceFolders,
    folderWarnings: []
  };
}

async function readWorldReferenceFile(worldZip, filename) {
  const entry = worldZip.file(filename);
  if (!entry) {
    return [];
  }
  try {
    const text = await entry.async("string");
    if (!text.trim()) {
      return [];
    }
    const json = JSON.parse(text);
    if (!Array.isArray(json)) {
      throw new Error("not-array");
    }
    return json;
  } catch {
    throw new Error(t("error.worldJson", { file: filename }));
  }
}

function findNextPackIndex(worldZip, type) {
  const regex = type === "behavior" ? /^behavior_packs\/bp(\d+)\//i : /^resource_packs\/rp(\d+)\//i;
  let maxFound = -1;
  for (const key of Object.keys(worldZip.files)) {
    const match = key.match(regex);
    if (!match) {
      continue;
    }
    const idx = Number.parseInt(match[1], 10);
    if (Number.isInteger(idx) && idx > maxFound) {
      maxFound = idx;
    }
  }
  return maxFound + 1;
}

function collectExistingPackFolderNames(worldZip, type) {
  const prefix = type === "behavior" ? "behavior_packs/" : "resource_packs/";
  const out = new Set();
  for (const key of Object.keys(worldZip.files)) {
    if (!key.startsWith(prefix)) {
      continue;
    }
    const rest = key.slice(prefix.length);
    const firstSegment = rest.split("/")[0];
    if (firstSegment) {
      out.add(firstSegment);
    }
  }
  return out;
}

async function extractPacks(packFiles) {
  const allPacks = [];

  for (let i = 0; i < packFiles.length; i += 1) {
    const file = packFiles[i];
    const sourceId = `${i}:${file.name}`;
    const lower = file.name.toLowerCase();
    if (lower.endsWith(".mcpack")) {
      const mcpackPacks = await extractFromMcpack(file, sourceId);
      allPacks.push(...mcpackPacks);
      continue;
    }
    if (lower.endsWith(".mcaddon")) {
      const mcaddonPacks = await extractFromMcaddon(file, sourceId);
      allPacks.push(...mcaddonPacks);
      continue;
    }
    throw new Error(t("error.packExtension", { name: file.name }));
  }

  return allPacks;
}

async function extractFromMcpack(file, sourceId) {
  let zip;
  try {
    zip = await loadZipFromFile(file);
  } catch {
    throw new Error(t("error.invalidPackAbort", { detail: t("error.badZip", { name: file.name }) }));
  }

  const packs = await extractDirectPacksFromZip({
    zip,
    sourceId,
    sourceFileName: file.name,
    containerLabel: file.name,
    allowManyRoots: false,
    excludeArchiveEntries: false
  });

  if (packs.length === 0) {
    throw new Error(t("error.invalidPackAbort", { detail: t("error.packNoManifest", { file: file.name }) }));
  }
  if (packs.length > 1) {
    throw new Error(t("error.invalidPackAbort", { detail: t("error.packManyManifest", { file: file.name }) }));
  }

  return packs;
}

async function extractFromMcaddon(file, sourceId) {
  let outerZip;
  try {
    outerZip = await loadZipFromFile(file);
  } catch {
    throw new Error(t("error.invalidPackAbort", { detail: t("error.badZip", { name: file.name }) }));
  }

  const directPacks = await extractDirectPacksFromZip({
    zip: outerZip,
    sourceId,
    sourceFileName: file.name,
    containerLabel: file.name,
    allowManyRoots: true,
    excludeArchiveEntries: true
  });

  const nestedPacks = [];
  const entries = Object.values(outerZip.files).filter((f) => !f.dir && f.name.toLowerCase().endsWith(".mcpack"));
  for (const entry of entries) {
    const bytes = await entry.async("uint8array");
    let nestedZip;
    try {
      nestedZip = await globalThis.JSZip.loadAsync(bytes);
    } catch {
      throw new Error(t("error.invalidPackAbort", {
        detail: t("error.badZip", { name: `${file.name} -> ${entry.name}` })
      }));
    }

    const parsed = await extractDirectPacksFromZip({
      zip: nestedZip,
      sourceId,
      sourceFileName: file.name,
      containerLabel: `${file.name} -> ${entry.name}`,
      allowManyRoots: false,
      excludeArchiveEntries: false
    });

    if (parsed.length === 0) {
      throw new Error(t("error.invalidPackAbort", {
        detail: t("error.packNoManifest", { file: `${file.name} -> ${entry.name}` })
      }));
    }
    if (parsed.length > 1) {
      throw new Error(t("error.invalidPackAbort", {
        detail: t("error.packManyManifest", { file: `${file.name} -> ${entry.name}` })
      }));
    }
    nestedPacks.push(...parsed);
  }

  const all = [...directPacks, ...nestedPacks];
  if (all.length === 0) {
    throw new Error(t("error.invalidPackAbort", {
      detail: t("error.noValidPacksInAddon", { file: file.name })
    }));
  }
  return all;
}

async function extractDirectPacksFromZip(options) {
  const {
    zip,
    sourceId,
    sourceFileName,
    containerLabel,
    allowManyRoots,
    excludeArchiveEntries
  } = options;

  const manifests = Object.values(zip.files).filter((file) => {
    if (file.dir) {
      return false;
    }
    const lower = file.name.toLowerCase();
    return lower === "manifest.json" || lower.endsWith("/manifest.json");
  });

  if (manifests.length === 0) {
    return [];
  }

  const roots = new Map();
  for (const manifestFile of manifests) {
    const root = manifestFile.name.slice(0, -"manifest.json".length);
    if (!roots.has(root)) {
      roots.set(root, manifestFile);
    }
  }

  if (!allowManyRoots && roots.size > 1) {
    throw new Error(t("error.invalidPackAbort", { detail: t("error.packManyManifest", { file: containerLabel }) }));
  }

  const packs = [];
  for (const [root, manifestFile] of roots.entries()) {
    const manifestText = await manifestFile.async("string");
    let manifest;
    try {
      manifest = JSON.parse(manifestText);
    } catch {
      throw new Error(t("error.invalidPackAbort", {
        detail: t("error.packManifestInvalid", { label: `${containerLabel} :: ${manifestFile.name}` })
      }));
    }

    const headerName = manifest?.header?.name;
    const headerUuid = manifest?.header?.uuid;
    if (typeof headerName !== "string" || !headerName.trim() || typeof headerUuid !== "string" || !headerUuid.trim()) {
      throw new Error(t("error.invalidPackAbort", {
        detail: t("error.packNoHeader", { label: `${containerLabel} :: ${manifestFile.name}` })
      }));
    }

    const packType = detectPackType(manifest.modules);
    if (!packType) {
      throw new Error(t("error.invalidPackAbort", {
        detail: t("error.packNoType", { label: `${containerLabel} :: ${headerName}` })
      }));
    }

    const files = await readPackFilesFromRoot(zip, root, excludeArchiveEntries);
    const manifestRelPath = normalizePackPath(manifestFile.name.slice(root.length));
    const packVersion = normalizeVersion(manifest?.header?.version);
    const preferredFolderName = extractRootFolderName(root);

    packs.push({
      sourceId,
      sourceFileName,
      displayName: headerName.trim(),
      type: packType,
      headerUuid: headerUuid.trim(),
      headerVersion: packVersion,
      manifest,
      manifestPath: manifestRelPath,
      files,
      preferredFolderName
    });
  }

  return packs;
}

async function readPackFilesFromRoot(zip, rootPrefix, excludeArchiveEntries) {
  const map = new Map();
  const files = Object.values(zip.files).filter((entry) => !entry.dir && entry.name.startsWith(rootPrefix));

  for (const file of files) {
    const rel = normalizePackPath(file.name.slice(rootPrefix.length));
    if (!rel) {
      continue;
    }
    const lowerRel = rel.toLowerCase();
    if (excludeArchiveEntries && (lowerRel.endsWith(".mcpack") || lowerRel.endsWith(".mcaddon"))) {
      continue;
    }
    const content = await file.async("uint8array");
    map.set(rel, content);
  }

  return map;
}

function detectPackType(modules) {
  if (!Array.isArray(modules)) {
    return null;
  }
  let hasData = false;
  let hasResources = false;
  for (const module of modules) {
    const type = typeof module?.type === "string" ? module.type.toLowerCase() : "";
    if (type === "data") {
      hasData = true;
    }
    if (type === "resources") {
      hasResources = true;
    }
  }
  if (hasData) {
    return "behavior";
  }
  if (hasResources) {
    return "resource";
  }
  return null;
}

function normalizeVersion(version) {
  if (!Array.isArray(version) || version.length === 0) {
    return [1, 0, 0];
  }
  const out = version.slice(0, 3).map((value) => {
    const n = Number.parseInt(String(value), 10);
    return Number.isFinite(n) ? n : 0;
  });
  while (out.length < 3) {
    out.push(0);
  }
  return out;
}

function normalizePackPath(path) {
  const pathFixed = String(path).replace(/\\/g, "/");
  const cleanParts = pathFixed.split("/").filter((p) => p && p !== "." && p !== "..");
  return cleanParts.join("/");
}

function extractRootFolderName(root) {
  if (!root) {
    return null;
  }
  const normalized = normalizePackPath(root);
  if (!normalized || normalized.includes("/")) {
    return null;
  }
  return normalized;
}

function filterDuplicatedPacks(packs, existingUuids) {
  const seen = new Set();
  for (const existing of existingUuids.values()) {
    seen.add(existing.toLowerCase());
  }

  const included = [];
  const skipped = [];
  for (const pack of packs) {
    const key = pack.headerUuid.toLowerCase();
    if (seen.has(key)) {
      skipped.push(pack);
      continue;
    }
    seen.add(key);
    included.push(pack);
  }
  return { included, skipped };
}

function applyDependencyFixes(packs) {
  const grouped = new Map();
  for (const pack of packs) {
    const list = grouped.get(pack.sourceId) || [];
    list.push(pack);
    grouped.set(pack.sourceId, list);
  }

  const updatedPackNames = [];
  const ambiguousSourceFiles = [];

  for (const sourcePacks of grouped.values()) {
    const behavior = sourcePacks.filter((p) => p.type === "behavior");
    const resource = sourcePacks.filter((p) => p.type === "resource");
    const sourceFile = sourcePacks[0]?.sourceFileName || "unknown";

    if (behavior.length === 1 && resource.length === 1) {
      if (rewriteDependencies(behavior[0], resource[0])) {
        updatedPackNames.push(behavior[0].displayName);
      }
      if (rewriteDependencies(resource[0], behavior[0])) {
        updatedPackNames.push(resource[0].displayName);
      }
      continue;
    }

    if (resource.length === 1 && behavior.length > 1) {
      for (const bp of behavior) {
        if (rewriteDependencies(bp, resource[0])) {
          updatedPackNames.push(bp.displayName);
        }
      }
      continue;
    }

    if (behavior.length === 1 && resource.length > 1) {
      for (const rp of resource) {
        if (rewriteDependencies(rp, behavior[0])) {
          updatedPackNames.push(rp.displayName);
        }
      }
      continue;
    }

    if (hasAnyDependencies(sourcePacks) && behavior.length > 0 && resource.length > 0) {
      ambiguousSourceFiles.push(sourceFile);
    }
  }

  return { updatedPackNames, ambiguousSourceFiles };
}

function hasAnyDependencies(packs) {
  return packs.some((pack) => Array.isArray(pack.manifest?.dependencies) && pack.manifest.dependencies.length > 0);
}

function rewriteDependencies(pack, counterpart) {
  const deps = pack.manifest?.dependencies;
  if (!Array.isArray(deps) || deps.length === 0) {
    return false;
  }

  let changed = false;
  for (const dep of deps) {
    if (!dep || typeof dep !== "object" || typeof dep.uuid !== "string") {
      continue;
    }
    if (dep.uuid !== counterpart.headerUuid) {
      dep.uuid = counterpart.headerUuid;
      changed = true;
    }
    if (Array.isArray(dep.version)) {
      const current = JSON.stringify(dep.version);
      const target = JSON.stringify(counterpart.headerVersion);
      if (current !== target) {
        dep.version = counterpart.headerVersion.slice();
        changed = true;
      }
    }
  }

  if (changed) {
    const manifestText = `${JSON.stringify(pack.manifest, null, 2)}\n`;
    const manifestBytes = new TextEncoder().encode(manifestText);
    pack.files.set(pack.manifestPath, manifestBytes);
  }
  return changed;
}

function placePacksInWorld(worldZip, worldState, packs) {
  const placed = [];

  for (const pack of packs) {
    const folderName = chooseTargetFolderName(pack, worldState);
    const basePath = pack.type === "behavior" ? "behavior_packs" : "resource_packs";
    const fullPrefix = `${basePath}/${folderName}`;

    for (const [relPath, content] of pack.files.entries()) {
      const cleanRel = normalizePackPath(relPath);
      if (!cleanRel) {
        continue;
      }
      worldZip.file(`${fullPrefix}/${cleanRel}`, content);
    }

    const ref = {
      pack_id: pack.headerUuid,
      version: pack.headerVersion.slice()
    };
    if (pack.type === "behavior") {
      worldState.behaviorRefs.push(ref);
    } else {
      worldState.resourceRefs.push(ref);
    }

    placed.push({
      displayName: pack.displayName,
      targetFolder: folderName
    });
  }

  return placed;
}

function chooseTargetFolderName(pack, worldState) {
  const isBehavior = pack.type === "behavior";
  const usedFolders = isBehavior ? worldState.usedBehaviorFolders : worldState.usedResourceFolders;

  if (pack.preferredFolderName && !usedFolders.has(pack.preferredFolderName)) {
    usedFolders.add(pack.preferredFolderName);
    return pack.preferredFolderName;
  }

  if (pack.preferredFolderName && usedFolders.has(pack.preferredFolderName)) {
    const assigned = getNextGeneratedFolder(isBehavior, worldState, usedFolders);
    worldState.folderWarnings.push({
      requested: pack.preferredFolderName,
      assigned
    });
    return assigned;
  }

  return getNextGeneratedFolder(isBehavior, worldState, usedFolders);
}

function getNextGeneratedFolder(isBehavior, worldState, usedFolders) {
  if (isBehavior) {
    while (usedFolders.has(`bp${worldState.nextBp}`)) {
      worldState.nextBp += 1;
    }
    const name = `bp${worldState.nextBp}`;
    worldState.nextBp += 1;
    usedFolders.add(name);
    return name;
  }

  while (usedFolders.has(`rp${worldState.nextRp}`)) {
    worldState.nextRp += 1;
  }
  const name = `rp${worldState.nextRp}`;
  worldState.nextRp += 1;
  usedFolders.add(name);
  return name;
}

function writeWorldReferenceFiles(worldZip, worldState) {
  const behaviorText = `${JSON.stringify(worldState.behaviorRefs, null, 2)}\n`;
  const resourceText = `${JSON.stringify(worldState.resourceRefs, null, 2)}\n`;
  worldZip.file("world_behavior_packs.json", behaviorText);
  worldZip.file("world_resource_packs.json", resourceText);
}

function makeCompiledName(originalName) {
  const lower = originalName.toLowerCase();
  if (lower.endsWith(".mcworld")) {
    return `${originalName.slice(0, -".mcworld".length)}_compiled.mcworld`;
  }
  return `${originalName}_compiled.mcworld`;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

function formatBytes(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function clearGeneratedOutput() {
  state.generatedBlob = null;
  state.generatedName = "";
  nodes.downloadBox.hidden = true;
  nodes.downloadNote.textContent = "";
}

function showHowtoModal() {
  nodes.howtoModal.hidden = false;
  nodes.howtoModal.setAttribute("aria-hidden", "false");
}

function hideHowtoModal() {
  nodes.howtoModal.hidden = true;
  nodes.howtoModal.setAttribute("aria-hidden", "true");
}

function mergePackFiles(existingFiles, newFiles) {
  const merged = [...existingFiles];
  const seen = new Set(existingFiles.map(fileFingerprint));
  for (const file of newFiles) {
    const fingerprint = fileFingerprint(file);
    if (seen.has(fingerprint)) {
      continue;
    }
    seen.add(fingerprint);
    merged.push(file);
  }
  return merged;
}

function fileFingerprint(file) {
  return `${file.name}::${file.size}::${file.lastModified}`;
}
