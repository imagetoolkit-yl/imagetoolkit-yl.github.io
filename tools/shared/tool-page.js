(function initializeToolPage() {
  "use strict";
  const engine = window.ImageToolkitEngine;
  const tool = document.body.dataset.tool;
  const input = document.querySelector("#tool-file-input");
  const dropZone = document.querySelector("#tool-drop-zone");
  const controls = document.querySelector("#tool-controls");
  const processButton = document.querySelector("#tool-process-button");
  const status = document.querySelector("#tool-status");
  const preview = document.querySelector("#tool-preview");
  const result = document.querySelector("#tool-result");
  const downloadButton = document.querySelector("#tool-download-button");
  const zipButton = document.querySelector("#tool-zip-button");
  let files = [];
  let currentResult = null;
  let sourceMeta = null;
  let previewUrl = null;

  const controlTemplates = {
    resizer: `<div class="field-grid"><label><span data-ko="너비 (px)" data-en="Width (px)">너비 (px)</span><input id="width" type="number" min="1" max="12000" value="1200"></label><label><span data-ko="높이 (px)" data-en="Height (px)">높이 (px)</span><input id="height" type="number" min="1" max="12000" value="800"></label></div><label class="check-row"><input id="keep-ratio" type="checkbox" checked><span data-ko="종횡비 유지" data-en="Keep aspect ratio">종횡비 유지</span></label><p class="tool-note" data-ko="원본보다 크게 만들 수 있지만 새로운 디테일이 생기지는 않아 흐려 보일 수 있습니다." data-en="You can enlarge an image, but enlargement does not create new detail and may look soft.">원본보다 크게 만들 수 있지만 새로운 디테일이 생기지는 않아 흐려 보일 수 있습니다.</p>`,
    compressor: `<label><span data-ko="출력 형식" data-en="Output format">출력 형식</span><select id="format"><option value="image/webp">WebP</option><option value="image/jpeg">JPEG</option></select></label><label><span><span data-ko="품질" data-en="Quality">품질</span>: <strong id="quality-value">80</strong></span><input id="quality" type="range" min="10" max="95" value="80"></label><p class="tool-note" data-ko="PNG의 quality 값은 브라우저에서 JPEG처럼 작동하지 않으므로 압축 결과는 WebP 또는 JPEG로 내보냅니다." data-en="Browser PNG export does not use a JPEG-like quality value, so compression outputs WebP or JPEG.">PNG의 quality 값은 브라우저에서 JPEG처럼 작동하지 않으므로 압축 결과는 WebP 또는 JPEG로 내보냅니다.</p>`,
    converter: `<label><span data-ko="출력 형식" data-en="Output format">출력 형식</span><select id="format"><option value="image/png">PNG</option><option value="image/jpeg">JPEG</option><option value="image/webp">WebP</option></select></label><label id="quality-wrap"><span><span data-ko="품질" data-en="Quality">품질</span>: <strong id="quality-value">90</strong></span><input id="quality" type="range" min="10" max="100" value="90"></label><label id="background-wrap"><span data-ko="JPEG 투명 영역 배경" data-en="JPEG transparency background">JPEG 투명 영역 배경</span><input id="background" type="color" value="#ffffff"></label>`,
    fit: `<div class="field-grid"><label><span data-ko="캔버스 너비" data-en="Canvas width">캔버스 너비</span><input id="width" type="number" min="1" max="12000" value="1200"></label><label><span data-ko="캔버스 높이" data-en="Canvas height">캔버스 높이</span><input id="height" type="number" min="1" max="12000" value="1200"></label></div><label><span data-ko="맞춤 방식" data-en="Fit mode">맞춤 방식</span><select id="fit-mode"><option value="contain" data-ko="Fit — 전체 이미지와 여백 유지" data-en="Fit — show the full image with padding">Fit — 전체 이미지와 여백 유지</option><option value="cover" data-ko="Crop — 캔버스를 채우고 넘치는 부분 자르기" data-en="Crop — fill the canvas and trim overflow">Crop — 캔버스를 채우고 넘치는 부분 자르기</option></select></label><label><span data-ko="배경색 (투명은 체크 해제)" data-en="Background color (uncheck for transparent)">배경색 (투명은 체크 해제)</span><span class="inline-control"><input id="use-background" type="checkbox"><input id="background" type="color" value="#ffffff"></span></label><div id="focal-controls" hidden><label><span data-ko="가로 초점" data-en="Horizontal focal point">가로 초점</span><input id="focal-x" type="range" min="0" max="100" value="50"></label><label><span data-ko="세로 초점" data-en="Vertical focal point">세로 초점</span><input id="focal-y" type="range" min="0" max="100" value="50"></label></div>`,
    outline: `<label><span><span data-ko="외곽선 두께" data-en="Outline thickness">외곽선 두께</span>: <strong id="thickness-value">8</strong>px</span><input id="thickness" type="range" min="1" max="32" value="8"></label><label><span data-ko="외곽선 색상" data-en="Outline color">외곽선 색상</span><input id="outline-color" type="color" value="#ffffff"></label>`,
    batch: `<div class="field-grid"><label><span data-ko="너비 (px)" data-en="Width (px)">너비 (px)</span><input id="width" type="number" min="1" max="12000" value="1200"></label><label><span data-ko="높이 (px)" data-en="Height (px)">높이 (px)</span><input id="height" type="number" min="1" max="12000" value="1200"></label></div><label><span data-ko="출력 형식" data-en="Output format">출력 형식</span><select id="format"><option value="image/png">PNG</option><option value="image/jpeg">JPEG</option><option value="image/webp">WebP</option></select></label><label><span><span data-ko="품질 (JPEG/WebP)" data-en="Quality (JPEG/WebP)">품질 (JPEG/WebP)</span>: <strong id="quality-value">85</strong></span><input id="quality" type="range" min="10" max="100" value="85"></label><label class="check-row"><input id="add-outline" type="checkbox"><span data-ko="투명 이미지에 외곽선 추가" data-en="Add an outline to transparent images">투명 이미지에 외곽선 추가</span></label><div class="field-grid"><label><span data-ko="외곽선 두께" data-en="Outline thickness">외곽선 두께</span><input id="thickness" type="number" min="1" max="32" value="8"></label><label><span data-ko="외곽선 색상" data-en="Outline color">외곽선 색상</span><input id="outline-color" type="color" value="#ffffff"></label></div><p class="tool-note" data-ko="한 번에 최대 30개를 순차 처리합니다. 고해상도 파일은 브라우저 메모리를 많이 사용할 수 있습니다." data-en="Up to 30 files are processed sequentially. High-resolution files can use substantial browser memory.">한 번에 최대 30개를 순차 처리합니다. 고해상도 파일은 브라우저 메모리를 많이 사용할 수 있습니다.</p>`,
  };

  controls.innerHTML = controlTemplates[tool] || "";
  bindControlHints();
  input.multiple = tool === "batch";

  function localeText(ko, en) { return document.documentElement.lang === "en" ? en : ko; }
  function setStatus(message, kind = "") { status.textContent = message; status.className = `tool-status ${kind}`; }
  function value(id) { return document.querySelector(`#${id}`)?.value; }
  function numberValue(id) { return Number(value(id)); }

  function bindControlHints() {
    const quality = document.querySelector("#quality");
    if (quality) quality.addEventListener("input", () => { document.querySelector("#quality-value").textContent = quality.value; });
    const thickness = document.querySelector("#thickness");
    if (thickness?.type === "range") thickness.addEventListener("input", () => { document.querySelector("#thickness-value").textContent = thickness.value; });
    const mode = document.querySelector("#fit-mode");
    if (mode) mode.addEventListener("change", () => { document.querySelector("#focal-controls").hidden = mode.value !== "cover"; });
    const format = document.querySelector("#format");
    if (format && tool === "converter") format.addEventListener("change", updateConverterControls);
  }

  function updateConverterControls() {
    const type = value("format");
    document.querySelector("#quality-wrap").hidden = type === "image/png";
    document.querySelector("#background-wrap").hidden = type !== "image/jpeg";
  }

  async function selectFiles(fileList) {
    const selected = Array.from(fileList).slice(0, tool === "batch" ? 30 : 1);
    files = [];
    for (const file of selected) {
      try { engine.validateFile(file); files.push(file); } catch (error) { setStatus(error.message, "error"); }
    }
    clearResult();
    if (!files.length) return;
    sourceMeta = await engine.metadata(files[0]);
    if (tool === "resizer") {
      document.querySelector("#width").value = sourceMeta.width;
      document.querySelector("#height").value = sourceMeta.height;
      bindRatioInputs();
    }
    renderSource();
    setStatus(tool === "batch"
      ? localeText(`${files.length}개 이미지가 준비되었습니다.`, `${files.length} images are ready.`)
      : localeText(`${files[0].name} — ${sourceMeta.width}×${sourceMeta.height}, ${engine.formatBytes(files[0].size)}`, `${files[0].name} — ${sourceMeta.width}×${sourceMeta.height}, ${engine.formatBytes(files[0].size)}`));
    processButton.disabled = false;
  }

  function bindRatioInputs() {
    const width = document.querySelector("#width");
    const height = document.querySelector("#height");
    if (width.dataset.bound) return;
    width.dataset.bound = "true";
    width.addEventListener("input", () => { if (document.querySelector("#keep-ratio").checked && sourceMeta) height.value = Math.max(1, Math.round(Number(width.value) * sourceMeta.height / sourceMeta.width)); });
    height.addEventListener("input", () => { if (document.querySelector("#keep-ratio").checked && sourceMeta) width.value = Math.max(1, Math.round(Number(height.value) * sourceMeta.width / sourceMeta.height)); });
  }

  function renderSource() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = URL.createObjectURL(files[0]);
    preview.innerHTML = `<figure><img src="${previewUrl}" alt=""><figcaption>${escapeHtml(files[0].name)}${files.length > 1 ? ` +${files.length - 1}` : ""}</figcaption></figure>`;
  }

  function clearResult() {
    currentResult = null;
    result.innerHTML = "";
    downloadButton.disabled = true;
    if (zipButton) zipButton.disabled = true;
  }

  async function process() {
    if (!files.length) return setStatus(localeText("먼저 이미지를 선택하세요.", "Select an image first."), "error");
    processButton.disabled = true;
    setStatus(localeText("브라우저에서 처리 중…", "Processing in your browser…"), "working");
    try {
      if (tool === "batch") return await processBatch();
      const file = files[0];
      const quality = numberValue("quality") / 100;
      let processed;
      let suffix = tool;
      if (tool === "resizer") processed = await engine.resize(file, { width: numberValue("width"), height: numberValue("height"), type: file.type === "image/webp" ? "image/webp" : file.type, quality: 0.92, background: "#ffffff" });
      if (tool === "compressor") processed = await engine.convert(file, { type: value("format"), quality, background: "#ffffff" });
      if (tool === "converter") processed = await engine.convert(file, { type: value("format"), quality, background: value("background") });
      if (tool === "fit") processed = await engine.fit(file, { width: numberValue("width"), height: numberValue("height"), mode: value("fit-mode"), focalX: numberValue("focal-x"), focalY: numberValue("focal-y"), background: document.querySelector("#use-background").checked ? value("background") : "transparent", type: "image/png" });
      if (tool === "outline") {
        const url = URL.createObjectURL(file);
        try { processed = await window.ImageToolkitOutlineEngine.createOutlinedPngBlob(file, url, { thickness: numberValue("thickness"), color: value("outline-color"), preserveCanvasSize: false }); }
        finally { URL.revokeObjectURL(url); }
        processed.type = "image/png";
      }
      currentResult = { ...processed, name: engine.outputName(file.name, suffix, processed.type) };
      showResult(currentResult, file.size);
    } catch (error) {
      console.error(error);
      setStatus(error.message || localeText("처리하지 못했습니다.", "Processing failed."), "error");
    } finally { processButton.disabled = false; }
  }

  function showResult(item, originalSize) {
    const url = URL.createObjectURL(item.blob);
    const reduction = originalSize ? Math.round((1 - item.blob.size / originalSize) * 100) : 0;
    const comparison = tool === "compressor"
      ? `<strong>${engine.formatBytes(originalSize)} → ${engine.formatBytes(item.blob.size)}</strong><span>${reduction >= 0 ? localeText(`${reduction}% 감소`, `${reduction}% smaller`) : localeText(`${Math.abs(reduction)}% 증가`, `${Math.abs(reduction)}% larger`)}</span>`
      : `<strong>${item.width}×${item.height}</strong><span>${engine.formatBytes(item.blob.size)} · ${item.type}</span>`;
    result.innerHTML = `<figure><img src="${url}" alt=""><figcaption>${comparison}</figcaption></figure>`;
    result.querySelector("img").addEventListener("load", () => URL.revokeObjectURL(url), { once: true });
    downloadButton.disabled = false;
    setStatus(localeText("결과가 준비되었습니다. 미리보기를 확인한 뒤 다운로드하세요.", "The result is ready. Check the preview, then download."), "success");
  }

  async function processBatch() {
    const size = engine.validateSize(numberValue("width"), numberValue("height"));
    const type = value("format");
    const quality = numberValue("quality") / 100;
    const addOutline = document.querySelector("#add-outline").checked;
    const outputs = [];
    result.innerHTML = "";
    for (let index = 0; index < files.length; index += 1) {
      const file = files[index];
      setStatus(localeText(`${index + 1}/${files.length} 처리 중…`, `Processing ${index + 1}/${files.length}…`), "working");
      let source = file;
      if (addOutline) {
        const url = URL.createObjectURL(file);
        try { source = (await window.ImageToolkitOutlineEngine.createOutlinedPngBlob(file, url, { thickness: numberValue("thickness"), color: value("outline-color"), preserveCanvasSize: false })).blob; }
        finally { URL.revokeObjectURL(url); }
      }
      const processed = await engine.fit(source, { ...size, mode: "contain", background: type === "image/jpeg" ? "#ffffff" : "transparent", type, quality });
      const baseOutputName = engine.outputName(file.name, "batch", type);
      let outputName = baseOutputName;
      let duplicateIndex = 2;
      while (outputs.some((item) => item.name.toLocaleLowerCase() === outputName.toLocaleLowerCase())) {
        const dot = baseOutputName.lastIndexOf(".");
        outputName = `${baseOutputName.slice(0, dot)}_${duplicateIndex}${baseOutputName.slice(dot)}`;
        duplicateIndex += 1;
      }
      const output = { blob: processed.blob, name: outputName, width: processed.width, height: processed.height, type };
      outputs.push(output);
      const card = document.createElement("article");
      card.className = "batch-result-card";
      card.innerHTML = `<strong>${escapeHtml(file.name)}</strong><span>${processed.width}×${processed.height} · ${engine.formatBytes(processed.blob.size)}</span><button class="button button-secondary" type="button">${localeText("개별 다운로드", "Download")}</button>`;
      card.querySelector("button").addEventListener("click", () => engine.download(output.blob, output.name));
      result.appendChild(card);
    }
    currentResult = outputs;
    zipButton.disabled = false;
    setStatus(localeText(`${outputs.length}개 결과가 준비되었습니다.`, `${outputs.length} results are ready.`), "success");
  }

  async function downloadZip() {
    if (!Array.isArray(currentResult) || !currentResult.length) return;
    zipButton.disabled = true;
    try {
      const blob = await window.ImageToolkitZipWriter.createZipBlob(currentResult.map((item) => ({ name: item.name, blob: item.blob })));
      engine.download(blob, "image-toolkit-batch.zip");
    } finally { zipButton.disabled = false; }
  }

  function escapeHtml(text) { const span = document.createElement("span"); span.textContent = text; return span.innerHTML; }

  processButton.addEventListener("click", process);
  downloadButton.addEventListener("click", () => currentResult && !Array.isArray(currentResult) && engine.download(currentResult.blob, currentResult.name));
  if (zipButton) zipButton.addEventListener("click", downloadZip);
  input.addEventListener("change", () => selectFiles(input.files));
  dropZone.addEventListener("click", (event) => { if (event.target !== input) input.click(); });
  dropZone.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); input.click(); } });
  ["dragenter", "dragover"].forEach((name) => dropZone.addEventListener(name, (event) => { event.preventDefault(); dropZone.classList.add("is-dragging"); }));
  ["dragleave", "drop"].forEach((name) => dropZone.addEventListener(name, (event) => { event.preventDefault(); dropZone.classList.remove("is-dragging"); }));
  dropZone.addEventListener("drop", (event) => selectFiles(event.dataTransfer.files));
  if (tool === "converter") updateConverterControls();
})();
