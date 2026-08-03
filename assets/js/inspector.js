import {
  analyzePackRemovals,
  collectPackRoots,
  compareVersions,
  findEntryCaseInsensitive,
  normalizePath,
  normalizeVersion,
  packPrefix,
  parsePackPath,
  parseVersionString
} from "./pack-utils.js";

const CATEGORY_ORDER = ["cleanup", "manifest", "links", "compatibility"];
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const FIXED_STABLE_FORMATS = {
  behavior: {
    animation_controllers: [1, 10, 0],
    animations: [1, 10, 0]
  },
  resource: {
    animation_controllers: [1, 10, 0],
    animations: [1, 10, 0],
    attachables: [1, 10, 0],
    models: [1, 12, 0],
    render_controllers: [1, 10, 0]
  }
};

export function initWorldInspector(options) {
  const { t, formatBytes, maxWorldBytes } = options;
  const state = {
    file: null,
    analysis: null,
    selectedIssueIds: new Set(),
    generatedBlob: null,
    generatedName: "",
    busy: false,
    status: { kind: "idle", key: "inspector.statusIdle", vars: {}, directMessage: "" }
  };

  const nodes = {
    input: document.getElementById("inspector-world-input"),
    pickerBtn: document.getElementById("inspector-world-picker-btn"),
    pickerText: document.getElementById("inspector-world-picker-text"),
    fileInfo: document.getElementById("inspector-world-info"),
    actions: document.getElementById("inspector-actions"),
    repairBtn: document.getElementById("inspector-repair-btn"),
    resetBtn: document.getElementById("inspector-reset-btn"),
    status: document.getElementById("inspector-status-summary"),
    overview: document.getElementById("inspector-overview"),
    results: document.getElementById("inspector-results"),
    downloadBox: document.getElementById("inspector-download-box"),
    downloadBtn: document.getElementById("inspector-download-btn")
  };

  bindEvents();
  refreshFileInfo();
  renderStatus();
  updateActionState();

  return {
    refreshLanguage() {
      refreshFileInfo();
      renderStatus();
      renderAnalysis();
    }
  };

  function bindEvents() {
    nodes.pickerBtn.addEventListener("click", () => nodes.input.click());
    nodes.input.addEventListener("change", () => {
      state.file = nodes.input.files?.[0] || null;
      void analyzeSelectedWorld();
    });
    nodes.results.addEventListener("change", (event) => {
      const input = event.target;
      if (!(input instanceof HTMLInputElement) || !input.dataset.issueId) {
        return;
      }
      if (input.checked) {
        state.selectedIssueIds.add(input.dataset.issueId);
      } else {
        state.selectedIssueIds.delete(input.dataset.issueId);
      }
      clearGeneratedOutput();
      updateActionState();
    });
    nodes.repairBtn.addEventListener("click", () => void repairWorld());
    nodes.resetBtn.addEventListener("click", resetInspector);
    nodes.downloadBtn.addEventListener("click", () => {
      if (state.generatedBlob && state.generatedName) {
        downloadBlob(state.generatedBlob, state.generatedName);
      }
    });
  }

  async function analyzeSelectedWorld() {
    state.analysis = null;
    state.selectedIssueIds = new Set();
    nodes.actions.hidden = true;
    nodes.overview.hidden = true;
    nodes.results.hidden = true;
    clearGeneratedOutput();
    refreshFileInfo();

    if (!state.file) {
      setStatus("idle", "inspector.statusIdle");
      updateActionState();
      return;
    }

    try {
      setBusy(true);
      setStatus("processing", "inspector.statusAnalyzing");
      validateWorldFile(state.file);
      const zip = await loadWorldZip(state.file, t);
      validateWorldZip(zip, t);
      state.analysis = await scanWorld(zip);
      state.selectedIssueIds = new Set(
        state.analysis.issues.filter((issue) => issue.fixable && issue.selectedDefault).map((issue) => issue.id)
      );
      nodes.actions.hidden = false;
      nodes.overview.hidden = false;
      nodes.results.hidden = false;
      renderAnalysis();
      const readyKey = state.analysis.issues.length === 0
        ? "inspector.statusClean"
        : state.analysis.issues.length === 1 ? "inspector.statusReadyOne" : "inspector.statusReady";
      setStatus("success", readyKey, { count: state.analysis.issues.length });
    } catch (error) {
      setStatus("error", null, {}, error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  }

  async function scanWorld(zip) {
    const entries = Object.values(zip.files);
    const issues = [];
    let issueNumber = 0;
    const addIssue = (issue) => {
      issueNumber += 1;
      issues.push({ id: `inspector-issue-${issueNumber}`, selectedDefault: false, actions: [], ...issue });
    };

    for (const removal of analyzePackRemovals(entries)) {
      addIssue({
        category: "cleanup",
        severity: "warning",
        titleKey: removal.type === "folder" ? "inspector.issueRemoveFolder" : "inspector.issueRemoveFile",
        detailKey: removal.type === "folder" ? "inspector.detailRemoveFolder" : "inspector.detailRemoveFile",
        vars: { path: removal.path },
        path: removal.path,
        fixable: true,
        selectedDefault: true,
        actions: [{ kind: "remove", path: removal.path, entryType: removal.type }]
      });
    }

    for (const path of findEmptyPackFolders(entries)) {
      addIssue({
        category: "cleanup",
        severity: "warning",
        titleKey: "inspector.issueEmptyFolder",
        detailKey: "inspector.detailEmptyFolder",
        vars: { path },
        path,
        fixable: true,
        selectedDefault: true,
        actions: [{ kind: "remove", path, entryType: "folder" }]
      });
    }

    const packs = [];
    for (const type of ["behavior", "resource"]) {
      for (const root of collectPackRoots(entries, type).filter((packRoot) => !packRoot.startsWith("."))) {
        const manifestPath = `${packPrefix(type)}/${root}/manifest.json`;
        const manifestEntry = findEntryCaseInsensitive(zip, manifestPath);
        if (!manifestEntry || manifestEntry.dir) {
          addIssue({
            category: "manifest",
            severity: "error",
            titleKey: "inspector.issueMissingManifest",
            detailKey: "inspector.detailMissingManifest",
            vars: { path: manifestPath },
            path: manifestPath,
            fixable: false
          });
          continue;
        }

        let manifest;
        try {
          manifest = JSON.parse(await manifestEntry.async("string"));
        } catch {
          addIssue({
            category: "manifest",
            severity: "error",
            titleKey: "inspector.issueInvalidManifest",
            detailKey: "inspector.detailInvalidJson",
            vars: { path: manifestEntry.name },
            path: manifestEntry.name,
            fixable: false
          });
          continue;
        }

        const header = manifest?.header;
        const rawUuid = typeof header?.uuid === "string" ? header.uuid.trim() : "";
        const uuid = UUID_PATTERN.test(rawUuid) ? rawUuid : "";
        const version = normalizeVersion(header?.version);
        const minEngine = normalizeVersion(header?.min_engine_version);
        const name = typeof header?.name === "string" && header.name.trim() ? header.name.trim() : root;
        const expectedModuleType = type === "behavior" ? "data" : "resources";
        const hasExpectedModule = Array.isArray(manifest?.modules) && manifest.modules.some((module) => (
          typeof module?.type === "string" && module.type.toLowerCase() === expectedModuleType
        ));

        if (manifest?.format_version !== 2) {
          addIssue({
            category: "manifest",
            severity: "warning",
            titleKey: "inspector.issueManifestFormat",
            detailKey: "inspector.detailManifestFormat",
            vars: { path: manifestEntry.name },
            path: manifestEntry.name,
            fixable: true,
            selectedDefault: true,
            actions: [{ kind: "set-manifest-format", path: manifestEntry.name }]
          });
        }
        if (!uuid) {
          addIssue({
            category: "manifest",
            severity: "error",
            titleKey: "inspector.issueInvalidUuid",
            detailKey: "inspector.detailInvalidUuid",
            vars: { name },
            path: manifestEntry.name,
            fixable: false
          });
        }
        if (!version) {
          addIssue({
            category: "manifest",
            severity: "error",
            titleKey: "inspector.issueInvalidPackVersion",
            detailKey: "inspector.detailInvalidPackVersion",
            vars: { name },
            path: manifestEntry.name,
            fixable: false
          });
        }
        if (!minEngine) {
          addIssue({
            category: "manifest",
            severity: "error",
            titleKey: "inspector.issueInvalidEngineVersion",
            detailKey: "inspector.detailInvalidEngineVersion",
            vars: { name },
            path: manifestEntry.name,
            fixable: false
          });
        }
        if (!hasExpectedModule) {
          addIssue({
            category: "manifest",
            severity: "error",
            titleKey: "inspector.issueWrongModule",
            detailKey: "inspector.detailWrongModule",
            vars: { name, type: expectedModuleType },
            path: manifestEntry.name,
            fixable: false
          });
        }

        packs.push({ type, root, name, manifest, manifestPath: manifestEntry.name, uuid, version, minEngine });
      }
    }

    const duplicateUuids = new Map();
    for (const pack of packs.filter((item) => item.uuid)) {
      const key = pack.uuid.toLowerCase();
      const list = duplicateUuids.get(key) || [];
      list.push(pack);
      duplicateUuids.set(key, list);
    }
    for (const [uuid, sameUuidPacks] of duplicateUuids.entries()) {
      if (sameUuidPacks.length > 1) {
        addIssue({
          category: "manifest",
          severity: "error",
          titleKey: "inspector.issueDuplicateUuid",
          detailKey: "inspector.detailDuplicateUuid",
          vars: { uuid, packs: sameUuidPacks.map((pack) => pack.name).join(", ") },
          fixable: false
        });
      }
    }

    await scanJsonAndFormatVersions(zip, packs, addIssue);
    await scanWorldReferences(zip, packs, addIssue);
    scanDependencies(packs, addIssue);
    scanEngineVersions(packs, addIssue);

    if (packs.length === 0) {
      addIssue({
        category: "manifest",
        severity: "recommendation",
        titleKey: "inspector.issueNoPacks",
        detailKey: "inspector.detailNoPacks",
        fixable: false
      });
    }

    return {
      issues,
      packCount: packs.length,
      behaviorCount: packs.filter((pack) => pack.type === "behavior").length,
      resourceCount: packs.filter((pack) => pack.type === "resource").length
    };
  }

  async function scanJsonAndFormatVersions(zip, packs, addIssue) {
    for (const pack of packs) {
      const base = `${packPrefix(pack.type)}/${pack.root}/`;
      const entries = Object.values(zip.files).filter((entry) => (
        !entry.dir
        && normalizePath(entry.name).toLowerCase().startsWith(base.toLowerCase())
        && normalizePath(entry.name).toLowerCase().endsWith(".json")
        && normalizePath(entry.name).toLowerCase() !== normalizePath(pack.manifestPath).toLowerCase()
      ));

      for (const entry of entries) {
        let json;
        try {
          json = JSON.parse(await entry.async("string"));
        } catch {
          addIssue({
            category: "compatibility",
            severity: "error",
            titleKey: "inspector.issueInvalidJson",
            detailKey: "inspector.detailInvalidJson",
            vars: { path: entry.name },
            path: entry.name,
            fixable: false
          });
          continue;
        }

        const rest = normalizePath(entry.name).slice(base.length);
        const definitionType = classifyDefinition(pack.type, rest);
        const hasFormatVersion = Object.prototype.hasOwnProperty.call(json, "format_version");
        if (!hasFormatVersion) {
          if (definitionType) {
            addIssue({
              category: "compatibility",
              severity: "warning",
              titleKey: "inspector.issueMissingFormatVersion",
              detailKey: "inspector.detailMissingFormatVersion",
              vars: { path: entry.name, type: definitionType },
              path: entry.name,
              fixable: false
            });
          }
          continue;
        }

        const formatVersion = parseVersionString(json.format_version);
        if (!formatVersion) {
          addIssue({
            category: "compatibility",
            severity: "error",
            titleKey: "inspector.issueInvalidFormatVersion",
            detailKey: "inspector.detailInvalidFormatVersion",
            vars: { path: entry.name },
            path: entry.name,
            fixable: false
          });
          continue;
        }

        if (pack.minEngine && compareVersions(formatVersion, pack.minEngine) > 0) {
          addIssue({
            category: "compatibility",
            severity: "error",
            titleKey: "inspector.issueFormatAboveEngine",
            detailKey: "inspector.detailFormatAboveEngine",
            vars: {
              path: entry.name,
              format: formatVersion.join("."),
              engine: pack.minEngine.join(".")
            },
            path: entry.name,
            fixable: false
          });
        }

        const stableMinimum = definitionType ? FIXED_STABLE_FORMATS[pack.type]?.[definitionType] : null;
        if (stableMinimum && compareVersions(formatVersion, stableMinimum) < 0) {
          addIssue({
            category: "compatibility",
            severity: "recommendation",
            titleKey: "inspector.issueOldFormatVersion",
            detailKey: "inspector.detailOldFormatVersion",
            vars: {
              path: entry.name,
              format: formatVersion.join("."),
              recommended: stableMinimum.join(".")
            },
            path: entry.name,
            fixable: false
          });
        }
      }
    }
  }

  async function scanWorldReferences(zip, packs, addIssue) {
    for (const type of ["behavior", "resource"]) {
      const path = type === "behavior" ? "world_behavior_packs.json" : "world_resource_packs.json";
      const relevantPacks = packs.filter((pack) => pack.type === type && pack.uuid && pack.version);
      const entry = findEntryCaseInsensitive(zip, path);
      let refs = null;
      if (entry && !entry.dir) {
        try {
          const parsed = JSON.parse(await entry.async("string"));
          if (Array.isArray(parsed)) {
            refs = parsed;
          }
        } catch {
          // Reported below as an invalid reference file.
        }
      }

      if (!refs) {
        if (relevantPacks.length > 0) {
          addIssue({
            category: "links",
            severity: "error",
            titleKey: "inspector.issueInvalidWorldRefs",
            detailKey: "inspector.detailInvalidWorldRefs",
            vars: { path },
            path,
            fixable: true,
            selectedDefault: !entry,
            actions: [{
              kind: "replace-world-refs",
              path,
              refs: relevantPacks.map((pack) => ({ pack_id: pack.uuid, version: pack.version.slice() }))
            }]
          });
        }
        continue;
      }

      const seen = new Set();
      let hasDuplicates = false;
      for (const ref of refs) {
        const uuid = typeof ref?.pack_id === "string" ? ref.pack_id.toLowerCase() : "";
        if (uuid && seen.has(uuid)) {
          hasDuplicates = true;
        }
        if (uuid) {
          seen.add(uuid);
        }
      }
      if (hasDuplicates) {
        addIssue({
          category: "links",
          severity: "warning",
          titleKey: "inspector.issueDuplicateWorldRefs",
          detailKey: "inspector.detailDuplicateWorldRefs",
          vars: { path },
          path,
          fixable: true,
          selectedDefault: true,
          actions: [{ kind: "dedupe-world-refs", path }]
        });
      }

      for (const pack of relevantPacks) {
        const ref = refs.find((item) => typeof item?.pack_id === "string" && item.pack_id.toLowerCase() === pack.uuid.toLowerCase());
        if (!ref) {
          addIssue({
            category: "links",
            severity: "error",
            titleKey: "inspector.issueMissingWorldRef",
            detailKey: "inspector.detailMissingWorldRef",
            vars: { name: pack.name, path },
            path,
            fixable: true,
            selectedDefault: true,
            actions: [{ kind: "add-world-ref", path, uuid: pack.uuid, version: pack.version.slice() }]
          });
          continue;
        }
        const refVersion = normalizeVersion(ref.version);
        if (!refVersion || compareVersions(refVersion, pack.version) !== 0) {
          addIssue({
            category: "links",
            severity: "warning",
            titleKey: "inspector.issueWorldRefVersion",
            detailKey: "inspector.detailWorldRefVersion",
            vars: { name: pack.name, version: pack.version.join(".") },
            path,
            fixable: true,
            selectedDefault: true,
            actions: [{ kind: "update-world-ref", path, uuid: pack.uuid, version: pack.version.slice() }]
          });
        }
      }

      const packUuids = new Set(relevantPacks.map((pack) => pack.uuid.toLowerCase()));
      const staleCount = refs.filter((ref) => (
        typeof ref?.pack_id === "string" && !packUuids.has(ref.pack_id.toLowerCase())
      )).length;
      if (staleCount > 0) {
        addIssue({
          category: "links",
          severity: "warning",
          titleKey: "inspector.issueExternalWorldRefs",
          detailKey: "inspector.detailExternalWorldRefs",
          vars: { count: staleCount, path },
          path,
          fixable: false
        });
      }
    }
  }

  function scanDependencies(packs, addIssue) {
    const validPacks = packs.filter((pack) => pack.uuid && pack.version);
    const packsByUuid = new Map(validPacks.map((pack) => [pack.uuid.toLowerCase(), pack]));
    for (const pack of validPacks) {
      const dependencies = Array.isArray(pack.manifest?.dependencies) ? pack.manifest.dependencies : [];
      for (const dependency of dependencies) {
        if (typeof dependency?.uuid !== "string") {
          continue;
        }
        const counterpart = packsByUuid.get(dependency.uuid.toLowerCase());
        if (!counterpart) {
          addIssue({
            category: "links",
            severity: "warning",
            titleKey: "inspector.issueUnknownDependency",
            detailKey: "inspector.detailUnknownDependency",
            vars: { name: pack.name, uuid: dependency.uuid },
            path: pack.manifestPath,
            fixable: false
          });
          continue;
        }
        const depVersion = normalizeVersion(dependency.version);
        if (!depVersion || compareVersions(depVersion, counterpart.version) !== 0) {
          addIssue({
            category: "links",
            severity: "warning",
            titleKey: "inspector.issueDependencyVersion",
            detailKey: "inspector.detailDependencyVersion",
            vars: { name: pack.name, dependency: counterpart.name, version: counterpart.version.join(".") },
            path: pack.manifestPath,
            fixable: true,
            selectedDefault: true,
            actions: [{
              kind: "update-dependency",
              path: pack.manifestPath,
              uuid: counterpart.uuid,
              version: counterpart.version.slice()
            }]
          });
        }
      }
    }

    const behavior = validPacks.filter((pack) => pack.type === "behavior");
    const resource = validPacks.filter((pack) => pack.type === "resource");
    if (behavior.length === 1 && resource.length === 1) {
      for (const [pack, counterpart] of [[behavior[0], resource[0]], [resource[0], behavior[0]]]) {
        const dependencies = Array.isArray(pack.manifest?.dependencies) ? pack.manifest.dependencies : [];
        const linked = dependencies.some((dependency) => (
          typeof dependency?.uuid === "string" && dependency.uuid.toLowerCase() === counterpart.uuid.toLowerCase()
        ));
        if (!linked) {
          addIssue({
            category: "links",
            severity: "recommendation",
            titleKey: "inspector.issueMissingDependency",
            detailKey: "inspector.detailMissingDependency",
            vars: { name: pack.name, dependency: counterpart.name },
            path: pack.manifestPath,
            fixable: true,
            selectedDefault: false,
            actions: [{
              kind: "add-dependency",
              path: pack.manifestPath,
              uuid: counterpart.uuid,
              version: counterpart.version.slice()
            }]
          });
        }
      }
    } else if (behavior.length > 0 && resource.length > 0) {
      addIssue({
        category: "links",
        severity: "recommendation",
        titleKey: "inspector.issueAmbiguousDependencies",
        detailKey: "inspector.detailAmbiguousDependencies",
        fixable: false
      });
    }
  }

  function scanEngineVersions(packs, addIssue) {
    const withVersions = packs.filter((pack) => pack.minEngine);
    const distinct = new Set(withVersions.map((pack) => pack.minEngine.join(".")));
    if (distinct.size <= 1) {
      return;
    }
    const highest = withVersions.reduce((current, pack) => (
      compareVersions(pack.minEngine, current) > 0 ? pack.minEngine : current
    ), [0, 0, 0]);
    addIssue({
      category: "compatibility",
      severity: "warning",
      titleKey: "inspector.issueEngineMismatch",
      detailKey: "inspector.detailEngineMismatch",
      vars: { versions: Array.from(distinct).join(", "), highest: highest.join(".") },
      fixable: true,
      selectedDefault: false,
      actions: withVersions.map((pack) => ({
        kind: "set-min-engine",
        path: pack.manifestPath,
        version: highest.slice()
      }))
    });
  }

  async function repairWorld() {
    if (!state.analysis || !state.file || state.busy) {
      return;
    }
    const selectedIssues = state.analysis.issues.filter((issue) => state.selectedIssueIds.has(issue.id) && issue.fixable);
    if (selectedIssues.length === 0) {
      return;
    }

    try {
      setBusy(true);
      clearGeneratedOutput();
      setStatus("processing", "inspector.statusRepairing");
      const zip = await loadWorldZip(state.file, t);
      const actions = selectedIssues.flatMap((issue) => issue.actions);
      await applyActions(zip, actions);
      const outputBytes = await zip.generateAsync({
        type: "uint8array",
        compression: "DEFLATE",
        compressionOptions: { level: 6 }
      });
      if (!outputBytes?.byteLength) {
        throw new Error(t("inspector.errorEmptyOutput"));
      }
      state.generatedBlob = new Blob([outputBytes], { type: "application/zip" });
      state.generatedName = makeRepairedName(state.file.name);
      nodes.downloadBox.hidden = false;
      setStatus(
        "success",
        selectedIssues.length === 1 ? "inspector.statusRepairedOne" : "inspector.statusRepaired",
        { count: selectedIssues.length }
      );
    } catch (error) {
      setStatus("error", "inspector.errorRepair", {
        message: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setBusy(false);
    }
  }

  async function applyActions(zip, actions) {
    const mutations = new Map();
    for (const action of actions) {
      if (action.kind === "remove") {
        removeZipPath(zip, action.path, action.entryType);
        continue;
      }
      const list = mutations.get(action.path) || [];
      list.push(action);
      mutations.set(action.path, list);
    }

    for (const [path, pathActions] of mutations.entries()) {
      const existingEntry = findEntryCaseInsensitive(zip, path);
      let json;
      if (pathActions.some((action) => action.kind === "replace-world-refs")) {
        json = [];
      } else if (existingEntry && !existingEntry.dir) {
        json = JSON.parse(await existingEntry.async("string"));
      } else {
        json = [];
      }

      for (const action of pathActions) {
        if (action.kind === "set-manifest-format") {
          json.format_version = 2;
        } else if (action.kind === "set-min-engine") {
          json.header.min_engine_version = action.version.slice();
        } else if (action.kind === "replace-world-refs") {
          json = action.refs.map((ref) => ({ pack_id: ref.pack_id, version: ref.version.slice() }));
        } else if (action.kind === "add-world-ref") {
          if (!json.some((ref) => typeof ref?.pack_id === "string" && ref.pack_id.toLowerCase() === action.uuid.toLowerCase())) {
            json.push({ pack_id: action.uuid, version: action.version.slice() });
          }
        } else if (action.kind === "update-world-ref") {
          const ref = json.find((item) => typeof item?.pack_id === "string" && item.pack_id.toLowerCase() === action.uuid.toLowerCase());
          if (ref) {
            ref.version = action.version.slice();
          }
        } else if (action.kind === "dedupe-world-refs") {
          const seen = new Set();
          json = json.filter((ref) => {
            const uuid = typeof ref?.pack_id === "string" ? ref.pack_id.toLowerCase() : "";
            if (!uuid || seen.has(uuid)) {
              return false;
            }
            seen.add(uuid);
            return true;
          });
        } else if (action.kind === "add-dependency") {
          if (!Array.isArray(json.dependencies)) {
            json.dependencies = [];
          }
          if (!json.dependencies.some((dependency) => (
            typeof dependency?.uuid === "string" && dependency.uuid.toLowerCase() === action.uuid.toLowerCase()
          ))) {
            json.dependencies.push({ uuid: action.uuid, version: action.version.slice() });
          }
        } else if (action.kind === "update-dependency") {
          const dependency = Array.isArray(json.dependencies) ? json.dependencies.find((item) => (
            typeof item?.uuid === "string" && item.uuid.toLowerCase() === action.uuid.toLowerCase()
          )) : null;
          if (dependency) {
            dependency.version = action.version.slice();
          }
        }
      }

      const targetPath = existingEntry?.name || path;
      zip.file(targetPath, `${JSON.stringify(json, null, 2)}\n`);
    }
  }

  function renderAnalysis() {
    nodes.results.innerHTML = "";
    nodes.overview.innerHTML = "";
    if (!state.analysis) {
      return;
    }

    const severityCounts = countBy(state.analysis.issues, (issue) => issue.severity);
    for (const [key, value] of [
      ["inspector.overviewPacks", state.analysis.packCount],
      ["inspector.overviewErrors", severityCounts.error || 0],
      ["inspector.overviewWarnings", (severityCounts.warning || 0) + (severityCounts.recommendation || 0)],
      ["inspector.overviewFixes", state.analysis.issues.filter((issue) => issue.fixable).length]
    ]) {
      const item = document.createElement("div");
      item.className = "inspector-stat";
      const number = document.createElement("strong");
      number.textContent = String(value);
      const label = document.createElement("span");
      label.textContent = t(key);
      item.append(number, label);
      nodes.overview.appendChild(item);
    }

    if (state.analysis.issues.length === 0) {
      const empty = document.createElement("p");
      empty.className = "inspector-empty";
      empty.textContent = t("inspector.noIssues");
      nodes.results.appendChild(empty);
      updateActionState();
      return;
    }

    for (const category of CATEGORY_ORDER) {
      const categoryIssues = state.analysis.issues.filter((issue) => issue.category === category);
      if (categoryIssues.length === 0) {
        continue;
      }
      const section = document.createElement("section");
      section.className = "inspector-group";
      const heading = document.createElement("h3");
      heading.textContent = t(`inspector.category.${category}`);
      section.appendChild(heading);

      for (const issue of categoryIssues) {
        const item = document.createElement("article");
        item.className = `inspector-issue ${issue.severity}`;
        const control = document.createElement(issue.fixable ? "label" : "div");
        control.className = "inspector-issue-control";
        if (issue.fixable) {
          const checkbox = document.createElement("input");
          checkbox.type = "checkbox";
          checkbox.dataset.issueId = issue.id;
          checkbox.checked = state.selectedIssueIds.has(issue.id);
          checkbox.disabled = state.busy;
          control.appendChild(checkbox);
        } else {
          const marker = document.createElement("span");
          marker.className = "inspector-issue-marker";
          marker.setAttribute("aria-hidden", "true");
          marker.textContent = issue.severity === "error" ? "!" : "i";
          control.appendChild(marker);
        }
        const copy = document.createElement("span");
        copy.className = "inspector-issue-copy";
        const title = document.createElement("strong");
        title.textContent = t(issue.titleKey, issue.vars || {});
        const detail = document.createElement("small");
        detail.textContent = t(issue.detailKey, issue.vars || {});
        copy.append(title, detail);
        if (issue.fixable && !issue.selectedDefault) {
          const optional = document.createElement("em");
          optional.textContent = t("inspector.optionalFix");
          copy.appendChild(optional);
        }
        control.appendChild(copy);
        item.appendChild(control);
        section.appendChild(item);
      }
      nodes.results.appendChild(section);
    }
    updateActionState();
  }

  function refreshFileInfo() {
    if (state.file) {
      nodes.pickerText.textContent = state.file.name;
      nodes.fileInfo.textContent = t("inspector.worldSelected", {
        name: state.file.name,
        size: formatBytes(state.file.size)
      });
      nodes.fileInfo.hidden = false;
    } else {
      nodes.pickerText.textContent = t("upload.noWorldChosen");
      nodes.fileInfo.textContent = "";
      nodes.fileInfo.hidden = true;
    }
  }

  function setBusy(busy) {
    state.busy = busy;
    nodes.input.disabled = busy;
    nodes.pickerBtn.disabled = busy;
    nodes.resetBtn.disabled = busy;
    for (const input of nodes.results.querySelectorAll("input")) {
      input.disabled = busy;
    }
    updateActionState();
  }

  function updateActionState() {
    const selectedFixes = state.analysis?.issues.filter((issue) => (
      issue.fixable && state.selectedIssueIds.has(issue.id)
    )).length || 0;
    nodes.repairBtn.disabled = state.busy || selectedFixes === 0;
    nodes.repairBtn.textContent = selectedFixes > 0
      ? t("inspector.repairCount", { count: selectedFixes })
      : t("inspector.repair");
  }

  function setStatus(kind, key, vars = {}, directMessage = "") {
    state.status = { kind, key, vars, directMessage };
    renderStatus();
  }

  function renderStatus() {
    nodes.status.className = "status-summary";
    if (state.status.kind === "error") {
      nodes.status.classList.add("error");
    } else if (state.status.kind === "success") {
      nodes.status.classList.add("success");
    }
    nodes.status.textContent = state.status.directMessage || t(state.status.key, state.status.vars);
  }

  function clearGeneratedOutput() {
    state.generatedBlob = null;
    state.generatedName = "";
    nodes.downloadBox.hidden = true;
  }

  function resetInspector() {
    state.file = null;
    state.analysis = null;
    state.selectedIssueIds = new Set();
    nodes.input.value = "";
    nodes.actions.hidden = true;
    nodes.overview.hidden = true;
    nodes.results.hidden = true;
    nodes.results.innerHTML = "";
    nodes.overview.innerHTML = "";
    clearGeneratedOutput();
    refreshFileInfo();
    setStatus("idle", "inspector.statusIdle");
    updateActionState();
  }

  function validateWorldFile(file) {
    if (!file.name.toLowerCase().endsWith(".mcworld")) {
      throw new Error(t("inspector.errorWorldExtension"));
    }
    if (file.size > maxWorldBytes) {
      throw new Error(t("inspector.errorWorldSize", { limit: formatBytes(maxWorldBytes) }));
    }
  }
}

async function loadWorldZip(file, t) {
  try {
    return await globalThis.JSZip.loadAsync(await file.arrayBuffer());
  } catch {
    throw new Error(t("inspector.errorBadZip"));
  }
}

function validateWorldZip(zip, t) {
  const hasLevelDat = Object.values(zip.files).some((entry) => (
    !entry.dir && normalizePath(entry.name).toLowerCase() === "level.dat"
  ));
  if (!hasLevelDat) {
    throw new Error(t("inspector.errorMissingLevel"));
  }
}

function classifyDefinition(packType, relativePath) {
  const first = normalizePath(relativePath).split("/")[0]?.toLowerCase();
  if (!first) {
    return null;
  }
  const known = packType === "behavior"
    ? new Set([
      "animation_controllers", "animations", "blocks", "cameras", "dialogue", "entities",
      "feature_rules", "features", "items", "recipes", "spawn_rules"
    ])
    : new Set([
      "animation_controllers", "animations", "attachables", "block_culling", "entity", "fogs",
      "items", "models", "particles", "render_controllers"
    ]);
  return known.has(first) ? first : null;
}

function findEmptyPackFolders(entries) {
  const folders = entries
    .filter((entry) => entry.dir)
    .map((entry) => normalizePath(entry.name))
    .filter((path) => parsePackPath(path) && path.split("/").length >= 3);
  const filePaths = entries.filter((entry) => !entry.dir).map((entry) => normalizePath(entry.name).toLowerCase());
  const empty = folders.filter((folder) => {
    const prefix = `${folder.toLowerCase()}/`;
    return !filePaths.some((path) => path.startsWith(prefix));
  });
  return empty.filter((folder) => !empty.some((parent) => (
    parent !== folder && folder.toLowerCase().startsWith(`${parent.toLowerCase()}/`)
  )));
}

function removeZipPath(zip, path, entryType) {
  const normalized = normalizePath(path).toLowerCase();
  for (const entry of Object.values(zip.files)) {
    const entryPath = normalizePath(entry.name).toLowerCase();
    if (entryPath === normalized || (entryType === "folder" && entryPath.startsWith(`${normalized}/`))) {
      zip.remove(entry.name);
    }
  }
}

function countBy(items, selector) {
  const counts = {};
  for (const item of items) {
    const key = selector(item);
    counts[key] = (counts[key] || 0) + 1;
  }
  return counts;
}

function makeRepairedName(name) {
  return name.toLowerCase().endsWith(".mcworld")
    ? `${name.slice(0, -".mcworld".length)}_repaired.mcworld`
    : `${name}_repaired.mcworld`;
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
