import { Int8, read, write } from "https://cdn.jsdelivr.net/npm/nbtify@2.2.0/+esm";

const CURRENT_EXPERIMENTS = [
  {
    id: "villager_trades_rebalance",
    category: "gameplay",
    titleKey: "experiments.villagerTrades",
    descriptionKey: "experiments.villagerTradesDescription"
  },
  {
    id: "upcoming_creator_features",
    category: "creators",
    titleKey: "experiments.upcomingCreator",
    descriptionKey: "experiments.upcomingCreatorDescription"
  },
  {
    id: "gametest",
    category: "creators",
    titleKey: "experiments.betaApis",
    descriptionKey: "experiments.betaApisDescription"
  },
  {
    id: "experimental_creator_cameras",
    category: "creators",
    titleKey: "experiments.creatorCameras",
    descriptionKey: "experiments.creatorCamerasDescription"
  },
  {
    id: "voxel_shapes",
    category: "creators",
    titleKey: "experiments.voxelShapes",
    descriptionKey: "experiments.voxelShapesDescription"
  },
  {
    id: "custom_projectiles",
    category: "creators",
    titleKey: "experiments.customProjectiles",
    descriptionKey: "experiments.customProjectilesDescription"
  },
  {
    id: "deferred_technical_preview",
    category: "preview",
    titleKey: "experiments.renderDragon",
    descriptionKey: "experiments.renderDragonDescription"
  }
];

const LEGACY_EXPERIMENTS = [
  "y_2025_drop_3",
  "data_driven_biomes",
  "jigsaw_structures",
  "furnace_recipe_book"
];

const METADATA_KEYS = new Set([
  "experiments_ever_used",
  "saved_with_toggled_experiments"
]);

export function initExperimentsTool({ t, formatBytes, maxWorldBytes }) {
  const state = {
    file: null,
    zip: null,
    levelPath: "",
    nbt: null,
    options: [],
    selected: {},
    busy: false,
    generatedBlob: null,
    generatedName: "",
    status: { kind: "idle", key: "experiments.statusIdle", vars: {} }
  };

  const nodes = {
    input: document.getElementById("experiments-world-input"),
    pickerBtn: document.getElementById("experiments-world-picker-btn"),
    pickerText: document.getElementById("experiments-world-picker-text"),
    fileInfo: document.getElementById("experiments-world-info"),
    actions: document.getElementById("experiments-actions"),
    saveBtn: document.getElementById("experiments-save-btn"),
    resetBtn: document.getElementById("experiments-reset-btn"),
    status: document.getElementById("experiments-status-summary"),
    summary: document.getElementById("experiments-summary"),
    list: document.getElementById("experiments-list"),
    downloadBox: document.getElementById("experiments-download-box"),
    downloadBtn: document.getElementById("experiments-download-btn")
  };

  bindEvents();
  render();

  return {
    refreshLanguage() {
      render();
    }
  };

  function bindEvents() {
    nodes.pickerBtn.addEventListener("click", () => nodes.input.click());
    nodes.input.addEventListener("change", () => {
      const file = nodes.input.files?.[0] || null;
      nodes.input.value = "";
      if (file) {
        void loadWorld(file);
      }
    });
    nodes.saveBtn.addEventListener("click", () => void createWorld());
    nodes.resetBtn.addEventListener("click", reset);
    nodes.downloadBtn.addEventListener("click", downloadWorld);
  }

  async function loadWorld(file) {
    reset(false);
    state.file = file;
    setStatus("processing", "experiments.statusReading");
    render();

    try {
      validateFile(file);
      const zip = await globalThis.JSZip.loadAsync(file);
      const levelPath = findLevelDatPath(zip);
      if (!levelPath) {
        throw new Error(t("experiments.errorMissingLevel"));
      }

      const levelBytes = await zip.file(levelPath).async("uint8array");
      const nbt = await read(levelBytes);
      const compound = nbt.data.experiments || {};
      const knownIds = new Set(CURRENT_EXPERIMENTS.map((item) => item.id));
      const detectedIds = Object.keys(compound).filter((id) => !METADATA_KEYS.has(id));
      const extraOptions = detectedIds
        .filter((id) => !knownIds.has(id))
        .map((id) => ({
          id,
          category: LEGACY_EXPERIMENTS.includes(id) ? "legacy" : "detected",
          directTitle: id,
          descriptionKey: LEGACY_EXPERIMENTS.includes(id)
            ? "experiments.legacyDescription"
            : "experiments.detectedDescription"
        }));

      state.zip = zip;
      state.levelPath = levelPath;
      state.nbt = nbt;
      state.options = [...CURRENT_EXPERIMENTS, ...extraOptions];
      state.selected = Object.fromEntries(
        state.options.map((item) => [item.id, tagIsEnabled(compound[item.id])])
      );
      setStatus("success", "experiments.statusReady", {
        count: Object.values(state.selected).filter(Boolean).length
      });
    } catch (error) {
      state.zip = null;
      state.nbt = null;
      state.options = [];
      setStatus("error", "experiments.errorRead", { message: errorMessage(error) });
    }

    render();
  }

  function validateFile(file) {
    const lowerName = file.name.toLowerCase();
    if (!lowerName.endsWith(".mcworld") && !lowerName.endsWith(".zip")) {
      throw new Error(t("experiments.errorExtension"));
    }
    if (file.size > maxWorldBytes) {
      throw new Error(t("experiments.errorSize", { limit: formatBytes(maxWorldBytes) }));
    }
  }

  function findLevelDatPath(zip) {
    if (zip.file("level.dat")) {
      return "level.dat";
    }

    const candidates = Object.keys(zip.files)
      .filter((path) => !zip.files[path].dir && path.toLowerCase().endsWith("/level.dat"))
      .sort((a, b) => a.split("/").length - b.split("/").length || a.localeCompare(b));
    return candidates[0] || "";
  }

  async function createWorld() {
    if (!state.zip || !state.nbt || state.busy) {
      return;
    }

    state.busy = true;
    clearGeneratedOutput();
    setStatus("processing", "experiments.statusWriting");
    render();

    try {
      const compound = state.nbt.data.experiments || {};
      state.nbt.data.experiments = compound;

      for (const option of state.options) {
        if (state.selected[option.id]) {
          compound[option.id] = new Int8(1);
        } else {
          delete compound[option.id];
        }
      }

      const hasEnabledExperiment = Object.keys(compound)
        .filter((id) => !METADATA_KEYS.has(id))
        .some((id) => tagIsEnabled(compound[id]));
      compound.experiments_ever_used = new Int8(Number(hasEnabledExperiment));
      compound.saved_with_toggled_experiments = new Int8(Number(hasEnabledExperiment));

      const levelBytes = await write(state.nbt, { endian: "little" });
      state.zip.file(state.levelPath, levelBytes);
      const blob = await state.zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: { level: 6 }
      });
      if (!blob.size) {
        throw new Error(t("experiments.errorEmptyOutput"));
      }

      state.generatedBlob = blob;
      state.generatedName = outputName(state.file.name);
      setStatus("success", "experiments.statusSuccess", {
        count: Object.values(state.selected).filter(Boolean).length
      });
    } catch (error) {
      setStatus("error", "experiments.errorWrite", { message: errorMessage(error) });
    } finally {
      state.busy = false;
      render();
    }
  }

  function render() {
    nodes.pickerText.textContent = state.file?.name || t("upload.noWorldChosen");
    nodes.fileInfo.hidden = !state.file;
    nodes.fileInfo.textContent = state.file
      ? t("experiments.worldSelected", { name: state.file.name, size: formatBytes(state.file.size) })
      : "";
    nodes.status.className = "status-summary";
    if (state.status.kind === "error") {
      nodes.status.classList.add("error");
    } else if (state.status.kind === "success") {
      nodes.status.classList.add("success");
    }
    nodes.status.textContent = t(state.status.key, state.status.vars);
    nodes.actions.hidden = !state.nbt;
    nodes.saveBtn.disabled = !state.nbt || state.busy;
    nodes.list.hidden = !state.nbt;
    nodes.summary.hidden = !state.nbt;
    nodes.downloadBox.hidden = !state.generatedBlob;

    if (state.nbt) {
      const enabled = Object.values(state.selected).filter(Boolean).length;
      nodes.summary.textContent = t("experiments.summary", {
        enabled,
        total: state.options.length,
        version: "1.26.30"
      });
      renderOptions();
    } else {
      nodes.summary.textContent = "";
      nodes.list.replaceChildren();
    }
  }

  function renderOptions() {
    const groups = ["gameplay", "creators", "preview", "legacy", "detected"];
    nodes.list.replaceChildren();

    for (const category of groups) {
      const options = state.options.filter((item) => item.category === category);
      if (!options.length) {
        continue;
      }

      const section = document.createElement("section");
      section.className = "experiments-group";
      const heading = document.createElement("h3");
      heading.textContent = t(`experiments.category.${category}`);
      section.appendChild(heading);

      for (const option of options) {
        const label = document.createElement("label");
        label.className = "experiment-option";
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = Boolean(state.selected[option.id]);
        checkbox.disabled = state.busy;
        checkbox.addEventListener("change", () => {
          state.selected[option.id] = checkbox.checked;
          clearGeneratedOutput();
          setStatus("success", "experiments.statusReady", {
            count: Object.values(state.selected).filter(Boolean).length
          });
          render();
        });

        const copy = document.createElement("span");
        const title = document.createElement("strong");
        title.textContent = option.directTitle || t(option.titleKey);
        const description = document.createElement("small");
        description.textContent = t(option.descriptionKey);
        const id = document.createElement("code");
        id.textContent = option.id;
        copy.append(title, description, id);
        label.append(checkbox, copy);
        section.appendChild(label);
      }
      nodes.list.appendChild(section);
    }
  }

  function setStatus(kind, key, vars = {}) {
    state.status = { kind, key, vars };
  }

  function clearGeneratedOutput() {
    state.generatedBlob = null;
    state.generatedName = "";
  }

  function reset(clearInput = true) {
    state.file = null;
    state.zip = null;
    state.levelPath = "";
    state.nbt = null;
    state.options = [];
    state.selected = {};
    state.busy = false;
    clearGeneratedOutput();
    setStatus("idle", "experiments.statusIdle");
    if (clearInput) {
      nodes.input.value = "";
    }
    render();
  }

  function downloadWorld() {
    if (!state.generatedBlob || !state.generatedName) {
      return;
    }
    const url = URL.createObjectURL(state.generatedBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = state.generatedName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

function tagIsEnabled(tag) {
  if (tag === undefined || tag === null) {
    return false;
  }
  try {
    return Number(tag.valueOf()) === 1;
  } catch {
    return false;
  }
}

function outputName(name) {
  return name.replace(/\.(?:mcworld|zip)$/i, "") + "_experiments.mcworld";
}

function errorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}
