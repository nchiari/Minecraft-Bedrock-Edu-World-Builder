import { I18N } from "./i18n.js?v=20260919-2";
import { initTemplateTool } from "./template.js";
import { initWorldInspector } from "./inspector.js";
import { initExperimentsTool } from "./experiments.js";

const MB = 1024 * 1024;
const LIMITS = {
  maxWorldBytes: 150 * MB,
  maxPacksBytes: 100 * MB
};

const state = {
  lang: detectInitialLang(),
  activeTool: detectInitialTool(),
  worldFile: null,
  packFiles: [],
  packFolderSelections: [],
  cleanExistingPacks: true,
  regeneratePackUuids: true,
  busy: false,
  generatedBlob: null,
  generatedName: "",
  status: { kind: "idle", key: "status.idle", vars: {}, directMessage: "" }
};

const nodes = {
  worldInput: document.getElementById("world-input"),
  packsInput: document.getElementById("packs-input"),
  packsFolderInput: document.getElementById("packs-folder-input"),
  behaviorFolderInput: document.getElementById("behavior-folder-input"),
  resourceFolderInput: document.getElementById("resource-folder-input"),
  worldPickerBtn: document.getElementById("world-picker-btn"),
  packsPickerBtn: document.getElementById("packs-picker-btn"),
  packsFolderPickerBtn: document.getElementById("packs-folder-picker-btn"),
  behaviorFolderPickerBtn: document.getElementById("behavior-folder-picker-btn"),
  resourceFolderPickerBtn: document.getElementById("resource-folder-picker-btn"),
  worldPickerText: document.getElementById("world-picker-text"),
  packsPickerText: document.getElementById("packs-picker-text"),
  packsFolderPickerText: document.getElementById("packs-folder-picker-text"),
  behaviorFolderPickerText: document.getElementById("behavior-folder-picker-text"),
  resourceFolderPickerText: document.getElementById("resource-folder-picker-text"),
  cleanExistingPacks: document.getElementById("clean-existing-packs"),
  regeneratePackUuids: document.getElementById("regenerate-pack-uuids"),
  worldInfo: document.getElementById("world-file-info"),
  packsInfo: document.getElementById("packs-file-info"),
  packsFolderInfo: document.getElementById("packs-folder-info"),
  behaviorFolderInfo: document.getElementById("behavior-folder-info"),
  resourceFolderInfo: document.getElementById("resource-folder-info"),
  limitsCopy: document.getElementById("limits-copy"),
  compileBtn: document.getElementById("compile-btn"),
  resetBtn: document.getElementById("reset-btn"),
  downloadBtn: document.getElementById("download-btn"),
  downloadBox: document.getElementById("download-box"),
  downloadNote: document.getElementById("download-note"),
  heroSubtitle: document.getElementById("hero-subtitle"),
  howtoOpen: document.getElementById("howto-open"),
  howtoClose: document.getElementById("howto-close"),
  howtoModal: document.getElementById("howto-modal"),
  howtoOverlay: document.getElementById("howto-overlay"),
  howtoTitle: document.getElementById("howto-title"),
  howtoIntro: document.getElementById("howto-intro"),
  howtoSteps: [
    document.getElementById("howto-step-1"),
    document.getElementById("howto-step-2"),
    document.getElementById("howto-step-3")
  ],
  howtoNote: document.getElementById("howto-note"),
  statusSummary: document.getElementById("status-summary"),
  statusLog: document.getElementById("status-log"),
  langButtons: Array.from(document.querySelectorAll(".lang-btn")),
  toolButtons: Array.from(document.querySelectorAll(".tool-choice")),
  compilerWorkspace: document.getElementById("compiler-workspace"),
  templateWorkspace: document.getElementById("template-workspace"),
  inspectorWorkspace: document.getElementById("inspector-workspace"),
  experimentsWorkspace: document.getElementById("experiments-workspace")
};

let templateTool = null;
let inspectorTool = null;
let experimentsTool = null;
let lastFocusedBeforeModal = null;

init();

function init() {
  if (!globalThis.JSZip) {
    setStatus("error", "", {}, t("error.jszipMissing"));
    return;
  }

  bindEvents();
  templateTool = initTemplateTool({
    t,
    formatBytes,
    maxWorldBytes: LIMITS.maxWorldBytes
  });
  inspectorTool = initWorldInspector({
    t,
    formatBytes,
    maxWorldBytes: LIMITS.maxWorldBytes
  });
  experimentsTool = initExperimentsTool({
    t,
    formatBytes,
    maxWorldBytes: LIMITS.maxWorldBytes
  });
  applyI18n();
  applyActiveTool();
  refreshSelectedFiles();
  updateActionState();
  setStatus("idle", "status.idle");
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
    updateStatusForInputs();
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
    updateStatusForInputs();
  });

  nodes.packsFolderPickerBtn.addEventListener("click", () => {
    nodes.packsFolderInput.click();
  });

  nodes.packsFolderInput.addEventListener("change", () => {
    const files = nodes.packsFolderInput.files ? Array.from(nodes.packsFolderInput.files) : [];
    if (files.length > 0) {
      state.packFolderSelections = mergePackFolderSelection(state.packFolderSelections, files);
    }
    nodes.packsFolderInput.value = "";
    clearGeneratedOutput();
    refreshSelectedFiles();
    updateActionState();
    updateStatusForInputs();
  });

  nodes.cleanExistingPacks.addEventListener("change", () => {
    state.cleanExistingPacks = nodes.cleanExistingPacks.checked;
    clearGeneratedOutput();
    updateStatusForInputs();
  });

  nodes.regeneratePackUuids.addEventListener("change", () => {
    state.regeneratePackUuids = nodes.regeneratePackUuids.checked;
    clearGeneratedOutput();
    updateStatusForInputs();
  });

  bindTypedFolderPicker("behavior");
  bindTypedFolderPicker("resource");

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
      const lang = button.dataset.lang === "en" ? "en" : "es";
      state.lang = lang;
      try {
        localStorage.setItem("world-builder-language", lang);
      } catch {
        // Language persistence is optional.
      }
      applyI18n();
      applyActiveTool();
      refreshSelectedFiles();
      updateActionState();
      renderStatus();
    });
  }

  for (const button of nodes.toolButtons) {
    button.addEventListener("click", () => {
      const tool = ["compiler", "template", "inspector", "experiments"].includes(button.dataset.tool)
        ? button.dataset.tool
        : "compiler";
      selectTool(tool);
    });
  }

  window.addEventListener("hashchange", () => {
    const nextTool = detectInitialTool();
    if (nextTool !== state.activeTool) {
      state.activeTool = nextTool;
      applyActiveTool();
    }
  });
}

function detectInitialLang() {
  try {
    const saved = localStorage.getItem("world-builder-language");
    if (saved === "en" || saved === "es") {
      return saved;
    }
  } catch {
    // Fall back to the browser language when storage is unavailable.
  }
  return navigator.language.toLowerCase().startsWith("es") ? "es" : "en";
}

function detectInitialTool() {
  if (window.location.hash === "#template-creator") {
    return "template";
  }
  if (window.location.hash === "#world-inspector") {
    return "inspector";
  }
  if (window.location.hash === "#experiments-editor") {
    return "experiments";
  }
  return "compiler";
}

function selectTool(tool) {
  state.activeTool = tool;
  applyActiveTool();

  const hash = tool === "template"
    ? "#template-creator"
    : tool === "inspector"
      ? "#world-inspector"
      : tool === "experiments" ? "#experiments-editor" : "#pack-compiler";
  if (window.location.hash !== hash) {
    window.history.pushState(null, "", hash);
  }
}

function applyActiveTool() {
  const showTemplate = state.activeTool === "template";
  const showInspector = state.activeTool === "inspector";
  const showExperiments = state.activeTool === "experiments";
  nodes.compilerWorkspace.hidden = showTemplate || showInspector || showExperiments;
  nodes.templateWorkspace.hidden = !showTemplate;
  nodes.inspectorWorkspace.hidden = !showInspector;
  nodes.experimentsWorkspace.hidden = !showExperiments;
  nodes.heroSubtitle.textContent = t("app.subtitle");
  const helpPrefix = showTemplate
    ? "templateHelp"
    : showInspector ? "inspectorHelp" : showExperiments ? "experimentsHelp" : "help";
  nodes.howtoOpen.hidden = false;
  nodes.howtoOpen.textContent = t(`${helpPrefix}.open`);
  nodes.howtoTitle.textContent = t(`${helpPrefix}.title`);
  nodes.howtoIntro.textContent = t(`${helpPrefix}.intro`);
  nodes.howtoSteps.forEach((step, index) => {
    step.textContent = t(`${helpPrefix}.step${index + 1}`);
  });
  nodes.howtoNote.textContent = t(`${helpPrefix}.note`);

  for (const button of nodes.toolButtons) {
    const isActive = button.dataset.tool === state.activeTool;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  }
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

  for (const el of document.querySelectorAll("[data-i18n-aria-label]")) {
    const key = el.getAttribute("data-i18n-aria-label");
    if (key) {
      el.setAttribute("aria-label", t(key));
    }
  }

  for (const el of document.querySelectorAll("[data-i18n-placeholder]")) {
    const key = el.getAttribute("data-i18n-placeholder");
    if (key) {
      el.setAttribute("placeholder", t(key));
    }
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
  if (state.packFolderSelections.length === 0) {
    nodes.packsFolderPickerText.textContent = t("upload.noPackFoldersChosen");
  }
  if (!getTypedFolderSelection("behavior")) {
    nodes.behaviorFolderPickerText.textContent = t("upload.noBehaviorFolderChosen");
  }
  if (!getTypedFolderSelection("resource")) {
    nodes.resourceFolderPickerText.textContent = t("upload.noResourceFolderChosen");
  }
  if (state.generatedName) {
    nodes.downloadNote.textContent = t("status.downloadReady");
  }

  for (const button of nodes.langButtons) {
    button.setAttribute("aria-pressed", String(button.dataset.lang === state.lang));
  }
  templateTool?.refreshLanguage();
  inspectorTool?.refreshLanguage();
  experimentsTool?.refreshLanguage();
}

function bindTypedFolderPicker(type) {
  const input = type === "behavior" ? nodes.behaviorFolderInput : nodes.resourceFolderInput;
  const button = type === "behavior" ? nodes.behaviorFolderPickerBtn : nodes.resourceFolderPickerBtn;
  button.addEventListener("click", () => input.click());
  input.addEventListener("change", () => {
    const files = input.files ? Array.from(input.files) : [];
    if (files.length > 0) {
      state.packFolderSelections = mergePackFolderSelection(state.packFolderSelections, files, type);
    }
    input.value = "";
    clearGeneratedOutput();
    refreshSelectedFiles();
    updateActionState();
    updateStatusForInputs();
  });
}

function refreshSelectedFiles() {
  if (state.worldFile) {
    nodes.worldInfo.hidden = false;
    nodes.worldPickerText.textContent = state.worldFile.name;
    nodes.worldInfo.textContent = t("status.worldFileSelected", {
      name: state.worldFile.name,
      size: formatBytes(state.worldFile.size)
    });
  } else {
    nodes.worldPickerText.textContent = t("upload.noWorldChosen");
    nodes.worldInfo.textContent = "";
    nodes.worldInfo.hidden = true;
  }

  if (state.packFiles.length > 0) {
    nodes.packsInfo.hidden = false;
    const countKey = state.packFiles.length === 1 ? "upload.packChosenInline" : "upload.packsChosenInline";
    nodes.packsPickerText.textContent = t(countKey, { count: state.packFiles.length });
    const total = state.packFiles.reduce((sum, file) => sum + file.size, 0);
    const statusKey = state.packFiles.length === 1 ? "status.packSelected" : "status.packsSelected";
    nodes.packsInfo.textContent = t(statusKey, {
      count: state.packFiles.length,
      size: formatBytes(total)
    });
  } else {
    nodes.packsPickerText.textContent = t("upload.noPacksChosen");
    nodes.packsInfo.textContent = "";
    nodes.packsInfo.hidden = true;
  }

  const generalFolderSelections = state.packFolderSelections.filter((selection) => !selection.expectedType);
  if (generalFolderSelections.length > 0) {
    nodes.packsFolderInfo.hidden = false;
    const folderCount = generalFolderSelections.length;
    const fileCount = generalFolderSelections.reduce((sum, selection) => sum + selection.files.length, 0);
    const total = generalFolderSelections.reduce(
      (sum, selection) => sum + selection.files.reduce((fileSum, file) => fileSum + file.size, 0),
      0
    );
    nodes.packsFolderPickerText.textContent = t(
      folderCount === 1 ? "upload.packFolderChosenInline" : "upload.packFoldersChosenInline",
      { count: folderCount }
    );
    const folderStatusKey = folderCount === 1 ? "status.packFolderSelected" : "status.packFoldersSelected";
    nodes.packsFolderInfo.textContent = t(folderStatusKey, {
      folders: folderCount,
      files: fileCount,
      size: formatBytes(total)
    });
  } else {
    nodes.packsFolderPickerText.textContent = t("upload.noPackFoldersChosen");
    nodes.packsFolderInfo.textContent = "";
    nodes.packsFolderInfo.hidden = true;
  }

  refreshTypedFolderSelection("behavior");
  refreshTypedFolderSelection("resource");
}

function getTypedFolderSelection(type) {
  return state.packFolderSelections.find((selection) => selection.expectedType === type) || null;
}

function refreshTypedFolderSelection(type) {
  const selection = getTypedFolderSelection(type);
  const pickerText = type === "behavior" ? nodes.behaviorFolderPickerText : nodes.resourceFolderPickerText;
  const info = type === "behavior" ? nodes.behaviorFolderInfo : nodes.resourceFolderInfo;
  if (!selection) {
    pickerText.textContent = t(type === "behavior" ? "upload.noBehaviorFolderChosen" : "upload.noResourceFolderChosen");
    info.textContent = "";
    info.hidden = true;
    return;
  }
  const total = selection.files.reduce((sum, file) => sum + file.size, 0);
  pickerText.textContent = selection.label;
  info.textContent = t("status.typedPackFolderSelected", {
    files: selection.files.length,
    size: formatBytes(total)
  });
  info.hidden = false;
}

function updateActionState() {
  const hasPackSources = state.packFiles.length > 0 || state.packFolderSelections.length > 0;
  const hasInputs = Boolean(state.worldFile) && hasPackSources;
  nodes.compileBtn.disabled = state.busy || !hasInputs;
  nodes.resetBtn.disabled = state.busy;
  nodes.cleanExistingPacks.disabled = state.busy;
  nodes.regeneratePackUuids.disabled = state.busy;
  nodes.worldPickerBtn.disabled = state.busy;
  nodes.packsPickerBtn.disabled = state.busy;
  nodes.packsFolderPickerBtn.disabled = state.busy;
  nodes.behaviorFolderPickerBtn.disabled = state.busy;
  nodes.resourceFolderPickerBtn.disabled = state.busy;
}

function setStatus(kind, key, vars = {}, directMessage = "") {
  state.status = { kind, key, vars, directMessage };
  renderStatus();
}

function renderStatus() {
  nodes.statusSummary.className = "status-summary";
  if (state.status.kind === "error") {
    nodes.statusSummary.classList.add("error");
  } else if (state.status.kind === "success") {
    nodes.statusSummary.classList.add("success");
  }
  nodes.statusSummary.textContent = state.status.directMessage || t(state.status.key, state.status.vars);
}

function updateStatusForInputs() {
  if (state.busy) {
    return;
  }
  const ready = Boolean(state.worldFile) && (state.packFiles.length > 0 || state.packFolderSelections.length > 0);
  setStatus("idle", ready ? "status.ready" : "status.idle");
}

function clearLog() {
  nodes.statusLog.innerHTML = "";
}

function appendLog(message, level = "info") {
  const item = document.createElement("li");
  item.textContent = message;
  if (level !== "info") {
    item.classList.add(level);
  }
  nodes.statusLog.appendChild(item);
  return item;
}

function updateProgressLog(percent) {
  let item = nodes.statusLog.querySelector("[data-progress]");
  if (!item) {
    item = appendLog("");
    item.dataset.progress = "true";
  }
  item.textContent = t("log.progress", { percent });
}

function resetForm() {
  state.worldFile = null;
  state.packFiles = [];
  state.packFolderSelections = [];
  state.cleanExistingPacks = true;
  state.regeneratePackUuids = true;
  clearGeneratedOutput();
  nodes.worldInput.value = "";
  nodes.packsInput.value = "";
  nodes.packsFolderInput.value = "";
  nodes.behaviorFolderInput.value = "";
  nodes.resourceFolderInput.value = "";
  nodes.cleanExistingPacks.checked = true;
  nodes.regeneratePackUuids.checked = true;
  clearLog();
  setStatus("idle", "status.idle");
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
    setStatus("processing", "status.processing");
    appendLog(t("log.start"));
    validateInputs();

    appendLog(t("log.readWorld", { name: state.worldFile.name }));
    const worldZip = await loadZipFromFile(state.worldFile);
    const worldState = await loadWorldState(worldZip);
    if (state.cleanExistingPacks) {
      appendLog(t("log.cleanExistingPacks"));
      cleanExistingWorldPacks(worldZip, worldState);
    }

    appendLog(t("log.readPacks"));
    const packs = await extractPacks(state.packFiles, state.packFolderSelections);
    appendLog(t("log.packsFound", { count: packs.length }));

    const { included, skipped } = filterDuplicatedPacks(packs, worldState.embeddedUuids);
    for (const skip of skipped) {
      appendLog(t("log.skipDuplicate", { name: skip.displayName }), "warn");
    }

    if (!state.regeneratePackUuids) {
      const depResult = applyDependencyFixes(included);
      for (const packName of depResult.updatedPackNames) {
        appendLog(t("log.depsUpdated", { name: packName }));
      }
      for (const sourceFile of depResult.ambiguousSourceFiles) {
        appendLog(t("log.ambiguousDeps", { file: sourceFile }), "warn");
      }
    }

    const placed = placePacksInWorld(worldZip, worldState, included);
    for (const item of placed) {
      appendLog(t("log.injectPack", { folder: item.targetFolder, name: item.displayName }));
    }
    for (const warning of worldState.folderWarnings) {
      appendLog(t("log.folderConflict", { requested: warning.requested, assigned: warning.assigned }), "warn");
    }

    if (state.regeneratePackUuids) {
      appendLog(t("log.regeneratePackUuids"));
      await regenerateWorldPackUuids(worldZip, worldState);
    }

    appendLog(t("log.writeWorldRefs"));
    writeWorldReferenceFiles(worldZip, worldState);

    const outputName = makeCompiledName(state.worldFile.name);
    appendLog(t("log.generating"));
    let lastLoggedProgress = -1;
    const bytes = await worldZip.generateAsync(
      { type: "uint8array", compression: "DEFLATE", compressionOptions: { level: 6 } },
      (metadata) => {
        const rounded = Math.floor(metadata.percent);
        if (rounded >= 0 && rounded % 10 === 0 && rounded !== lastLoggedProgress) {
          lastLoggedProgress = rounded;
          updateProgressLog(rounded);
        }
      }
    );
    if (!bytes || bytes.byteLength === 0) {
      throw new Error(t("error.emptyGeneratedWorld"));
    }
    const blob = new Blob([bytes], { type: "application/zip" });
    if (blob.size === 0) {
      throw new Error(t("error.emptyGeneratedWorld"));
    }

    state.generatedBlob = blob;
    state.generatedName = outputName;
    nodes.downloadNote.textContent = t("status.downloadReady");
    nodes.downloadBox.hidden = false;
    appendLog(t("log.finished", { name: outputName }), "ok");
    setStatus("success", "success.simple");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    setStatus("error", "", {}, message);
  } finally {
    state.busy = false;
    updateActionState();
  }
}

function validateInputs() {
  if (!state.worldFile) {
    throw new Error(t("error.worldRequired"));
  }
  if (state.packFiles.length === 0 && state.packFolderSelections.length === 0) {
    throw new Error(t("error.packsRequired"));
  }

  if (!state.worldFile.name.toLowerCase().endsWith(".mcworld")) {
    throw new Error(t("error.worldExtension"));
  }
  if (state.worldFile.size > LIMITS.maxWorldBytes) {
    throw new Error(t("error.worldSize", { limit: formatBytes(LIMITS.maxWorldBytes) }));
  }

  const folderFilesSize = state.packFolderSelections.reduce(
    (sum, selection) => sum + selection.files.reduce((fileSum, file) => fileSum + file.size, 0),
    0
  );
  const totalPacksSize = state.packFiles.reduce((sum, file) => sum + file.size, 0) + folderFilesSize;
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
    if (!data || data.byteLength === 0) {
      throw new Error("empty-file");
    }
    return await globalThis.JSZip.loadAsync(data);
  } catch {
    throw new Error(t("error.badZip", { name: file.name }));
  }
}

async function loadWorldState(worldZip) {
  validateWorldZipContent(worldZip);

  worldZip.folder("behavior_packs");
  worldZip.folder("resource_packs");

  const behaviorRefs = await readWorldReferenceFile(worldZip, "world_behavior_packs.json");
  const resourceRefs = await readWorldReferenceFile(worldZip, "world_resource_packs.json");

  const referencedUuids = new Set();
  for (const ref of [...behaviorRefs, ...resourceRefs]) {
    if (ref && typeof ref.pack_id === "string") {
      referencedUuids.add(ref.pack_id.toLowerCase());
    }
  }
  const embeddedUuids = await collectEmbeddedPackUuids(worldZip);

  const nextBp = findNextPackIndex(worldZip, "behavior");
  const nextRp = findNextPackIndex(worldZip, "resource");
  const usedBehaviorFolders = collectExistingPackFolderNames(worldZip, "behavior");
  const usedResourceFolders = collectExistingPackFolderNames(worldZip, "resource");

  return {
    behaviorRefs,
    resourceRefs,
    referencedUuids,
    embeddedUuids,
    nextBp,
    nextRp,
    usedBehaviorFolders,
    usedResourceFolders,
    folderWarnings: []
  };
}

async function collectEmbeddedPackUuids(worldZip) {
  const embeddedUuids = new Set();
  const manifests = Object.values(worldZip.files).filter((file) => {
    if (file.dir) {
      return false;
    }
    const path = normalizePackPath(file.name).toLowerCase();
    return (
      path.startsWith("behavior_packs/") ||
      path.startsWith("resource_packs/")
    ) && path.endsWith("/manifest.json");
  });

  for (const manifestFile of manifests) {
    try {
      const manifest = JSON.parse(await manifestFile.async("string"));
      const uuid = manifest?.header?.uuid;
      if (typeof uuid === "string" && uuid.trim()) {
        embeddedUuids.add(uuid.trim().toLowerCase());
      }
    } catch {
      // Invalid existing embedded packs should not block adding valid new packs.
    }
  }

  return embeddedUuids;
}

function validateWorldZipContent(worldZip) {
  const fileEntries = Object.values(worldZip.files).filter((entry) => !entry.dir);
  if (fileEntries.length === 0) {
    throw new Error(t("error.emptyWorld"));
  }

  const hasLevelDat = fileEntries.some((entry) => normalizePackPath(entry.name).toLowerCase() === "level.dat");
  if (!hasLevelDat) {
    throw new Error(t("error.worldMissingLevel"));
  }
}

function cleanExistingWorldPacks(worldZip, worldState) {
  const packRoots = ["behavior_packs/", "resource_packs/"];
  const namesToRemove = Object.entries(worldZip.files).filter(([name, entry]) => {
    const normalized = normalizePackPath(name);
    const normalizedWithSlash = entry.dir ? `${normalized}/` : normalized;
    return packRoots.some((root) => normalizedWithSlash.toLowerCase().startsWith(root));
  }).map(([name]) => name);

  for (const name of namesToRemove) {
    if (worldZip.files[name]) {
      worldZip.remove(name);
    }
  }

  worldZip.remove("world_behavior_packs.json");
  worldZip.remove("world_resource_packs.json");
  worldZip.folder("behavior_packs");
  worldZip.folder("resource_packs");

  worldState.behaviorRefs = [];
  worldState.resourceRefs = [];
  worldState.referencedUuids = new Set();
  worldState.embeddedUuids = new Set();
  worldState.nextBp = 0;
  worldState.nextRp = 0;
  worldState.usedBehaviorFolders = new Set();
  worldState.usedResourceFolders = new Set();
  worldState.folderWarnings = [];
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

async function extractPacks(packFiles, folderSelections) {
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

  for (let i = 0; i < folderSelections.length; i += 1) {
    const selection = folderSelections[i];
    const sourceId = `folder:${i}:${selection.id}`;
    const folderPacks = await extractFromFolderSelection(selection, sourceId);
    allPacks.push(...folderPacks);
  }

  return allPacks;
}

async function extractFromFolderSelection(selection, sourceId) {
  const records = selection.files.map((file) => ({
    file,
    path: normalizePackPath(file.webkitRelativePath || file.name)
  }));
  const manifestRecords = records.filter((record) => record.path.toLowerCase().endsWith("/manifest.json") || record.path.toLowerCase() === "manifest.json");
  if (manifestRecords.length === 0) {
    throw new Error(t("error.invalidPackAbort", {
      detail: t("error.packFolderNoManifest", { folder: selection.label })
    }));
  }

  const parsedManifests = [];
  for (const manifestRecord of manifestRecords) {
    let manifest;
    try {
      manifest = JSON.parse(await manifestRecord.file.text());
    } catch {
      throw new Error(t("error.invalidPackAbort", {
        detail: t("error.packManifestInvalid", { label: `${selection.label} :: ${manifestRecord.path}` })
      }));
    }
    const packType = detectPackType(manifest.modules);
    if (packType) {
      parsedManifests.push({ manifestRecord, manifest, packType });
    }
  }

  if (parsedManifests.length === 0) {
    throw new Error(t("error.invalidPackAbort", {
      detail: t("error.packFolderNoValidPacks", { folder: selection.label })
    }));
  }

  if (selection.expectedType) {
    const wrongType = parsedManifests.find(({ packType }) => packType !== selection.expectedType);
    if (wrongType) {
      throw new Error(t("error.invalidPackAbort", {
        detail: t("error.packFolderWrongType", {
          folder: selection.label,
          expected: t(selection.expectedType === "behavior" ? "packType.behavior" : "packType.resource")
        })
      }));
    }
  }

  const packs = [];
  for (const { manifestRecord, manifest, packType } of parsedManifests) {
    const root = manifestRecord.path.slice(0, -"manifest.json".length);
    const headerName = manifest?.header?.name;
    const headerUuid = manifest?.header?.uuid;
    if (typeof headerName !== "string" || !headerName.trim() || typeof headerUuid !== "string" || !headerUuid.trim()) {
      throw new Error(t("error.invalidPackAbort", {
        detail: t("error.packNoHeader", { label: `${selection.label} :: ${manifestRecord.path}` })
      }));
    }

    const files = new Map();
    for (const record of records) {
      if (!record.path.startsWith(root)) {
        continue;
      }
      const rel = normalizePackPath(record.path.slice(root.length));
      if (!rel) {
        continue;
      }
      files.set(rel, new Uint8Array(await record.file.arrayBuffer()));
    }

    packs.push({
      sourceId,
      sourceFileName: selection.label,
      displayName: headerName.trim(),
      type: packType,
      headerUuid: headerUuid.trim(),
      headerVersion: normalizeVersion(manifest?.header?.version),
      manifest,
      manifestPath: normalizePackPath(manifestRecord.path.slice(root.length)),
      files,
      preferredFolderName: extractLastRootFolderName(root)
    });
  }
  return packs;
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

function filterDuplicatedPacks(packs, embeddedUuids) {
  const seen = new Set();
  for (const existing of embeddedUuids.values()) {
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

    addWorldPackReference(worldState, pack);
    worldState.embeddedUuids.add(pack.headerUuid.toLowerCase());

    placed.push({
      displayName: pack.displayName,
      targetFolder: folderName
    });
  }

  return placed;
}

function extractLastRootFolderName(root) {
  const normalized = normalizePackPath(root);
  if (!normalized) {
    return null;
  }
  return normalized.split("/").pop() || null;
}

function addWorldPackReference(worldState, pack) {
  const refs = pack.type === "behavior" ? worldState.behaviorRefs : worldState.resourceRefs;
  const key = pack.headerUuid.toLowerCase();
  const alreadyReferenced = refs.some((ref) => (
    ref &&
    typeof ref.pack_id === "string" &&
    ref.pack_id.toLowerCase() === key
  ));
  if (alreadyReferenced) {
    return;
  }
  refs.push({
    pack_id: pack.headerUuid,
    version: pack.headerVersion.slice()
  });
  worldState.referencedUuids.add(key);
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

async function regenerateWorldPackUuids(worldZip, worldState) {
  const manifests = [];
  const headerUuids = new Map();
  const uuidKey = (value) => typeof value === "string" ? value.trim().toLowerCase() : "";

  // Build the complete map first, including retained packs and separate uploads.
  for (const file of Object.values(worldZip.files)) {
    if (file.dir || !/^(behavior_packs|resource_packs)\/[^/]+\/manifest\.json$/i.test(file.name)) {
      continue;
    }
    let manifest;
    try {
      manifest = JSON.parse(await file.async("string"));
    } catch {
      throw new Error(t("error.packManifestInvalid", { label: file.name }));
    }
    const oldUuid = uuidKey(manifest?.header?.uuid);
    if (!oldUuid) {
      throw new Error(t("error.packNoHeader", { label: file.name }));
    }
    if (!headerUuids.has(oldUuid)) {
      headerUuids.set(oldUuid, createPackUuid());
    }
    manifests.push({ path: file.name, manifest, oldUuid });
  }

  for (const { path, manifest, oldUuid } of manifests) {
    manifest.header.uuid = headerUuids.get(oldUuid);
    for (const module of Array.isArray(manifest.modules) ? manifest.modules : []) {
      if (uuidKey(module?.uuid)) {
        module.uuid = createPackUuid();
      }
    }
    for (const dependency of Array.isArray(manifest.dependencies) ? manifest.dependencies : []) {
      // External packs and module_name dependencies retain their identity/version.
      const replacement = headerUuids.get(uuidKey(dependency?.uuid));
      if (replacement && !dependency.module_name) {
        dependency.uuid = replacement;
      }
    }
    worldZip.file(path, `${JSON.stringify(manifest, null, 2)}\n`);
  }

  for (const ref of [...worldState.behaviorRefs, ...worldState.resourceRefs]) {
    const replacement = headerUuids.get(uuidKey(ref?.pack_id));
    if (replacement) {
      ref.pack_id = replacement;
    }
  }
  worldState.embeddedUuids = new Set(headerUuids.values());
  worldState.referencedUuids = new Set(
    [...worldState.behaviorRefs, ...worldState.resourceRefs]
      .map((ref) => uuidKey(ref?.pack_id)).filter(Boolean)
  );
}

function createPackUuid() {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  const bytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"));
  return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10).join("")}`;
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
  lastFocusedBeforeModal = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  nodes.howtoModal.hidden = false;
  nodes.howtoModal.setAttribute("aria-hidden", "false");
  nodes.howtoClose.focus();
}

function hideHowtoModal() {
  if (nodes.howtoModal.hidden) {
    return;
  }
  nodes.howtoModal.hidden = true;
  nodes.howtoModal.setAttribute("aria-hidden", "true");
  lastFocusedBeforeModal?.focus();
  lastFocusedBeforeModal = null;
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

function mergePackFolderSelection(existingSelections, files, expectedType = null) {
  const records = files.map((file) => ({
    path: normalizePackPath(file.webkitRelativePath || file.name),
    size: file.size,
    lastModified: file.lastModified
  })).sort((a, b) => a.path.localeCompare(b.path));
  const label = records[0]?.path.split("/")[0] || t("upload.packFolderFallbackName");
  const totalSize = records.reduce((sum, record) => sum + record.size, 0);
  const latestChange = records.reduce((latest, record) => Math.max(latest, record.lastModified), 0);
  const id = `${label}:${records.length}:${totalSize}:${latestChange}:${records[0]?.path || ""}:${records.at(-1)?.path || ""}`;
  const remaining = existingSelections.filter((selection) => {
    if (selection.id === id) {
      return false;
    }
    return !expectedType || selection.expectedType !== expectedType;
  });
  return [...remaining, { id, label, files, expectedType }];
}

function fileFingerprint(file) {
  return `${file.name}::${file.size}::${file.lastModified}`;
}
