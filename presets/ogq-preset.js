(function initializeOgqPreset() {
  "use strict";
  const engine = window.ImageToolkitEngine;
  const input = document.querySelector("#ogq-input");
  const dropZone = document.querySelector("#ogq-drop-zone");
  const status = document.querySelector("#ogq-status");
  const results = document.querySelector("#ogq-results");
  const zipButton = document.querySelector("#ogq-zip");
  let files = [];
  let outputs = [];
  const presets = {
    standard: { width: 740, height: 640, margin: 40, suffix: "ogq" },
    main: { width: 240, height: 240, margin: 12, fixedName: "main.png" },
    tab: { width: 96, height: 74, margin: 4, fixedName: "tab.png" },
  };
  const text = (ko, en) => document.documentElement.lang === "en" ? en : ko;
  const baseName = (name) => { const dot = name.lastIndexOf("."); return (dot > 0 ? name.slice(0, dot) : name).trim() || "image"; };

  function setStatus(message, kind = "") { status.textContent = message; status.className = `tool-status ${kind}`; }
  function select(fileList) {
    files = Array.from(fileList).slice(0, 30).filter((file) => {
      try { engine.validateFile(file); return true; } catch (error) { return false; }
    });
    outputs = [];
    results.innerHTML = "";
    zipButton.disabled = true;
    setStatus(files.length ? text(`${files.length}개 이미지가 준비되었습니다.`, `${files.length} images are ready.`) : text("지원되는 이미지를 선택하세요.", "Choose a supported image."), files.length ? "success" : "error");
    document.querySelectorAll("[data-preset]").forEach((button) => { button.disabled = !files.length; });
  }

  async function processPreset(key) {
    const preset = presets[key];
    outputs = [];
    results.innerHTML = "";
    document.querySelectorAll("[data-preset]").forEach((button) => { button.disabled = true; });
    try {
      for (let index = 0; index < files.length; index += 1) {
        const file = files[index];
        setStatus(text(`${index + 1}/${files.length} 처리 중…`, `Processing ${index + 1}/${files.length}…`), "working");
        let processed = await engine.fitVisibleArtwork(file, preset);
        if (document.querySelector("#ogq-outline").checked) {
          const url = URL.createObjectURL(processed.blob);
          try {
            processed = await window.ImageToolkitOutlineEngine.createOutlinedPngBlob(processed.blob, url, {
              thickness: Number(document.querySelector("#ogq-thickness").value),
              color: document.querySelector("#ogq-color").value,
              preserveCanvasSize: true,
            });
            processed.type = "image/png";
          } finally { URL.revokeObjectURL(url); }
        }
        const baseOutputName = preset.fixedName && files.length === 1 ? preset.fixedName : `${baseName(file.name)}_${preset.fixedName || preset.suffix + ".png"}`;
        let name = baseOutputName;
        let duplicateIndex = 2;
        while (outputs.some((item) => item.name.toLocaleLowerCase() === name.toLocaleLowerCase())) {
          const dot = baseOutputName.lastIndexOf(".");
          name = `${baseOutputName.slice(0, dot)}_${duplicateIndex}${baseOutputName.slice(dot)}`;
          duplicateIndex += 1;
        }
        const item = { blob: processed.blob, name };
        outputs.push(item);
        const card = document.createElement("article");
        card.className = "batch-result-card";
        card.innerHTML = `<strong>${file.name}</strong><span>${preset.width}×${preset.height} · ${engine.formatBytes(processed.blob.size)}</span><button class="button button-secondary" type="button">${text("개별 다운로드", "Download")}</button>`;
        card.querySelector("button").addEventListener("click", () => engine.download(item.blob, item.name));
        results.appendChild(card);
      }
      zipButton.disabled = outputs.length < 2;
      setStatus(text(`${preset.width}×${preset.height} 결과 ${outputs.length}개가 준비되었습니다.`, `${outputs.length} ${preset.width}×${preset.height} results are ready.`), "success");
    } catch (error) {
      console.error(error); setStatus(error.message || text("처리하지 못했습니다.", "Processing failed."), "error");
    } finally { document.querySelectorAll("[data-preset]").forEach((button) => { button.disabled = !files.length; }); }
  }

  input.addEventListener("change", () => select(input.files));
  dropZone.addEventListener("click", (event) => { if (event.target !== input) input.click(); });
  dropZone.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); input.click(); } });
  ["dragenter", "dragover"].forEach((name) => dropZone.addEventListener(name, (event) => { event.preventDefault(); dropZone.classList.add("is-dragging"); }));
  ["dragleave", "drop"].forEach((name) => dropZone.addEventListener(name, (event) => { event.preventDefault(); dropZone.classList.remove("is-dragging"); }));
  dropZone.addEventListener("drop", (event) => select(event.dataTransfer.files));
  document.querySelectorAll("[data-preset]").forEach((button) => button.addEventListener("click", () => processPreset(button.dataset.preset)));
  zipButton.addEventListener("click", async () => {
    const zip = await window.ImageToolkitZipWriter.createZipBlob(outputs.map((item) => ({ name: item.name, blob: item.blob })));
    engine.download(zip, "image-toolkit-ogq.zip");
  });
})();
