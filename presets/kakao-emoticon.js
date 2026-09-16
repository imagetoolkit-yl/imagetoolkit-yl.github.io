(function initializeKakaoEmoticonPreset() {
  "use strict";

  const engine = window.ImageToolkitEngine;
  const zipWriter = window.ImageToolkitZipWriter;
  const MAX_FILES = 32;
  const EMOTICON_LIMIT = 150 * 1024;
  const ICON_LIMIT = 16 * 1024;
  const text = (ko, en) => document.documentElement.lang === "en" ? en : ko;
  const elements = {
    input: document.querySelector("#kakao-input"),
    dropZone: document.querySelector("#kakao-drop-zone"),
    count: document.querySelector("#kakao-count"),
    countMessage: document.querySelector("#kakao-count-message"),
    process: document.querySelector("#kakao-process"),
    zip: document.querySelector("#kakao-zip"),
    status: document.querySelector("#kakao-status"),
    results: document.querySelector("#kakao-results"),
    iconInput: document.querySelector("#kakao-icon-input"),
    iconDropZone: document.querySelector("#kakao-icon-drop-zone"),
    iconProcess: document.querySelector("#kakao-icon-process"),
    iconStatus: document.querySelector("#kakao-icon-status"),
    iconResult: document.querySelector("#kakao-icon-result"),
  };
  let files = [];
  let outputs = [];
  let resultUrls = [];
  let iconFile = null;
  let iconOutput = null;
  let iconUrl = "";

  function setStatus(element, message, kind = "") {
    element.textContent = message;
    element.className = `tool-status ${kind}`;
  }

  function validFiles(fileList, limit) {
    return Array.from(fileList).slice(0, limit).filter((file) => {
      try { engine.validateFile(file); return true; } catch (error) { return false; }
    });
  }

  function clearResultUrls() {
    resultUrls.forEach((url) => URL.revokeObjectURL(url));
    resultUrls = [];
  }

  function updateCount() {
    elements.count.textContent = `${files.length} / ${MAX_FILES}`;
    elements.countMessage.textContent = files.length === MAX_FILES
      ? text("32개 이미지가 준비되었습니다.", "All 32 images are ready.")
      : files.length
        ? text(`현재 ${files.length}개입니다. 멈춰있는 이모티콘 구성은 32개입니다.`, `${files.length} images selected. A still-emoticon set contains 32 images.`)
        : text("이미지를 선택하세요.", "Choose images to begin.");
  }

  function selectFiles(fileList) {
    files = validFiles(fileList, MAX_FILES);
    outputs = [];
    clearResultUrls();
    elements.results.innerHTML = "";
    elements.process.disabled = !files.length;
    elements.zip.disabled = true;
    updateCount();
    setStatus(elements.status, files.length
      ? text(`${files.length}개 이미지가 선택되었습니다.`, `${files.length} images selected.`)
      : text("지원되는 이미지를 선택하세요.", "Choose supported images."), files.length ? "success" : "error");
  }

  function resultCard(sourceName, output, index, limit) {
    const card = document.createElement("article");
    const url = URL.createObjectURL(output.blob);
    resultUrls.push(url);
    const valid = output.blob.size <= limit;
    card.className = "kakao-result-card";
    card.innerHTML = `<img src="${url}" alt=""><div><strong>${String(index + 1).padStart(2, "0")}. ${sourceName}</strong><p>${output.width}×${output.height} · ${engine.formatBytes(output.blob.size)}</p><span class="${valid ? "is-valid" : "is-warning"}">${valid ? text("용량 기준 이내", "Within file-size limit") : text(`${engine.formatBytes(limit)}를 초과합니다. 제출 전 파일 용량을 줄여 주세요.`, `Exceeds ${engine.formatBytes(limit)}. Reduce the file size before submitting.`)}</span></div><button class="button button-secondary" type="button">${text("개별 다운로드", "Download")}</button>`;
    card.querySelector("button").addEventListener("click", () => engine.download(output.blob, output.name));
    return card;
  }

  async function processImages() {
    outputs = [];
    clearResultUrls();
    elements.results.innerHTML = "";
    elements.process.disabled = true;
    elements.zip.disabled = true;
    try {
      for (let index = 0; index < files.length; index += 1) {
        setStatus(elements.status, text(`${index + 1}/${files.length} 처리 중…`, `Processing ${index + 1}/${files.length}…`), "working");
        const processed = await engine.fit(files[index], { width: 360, height: 360, mode: "contain", background: "transparent", type: "image/png" });
        const output = { ...processed, name: `${String(index + 1).padStart(2, "0")}.png` };
        outputs.push(output);
        elements.results.appendChild(resultCard(files[index].name, output, index, EMOTICON_LIMIT));
      }
      elements.zip.disabled = !outputs.length;
      const warnings = outputs.filter((item) => item.blob.size > EMOTICON_LIMIT).length;
      setStatus(elements.status, warnings
        ? text(`${outputs.length}개 완료 · ${warnings}개가 150 KB를 초과합니다.`, `${outputs.length} complete · ${warnings} exceed 150 KB.`)
        : text(`${outputs.length}개 360×360 PNG가 준비되었습니다.`, `${outputs.length} 360×360 PNG files are ready.`), warnings ? "error" : "success");
    } catch (error) {
      console.error(error);
      setStatus(elements.status, error.message || text("처리하지 못했습니다.", "Processing failed."), "error");
    } finally {
      elements.process.disabled = !files.length;
    }
  }

  function selectIcon(fileList) {
    iconFile = validFiles(fileList, 1)[0] || null;
    iconOutput = null;
    if (iconUrl) URL.revokeObjectURL(iconUrl);
    iconUrl = "";
    elements.iconResult.innerHTML = "";
    elements.iconProcess.disabled = !iconFile;
    setStatus(elements.iconStatus, iconFile ? text("아이콘 원본이 선택되었습니다.", "Icon source selected.") : text("지원되는 이미지를 선택하세요.", "Choose a supported image."), iconFile ? "success" : "error");
  }

  async function processIcon() {
    elements.iconProcess.disabled = true;
    try {
      const processed = await engine.fit(iconFile, { width: 78, height: 78, mode: "contain", background: "transparent", type: "image/png" });
      iconOutput = { ...processed, name: "icon.png" };
      if (iconUrl) URL.revokeObjectURL(iconUrl);
      iconUrl = URL.createObjectURL(processed.blob);
      const valid = processed.blob.size <= ICON_LIMIT;
      elements.iconResult.innerHTML = `<article class="kakao-result-card"><img src="${iconUrl}" alt=""><div><strong>icon.png</strong><p>78×78 · ${engine.formatBytes(processed.blob.size)}</p><span class="${valid ? "is-valid" : "is-warning"}">${valid ? text("16 KB 기준 이내", "Within the 16 KB limit") : text("16 KB를 초과합니다. 제출 전 파일 용량을 줄여 주세요.", "Exceeds 16 KB. Reduce the file size before submitting.")}</span></div><button class="button button-secondary" type="button">${text("아이콘 다운로드", "Download icon")}</button></article>`;
      elements.iconResult.querySelector("button").addEventListener("click", () => engine.download(iconOutput.blob, iconOutput.name));
      setStatus(elements.iconStatus, valid ? text("78×78 아이콘이 준비되었습니다.", "The 78×78 icon is ready.") : text("아이콘이 16 KB를 초과합니다.", "The icon exceeds 16 KB."), valid ? "success" : "error");
    } catch (error) {
      console.error(error);
      setStatus(elements.iconStatus, error.message || text("아이콘을 처리하지 못했습니다.", "Could not process the icon."), "error");
    } finally {
      elements.iconProcess.disabled = !iconFile;
    }
  }

  function bindDropZone(dropZone, input, select) {
    input.addEventListener("change", () => select(input.files));
    dropZone.addEventListener("click", (event) => { if (event.target !== input) input.click(); });
    dropZone.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); input.click(); } });
    ["dragenter", "dragover"].forEach((name) => dropZone.addEventListener(name, (event) => { event.preventDefault(); dropZone.classList.add("is-dragging"); }));
    ["dragleave", "drop"].forEach((name) => dropZone.addEventListener(name, (event) => { event.preventDefault(); dropZone.classList.remove("is-dragging"); }));
    dropZone.addEventListener("drop", (event) => select(event.dataTransfer.files));
  }

  bindDropZone(elements.dropZone, elements.input, selectFiles);
  bindDropZone(elements.iconDropZone, elements.iconInput, selectIcon);
  elements.process.addEventListener("click", processImages);
  elements.iconProcess.addEventListener("click", processIcon);
  elements.zip.addEventListener("click", async () => {
    const zip = await zipWriter.createZipBlob(outputs.map((item) => ({ name: item.name, blob: item.blob })));
    engine.download(zip, "image-toolkit-kakao-still-emoticons.zip");
  });
})();
