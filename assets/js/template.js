import {
  analyzePackRemovals,
  collectPackRoots,
  fileExtension,
  findEntryCaseInsensitive,
  findHiddenPackFolder,
  isAllowedPackFile,
  maxVersion,
  normalizePath,
  normalizeVersion,
  packPrefix,
  parsePackPath
} from "./pack-utils.js";

const DEFAULT_BASE_GAME_VERSION = [1, 21, 90];
const LOCALIZATION_LIMITS = {
  name: 30,
  description: 200
};

export function initTemplateTool(options) {
  const { t, formatBytes, maxWorldBytes } = options;
  const state = {
    file: null,
    analysis: null,
    localizations: new Map(),
    generatedBlob: null,
    generatedName: "",
    busy: false,
    status: { kind: "idle", key: "template.statusIdle", vars: {} }
  };

  const nodes = {
    worldInput: document.getElementById("template-world-input"),
    worldPickerBtn: document.getElementById("template-world-picker-btn"),
    worldPickerText: document.getElementById("template-world-picker-text"),
    worldInfo: document.getElementById("template-world-info"),
    metadata: document.getElementById("template-metadata"),
    authors: document.getElementById("template-authors"),
    languageFields: document.getElementById("template-language-fields"),
    createBtn: document.getElementById("template-create-btn"),
    resetBtn: document.getElementById("template-reset-btn"),
    statusSummary: document.getElementById("template-status-summary"),
    analysis: document.getElementById("template-analysis"),
    downloadBox: document.getElementById("template-download-box"),
    downloadBtn: document.getElementById("template-download-btn")
  };

  bindEvents();
  renderStatus();
  refreshFileInfo();
  updateActionState();

  return {
    refreshLanguage() {
      refreshFileInfo();
      renderLanguageFields();
      renderAnalysis();
      renderStatus();
    }
  };

  function bindEvents() {
    nodes.worldPickerBtn.addEventListener("click", () => nodes.worldInput.click());
    nodes.worldInput.addEventListener("change", () => {
      state.file = nodes.worldInput.files?.[0] || null;
      void analyzeSelectedWorld();
    });

    nodes.authors.addEventListener("input", () => {
      clearGeneratedOutput();
      updateActionState();
    });

    nodes.languageFields.addEventListener("input", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) {
        return;
      }
      const language = target.dataset.language;
      const field = target.dataset.field;
      const values = state.localizations.get(language);
      if (!values || (field !== "name" && field !== "description")) {
        return;
      }
      values[field] = target.value;
      const count = document.getElementById(`${target.id}-count`);
      if (count) {
        count.textContent = `${target.value.length}/${LOCALIZATION_LIMITS[field]}`;
      }
      clearGeneratedOutput();
      updateActionState();
    });

    nodes.createBtn.addEventListener("click", () => void createTemplate());
    nodes.resetBtn.addEventListener("click", resetTemplateTool);
    nodes.downloadBtn.addEventListener("click", () => {
      if (state.generatedBlob && state.generatedName) {
        downloadBlob(state.generatedBlob, state.generatedName);
      }
    });
  }

  async function analyzeSelectedWorld() {
    state.analysis = null;
    state.localizations = new Map();
    nodes.metadata.hidden = true;
    nodes.analysis.hidden = true;
    nodes.languageFields.innerHTML = "";
    clearGeneratedOutput();
    refreshFileInfo();

    if (!state.file) {
      setStatus("idle", "template.statusIdle");
      updateActionState();
      return;
    }

    try {
      setBusy(true);
      setStatus("processing", "template.statusAnalyzing");
      validateWorldFile(state.file);

      const bytes = await state.file.arrayBuffer();
      let worldZip;
      try {
        worldZip = await globalThis.JSZip.loadAsync(bytes);
      } catch {
        throw new Error(t("template.errorBadZip"));
      }

      const entries = Object.values(worldZip.files);
      const hasLevelDat = entries.some((entry) => !entry.dir && normalizePath(entry.name).toLowerCase() === "level.dat");
      if (!hasLevelDat) {
        throw new Error(t("template.errorMissingLevel"));
      }

      const behaviorRoots = collectPackRoots(entries, "behavior").filter((root) => hasPackManifest(entries, "behavior", root));
      const resourceRoots = collectPackRoots(entries, "resource").filter((root) => hasPackManifest(entries, "resource", root));
      const mappings = [
        ...behaviorRoots.map((root, index) => ({ type: "behavior", from: root, to: `bp${index}` })),
        ...resourceRoots.map((root, index) => ({ type: "resource", from: root, to: `rp${index}` }))
      ];

      const versions = [];
      for (const mapping of mappings) {
        const manifestPath = `${packPrefix(mapping.type)}/${mapping.from}/manifest.json`;
        const manifestEntry = findEntryCaseInsensitive(worldZip, manifestPath);
        if (!manifestEntry || manifestEntry.dir) {
          throw new Error(t("template.errorPackManifest", { path: manifestPath }));
        }
        try {
          const manifest = JSON.parse(await manifestEntry.async("string"));
          const version = normalizeVersion(manifest?.header?.min_engine_version);
          if (version) {
            versions.push(version);
          }
        } catch {
          throw new Error(t("template.errorPackManifest", { path: manifestPath }));
        }
      }

      const detectedLanguages = detectResourcePackLanguages(entries);
      const usedFallbackLanguage = detectedLanguages.length === 0;
      const languages = usedFallbackLanguage ? ["en_US"] : detectedLanguages;
      const removals = analyzePackRemovals(entries);

      state.analysis = {
        worldZip,
        behaviorRoots,
        resourceRoots,
        mappings,
        baseGameVersion: versions.length > 0 ? versions.reduce(maxVersion) : DEFAULT_BASE_GAME_VERSION.slice(),
        usedFallbackVersion: versions.length === 0,
        languages,
        usedFallbackLanguage,
        hasJavascript: entries.some((entry) => (
          !entry.dir &&
          normalizePath(entry.name).toLowerCase().startsWith("behavior_packs/") &&
          fileExtension(entry.name) === "js"
        )),
        removals
      };

      state.localizations = new Map(languages.map((language) => [language, { name: "", description: "" }]));
      nodes.metadata.hidden = false;
      nodes.analysis.hidden = false;
      renderLanguageFields();
      renderAnalysis();
      setStatus("success", "template.statusReady");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setStatus("error", null, {}, message);
    } finally {
      setBusy(false);
    }
  }

  function validateWorldFile(file) {
    if (!file.name.toLowerCase().endsWith(".mcworld")) {
      throw new Error(t("template.errorWorldExtension"));
    }
    if (file.size > maxWorldBytes) {
      throw new Error(t("template.errorWorldSize", { limit: formatBytes(maxWorldBytes) }));
    }
  }

  async function createTemplate() {
    if (!state.analysis || state.busy) {
      return;
    }

    const authors = parseAuthors(nodes.authors.value);
    if (authors.length === 0) {
      setStatus("error", "template.errorAuthors");
      return;
    }
    if (!allLocalizationsComplete()) {
      setStatus("error", "template.errorLocalization");
      return;
    }
    if (!allLocalizationsWithinLimits()) {
      setStatus("error", "template.errorLocalizationLength");
      return;
    }

    try {
      setBusy(true);
      clearGeneratedOutput();
      setStatus("processing", "template.statusBuilding");

      const outputZip = new globalThis.JSZip();
      await copyWorldContent(outputZip, state.analysis);

      const templateModule = {
        version: [1, 0, 0],
        type: "world_template",
        uuid: createUuid()
      };
      if (state.analysis.hasJavascript) {
        templateModule.language = "javascript";
      }

      const manifest = {
        header: {
          name: "pack.name",
          description: "pack.description",
          lock_template_options: false,
          base_game_version: state.analysis.baseGameVersion.slice(),
          version: [1, 0, 0],
          uuid: createUuid()
        },
        metadata: { authors },
        modules: [templateModule],
        format_version: 2
      };

      outputZip.file("manifest.json", `${JSON.stringify(manifest, null, 2)}\n`);
      outputZip.file("texts/languages.json", `${JSON.stringify(state.analysis.languages)}\n`);
      for (const language of state.analysis.languages) {
        const values = state.localizations.get(language);
        const langText = [
          `pack.name=${singleLine(values.name)}`,
          `pack.description=${singleLine(values.description)}`,
          ""
        ].join("\n");
        outputZip.file(`texts/${language}.lang`, langText);
      }

      const outputBytes = await outputZip.generateAsync({
        type: "uint8array",
        compression: "DEFLATE",
        compressionOptions: { level: 6 }
      });
      if (!outputBytes?.byteLength) {
        throw new Error("empty-output");
      }

      state.generatedBlob = new Blob([outputBytes], { type: "application/zip" });
      state.generatedName = makeTemplateName(state.file.name);
      nodes.downloadBox.hidden = false;
      setStatus("success", "template.statusSuccess");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setStatus("error", "template.errorBuild", { message });
    } finally {
      setBusy(false);
    }
  }

  async function copyWorldContent(outputZip, analysis) {
    const entries = Object.values(analysis.worldZip.files);
    for (const entry of entries) {
      const path = normalizePath(entry.name);
      if (!path || entry.dir) {
        continue;
      }
      const lower = path.toLowerCase();
      if (lower === "manifest.json" || lower === "texts" || lower.startsWith("texts/")) {
        continue;
      }

      const packInfo = parsePackPath(path);
      if (packInfo) {
        if (findHiddenPackFolder(path) || !isAllowedPackFile(path)) {
          continue;
        }
        const mapping = analysis.mappings.find((item) => (
          item.type === packInfo.type && item.from.toLowerCase() === packInfo.root.toLowerCase()
        ));
        if (!mapping) {
          continue;
        }
        const base = `${packPrefix(packInfo.type)}/${mapping.to}`;
        const targetPath = packInfo.rest ? `${base}/${packInfo.rest}` : base;
        outputZip.file(targetPath, await entry.async("uint8array"));
        continue;
      }

      outputZip.file(path, await entry.async("uint8array"));
    }
  }

  function renderLanguageFields() {
    nodes.languageFields.innerHTML = "";
    for (const [language, values] of state.localizations.entries()) {
      const card = document.createElement("section");
      card.className = "template-language-card";

      const heading = document.createElement("h4");
      const languageName = document.createElement("span");
      languageName.textContent = formatLanguageName(language);
      const languageCode = document.createElement("small");
      languageCode.textContent = language;
      heading.append(languageName, languageCode);
      card.appendChild(heading);

      const fields = document.createElement("div");
      fields.className = "template-language-fields";
      fields.appendChild(makeLocalizedField(language, "name", values.name, false));
      fields.appendChild(makeLocalizedField(language, "description", values.description, true));
      card.appendChild(fields);
      nodes.languageFields.appendChild(card);
    }
  }

  function makeLocalizedField(language, field, value, multiline) {
    const wrapper = document.createElement("div");
    wrapper.className = "localized-field";
    const id = `template-${field}-${language}`;
    const labelRow = document.createElement("div");
    labelRow.className = "localized-field-label";
    const label = document.createElement("label");
    label.htmlFor = id;
    label.textContent = t(field === "name" ? "template.nameLabel" : "template.descriptionLabel");
    const count = document.createElement("span");
    count.id = `${id}-count`;
    count.className = "character-count";
    count.textContent = `${value.length}/${LOCALIZATION_LIMITS[field]}`;
    labelRow.append(label, count);
    wrapper.appendChild(labelRow);

    const input = document.createElement(multiline ? "textarea" : "input");
    input.id = id;
    input.className = multiline ? "text-area" : "text-input";
    input.value = value;
    input.dataset.language = language;
    input.dataset.field = field;
    input.disabled = state.busy;
    input.maxLength = LOCALIZATION_LIMITS[field];
    input.setAttribute("aria-describedby", count.id);
    input.placeholder = t(field === "name" ? "template.namePlaceholder" : "template.descriptionPlaceholder");
    wrapper.appendChild(input);
    return wrapper;
  }

  function renderAnalysis() {
    nodes.analysis.innerHTML = "";
    if (!state.analysis) {
      return;
    }

    addAnalysisItem(
      "template.analysisPacksTitle",
      t("template.analysisPacks", {
        bp: state.analysis.behaviorRoots.length,
        rp: state.analysis.resourceRoots.length
      })
    );

    const renameText = state.analysis.mappings.length > 0
      ? state.analysis.mappings.map((mapping) => `${packPrefix(mapping.type)}/${mapping.from} → ${mapping.to}`).join("\n")
      : "—";
    addAnalysisItem("template.analysisRenameTitle", renameText);

    const versionKey = state.analysis.usedFallbackVersion
      ? "template.analysisVersionFallback"
      : "template.analysisVersion";
    addAnalysisItem(
      "template.analysisVersionTitle",
      t(versionKey, { version: state.analysis.baseGameVersion.join(".") }),
      state.analysis.usedFallbackVersion ? "warn" : ""
    );

    addAnalysisItem(
      "template.analysisLanguagesTitle",
      t("template.analysisLanguages", { languages: state.analysis.languages.map(formatLanguageLabel).join(", ") })
    );
    if (state.analysis.usedFallbackLanguage) {
      addAnalysisItem("template.analysisLanguagesTitle", t("template.analysisFallbackLanguage"), "warn");
    }

    addAnalysisItem(
      "template.analysisJavascriptTitle",
      t(state.analysis.hasJavascript ? "template.analysisJavascriptYes" : "template.analysisJavascriptNo")
    );

    const removed = state.analysis.removals;
    const item = addAnalysisItem(
      "template.analysisRemovedTitle",
      removed.length > 0
        ? t("template.analysisRemovedMixedCount", { count: removed.length })
        : t("template.analysisRemovedNone"),
      removed.length > 0 ? "warn" : ""
    );
    if (removed.length > 0) {
      const list = document.createElement("ul");
      list.className = "template-analysis-files";
      for (const removal of removed) {
        const li = document.createElement("li");
        li.textContent = removal.type === "folder"
          ? t("template.analysisRemovedFolder", { path: removal.path })
          : removal.path;
        list.appendChild(li);
      }
      item.appendChild(list);
    }
  }

  function addAnalysisItem(titleKey, body, className = "") {
    const item = document.createElement("section");
    item.className = `template-analysis-item${className ? ` ${className}` : ""}`;
    const title = document.createElement("strong");
    title.textContent = t(titleKey);
    const text = document.createElement("p");
    text.textContent = body;
    text.style.whiteSpace = "pre-line";
    item.append(title, text);
    nodes.analysis.appendChild(item);
    return item;
  }

  function resetTemplateTool() {
    state.file = null;
    state.analysis = null;
    state.localizations = new Map();
    state.generatedBlob = null;
    state.generatedName = "";
    nodes.worldInput.value = "";
    nodes.authors.value = "";
    nodes.metadata.hidden = true;
    nodes.analysis.hidden = true;
    nodes.analysis.innerHTML = "";
    nodes.languageFields.innerHTML = "";
    clearGeneratedOutput();
    refreshFileInfo();
    setStatus("idle", "template.statusIdle");
    updateActionState();
  }

  function refreshFileInfo() {
    if (state.file) {
      nodes.worldInfo.hidden = false;
      nodes.worldPickerText.textContent = state.file.name;
      nodes.worldInfo.textContent = t("template.worldSelected", {
        name: state.file.name,
        size: formatBytes(state.file.size)
      });
    } else {
      nodes.worldPickerText.textContent = t("upload.noWorldChosen");
      nodes.worldInfo.textContent = "";
      nodes.worldInfo.hidden = true;
    }
  }

  function setBusy(busy) {
    state.busy = busy;
    nodes.worldInput.disabled = busy;
    nodes.worldPickerBtn.disabled = busy;
    nodes.authors.disabled = busy;
    nodes.resetBtn.disabled = busy;
    for (const input of nodes.languageFields.querySelectorAll("input, textarea")) {
      input.disabled = busy;
    }
    updateActionState();
  }

  function updateActionState() {
    nodes.createBtn.disabled = state.busy
      || !state.analysis
      || parseAuthors(nodes.authors.value).length === 0
      || !allLocalizationsComplete()
      || !allLocalizationsWithinLimits();
  }

  function allLocalizationsComplete() {
    return state.localizations.size > 0 && Array.from(state.localizations.values()).every((values) => (
      values.name.trim() && values.description.trim()
    ));
  }

  function allLocalizationsWithinLimits() {
    return Array.from(state.localizations.values()).every((values) => (
      values.name.length <= LOCALIZATION_LIMITS.name
      && values.description.length <= LOCALIZATION_LIMITS.description
    ));
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

  function clearGeneratedOutput() {
    state.generatedBlob = null;
    state.generatedName = "";
    nodes.downloadBox.hidden = true;
  }
}

function formatLanguageName(code) {
  const [languageCode, regionCode] = String(code).replace("-", "_").split("_");
  try {
    const locale = document.documentElement.lang || "en";
    const languageNames = new Intl.DisplayNames([locale], { type: "language" });
    const languageName = languageNames.of(languageCode) || languageCode;
    if (!regionCode) {
      return languageName;
    }
    const regionNames = new Intl.DisplayNames([locale], { type: "region" });
    return `${languageName} — ${regionNames.of(regionCode) || regionCode}`;
  } catch {
    return code;
  }
}

function formatLanguageLabel(code) {
  const name = formatLanguageName(code);
  return name === code ? code : `${name} (${code})`;
}

function detectResourcePackLanguages(entries) {
  const languages = new Set();
  for (const entry of entries) {
    if (entry.dir) {
      continue;
    }
    const parts = normalizePath(entry.name).split("/");
    if (
      parts.length === 4 &&
      parts[0].toLowerCase() === "resource_packs" &&
      parts[2].toLowerCase() === "texts" &&
      parts[3].toLowerCase().endsWith(".lang")
    ) {
      const language = parts[3].slice(0, -".lang".length);
      if (/^[A-Za-z]{2,3}_[A-Za-z0-9]{2,4}$/.test(language)) {
        languages.add(language);
      }
    }
  }
  return Array.from(languages).sort((a, b) => a.localeCompare(b));
}

function hasPackManifest(entries, type, root) {
  const wanted = `${packPrefix(type)}/${root}/manifest.json`.toLowerCase();
  return entries.some((entry) => !entry.dir && normalizePath(entry.name).toLowerCase() === wanted);
}

function parseAuthors(value) {
  const seen = new Set();
  const authors = [];
  for (const author of String(value).split(",").map((part) => part.trim()).filter(Boolean)) {
    if (!seen.has(author)) {
      seen.add(author);
      authors.push(author);
    }
  }
  return authors;
}

function singleLine(value) {
  return String(value).replace(/[\r\n]+/g, " ").trim();
}

function createUuid() {
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

function makeTemplateName(worldName) {
  return worldName.toLowerCase().endsWith(".mcworld")
    ? `${worldName.slice(0, -".mcworld".length)}.mctemplate`
    : `${worldName}.mctemplate`;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
