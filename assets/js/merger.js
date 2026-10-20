import { normalizePath } from "./pack-utils.js";

// Extraction is shared with the world compiler; inputs are never mutated.
export async function buildMergedAddon(packs, { regenerate, createUuid, t }) {
  const unique = new Map();
  let skipped = 0;
  for (const pack of packs) {
    const key = pack.headerUuid.toLowerCase();
    const previous = unique.get(key);
    if (previous) {
      const identical = previous.files.size === pack.files.size && [...pack.files].every(([path, bytes]) => {
        const other = previous.files.get(path);
        return other && bytes.length === other.length && bytes.every((byte, index) => byte === other[index]);
      });
      if (!identical) throw new Error(t("merger.conflict", { name: pack.displayName, uuid: pack.headerUuid }));
      skipped += 1;
    } else {
      unique.set(key, pack);
    }
  }
  if (!unique.size) throw new Error(t("merger.empty"));
  const replacements = new Map([...unique.keys()].map((key) => [key, regenerate ? createUuid() : key]));
  const outer = new globalThis.JSZip();
  let index = 0;
  for (const pack of unique.values()) {
    const zip = new globalThis.JSZip();
    for (const [path, bytes] of pack.files) zip.file(normalizePath(path), bytes);
    if (regenerate) {
      const manifest = structuredClone(pack.manifest);
      manifest.header.uuid = replacements.get(pack.headerUuid.toLowerCase());
      for (const module of manifest.modules) module.uuid = createUuid();
      for (const dependency of manifest.dependencies || []) {
        const replacement = replacements.get(dependency.uuid?.trim().toLowerCase());
        if (replacement && !dependency.module_name) dependency.uuid = replacement;
      }
      zip.file(pack.manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
    }
    outer.file(`${pack.type === "behavior" ? "bp" : "rp"}${index++}.mcpack`, await zip.generateAsync({ type: "uint8array", compression: "DEFLATE" }));
  }
  return { blob: await outer.generateAsync({ type: "blob", compression: "STORE" }), packs: [...unique.values()], skipped };
}

export function initMergerTool({ t, formatBytes, maxPacksBytes, extractPacks, createUuid, downloadBlob }) {
  const node = (id) => document.getElementById(`merger-${id}`);
  const state = { files: [], busy: false, blob: null, name: "", packs: [], status: "merger.idle", vars: {} };
  const render = () => {
    node("picker-text").textContent = t(state.files.length ? "merger.selected" : "upload.noPacksChosen", { count: state.files.length });
    node("picker").textContent = t(state.files.length ? "upload.addMorePacks" : "upload.choosePacks");
    node("list").replaceChildren();
    state.files.forEach((file, index) => {
      const li = document.createElement("li");
      li.className = "attached-file";
      const label = document.createElement("span");
      label.textContent = `${file.name} · ${formatBytes(file.size)}`;
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "file-remove";
      remove.textContent = "×";
      remove.setAttribute("aria-label", t("merger.remove", { name: file.name }));
      remove.disabled = state.busy;
      remove.onclick = () => { state.files.splice(index, 1); render(); };
      li.append(label, remove);
      node("list").append(li);
    });
    node("list").hidden = !state.files.length;
    node("status").textContent = t(state.status, state.vars);
    node("results").replaceChildren();
    for (const pack of state.packs) {
      const li = document.createElement("li");
      li.textContent = `${pack.displayName} · ${t(`packType.${pack.type}`)} · ${pack.headerVersion.join(".")}`;
      node("results").append(li);
    }
    node("results").hidden = !state.packs.length;
    node("create").disabled = state.busy || !state.files.length;
    for (const id of ["input", "picker", "reset", "regenerate"]) node(id).disabled = state.busy;
    node("download-box").hidden = !state.blob;
  };
  node("picker").onclick = () => node("input").click();
  node("input").onchange = () => {
    state.files.push(...node("input").files);
    node("input").value = "";
    render();
  };
  node("reset").onclick = () => {
    Object.assign(state, { files: [], blob: null, packs: [], status: "merger.idle", vars: {} });
    node("input").value = "";
    node("regenerate").checked = true;
    render();
  };
  node("download").onclick = () => downloadBlob(state.blob, state.name);
  node("create").onclick = async () => {
    state.busy = true;
    state.status = "merger.working";
    state.vars = {};
    render();
    try {
      if (state.files.reduce((total, file) => total + file.size, 0) > maxPacksBytes) throw new Error(t("merger.size"));
      const result = await buildMergedAddon(await extractPacks(state.files, []), { regenerate: node("regenerate").checked, createUuid, t });
      state.blob = result.blob;
      state.name = `${state.files[0].name.replace(/\.(mcpack|mcaddon)$/i, "")}_merged.mcaddon`;
      state.packs = result.packs;
      state.status = "merger.success";
      state.vars = { count: result.packs.length, skipped: result.skipped };
      state.files = [];
      node("regenerate").checked = true;
    } catch (error) {
      state.status = "merger.error";
      state.vars = { message: error.message };
    } finally {
      state.busy = false;
      render();
    }
    if (state.status === "merger.success") {
      node("download-box").scrollIntoView({ block: "nearest" });
      node("download").focus({ preventScroll: true });
    }
  };
  render();
  return { refreshLanguage: render };
}
