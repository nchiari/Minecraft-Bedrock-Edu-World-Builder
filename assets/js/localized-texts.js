// Adapted from nchiari/Minecraft-Localized-Texts (webapp/assets/js/app.js).
// Keep generation independent of the DOM so every output mode can be verified.
export function buildTextOutput({ type, mode, text, key = "", selector = "@a", display = "title" }) {
  if (!text.trim()) return { error: "texts.empty" };
  const localized = mode === "localized";
  const trimmedKey = key.trim();
  if (localized && !/^[A-Za-z0-9_.:-]+$/.test(trimmedKey)) return { error: "texts.invalidKey" };
  const target = selector.trim() || "@a";
  if (type !== "rawtext" && /[\r\n\u0000-\u001f]/.test(target)) return { error: "texts.invalidSelector" };
  const normalizedText = text.replace(/\r\n|\r/g, "\n");
  const component = localized
    ? { translate: trimmedKey, with: { rawtext: [{ text: "\n" }] } }
    : { text: normalizedText };
  const json = JSON.stringify({ rawtext: [component] });
  const command = type === "titleraw"
    ? `/titleraw ${target} ${display} ${json}`
    : type === "tellraw" ? `/tellraw ${target} ${json}` : json;
  return { command, lang: localized ? `${trimmedKey}=${normalizedText.replace(/\n/g, "%1")}` : "" };
}

export function initLocalizedTextsTool({ t }) {
  const node = (id) => document.getElementById(`texts-${id}`);
  let feedback = "";
  let revision = 0;
  const render = () => {
    const localized = node("mode").value === "localized";
    node("target-field").hidden = node("type").value === "rawtext";
    node("display-field").hidden = node("type").value !== "titleraw";
    node("key-field").hidden = !localized;
    node("lang-section").hidden = !localized;
    node("text-label").textContent = t(localized ? "texts.localizedLabel" : "texts.textLabel");
    node("text").placeholder = t("texts.textPlaceholder");
    const result = buildTextOutput({
      type: node("type").value, mode: node("mode").value, text: node("text").value,
      key: node("key").value, selector: node("target").value, display: node("display").value
    });
    node("output").value = result.command || "";
    node("lang-output").value = result.lang || "";
    node("copy").disabled = !result.command;
    node("copy-lang").disabled = !result.lang;
    node("status").textContent = t(result.error || feedback || "texts.ready");
    node("status").classList.toggle("error", Boolean(result.error && result.error !== "texts.empty"));
  };
  const copy = async (id, success) => {
    const field = node(id);
    const value = field.value;
    if (!value) return;
    const copiedRevision = revision;
    try {
      await navigator.clipboard.writeText(value);
      if (revision !== copiedRevision) return;
      feedback = success;
    } catch {
      // Leave the output selected for a keyboard/menu copy if clipboard access fails.
      if (revision !== copiedRevision) return;
      field.focus();
      field.select();
      feedback = "texts.copyFailed";
    }
    render();
  };
  for (const id of ["type", "mode", "target", "display", "key", "text"]) {
    node(id).addEventListener(["type", "mode", "display"].includes(id) ? "change" : "input", () => {
      revision += 1;
      feedback = "";
      render();
    });
  }
  node("copy").addEventListener("click", () => { void copy("output", "texts.copied"); });
  node("copy-lang").addEventListener("click", () => { void copy("lang-output", "texts.langCopied"); });
  node("reset").addEventListener("click", () => {
    revision += 1;
    node("type").value = "rawtext";
    node("mode").value = "direct";
    node("display").value = "title";
    node("target").value = "@a";
    node("key").value = "";
    node("text").value = "";
    feedback = "";
    render();
    node("text").focus();
  });
  return { refreshLanguage: render };
}
