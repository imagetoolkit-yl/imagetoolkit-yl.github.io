const { createOutlinedPngBlob } = window.ImageToolkitOutlineEngine;
const { triggerDownload } = window.ImageToolkitDownloadUtils;
const { createZipBlob } = window.ImageToolkitZipWriter;

const CANVAS_FIT_SAFE_MARGIN = 40;
const OGQ_IMAGE_OPTIONS = Object.freeze({ width: 740, height: 640, safeMargin: 40 });
const TAB_IMAGE_OPTIONS = Object.freeze({ width: 96, height: 74, safeMargin: 4 });
const MAIN_IMAGE_OPTIONS = Object.freeze({ width: 240, height: 240, safeMargin: 12 });
const processedZipFileName = "image-toolkit-processed-images.zip";
const LANGUAGE_STORAGE_KEY = "imageToolkitLanguage";

const translations = Object.freeze({
  ko: {
    "meta.title": "이미지 툴킷 | PNG 외곽선·캔버스 맞춤",
    "meta.description": "투명 PNG를 안전 여백에 맞춰 리사이징하고 깔끔한 외곽선을 추가하는 무료 브라우저 이미지 도구입니다. 이미지가 서버로 업로드되지 않습니다.",
    "meta.keywords": "PNG 외곽선, PNG 스트로크, 이미지 리사이즈, 캔버스 맞춤, 이모티콘 이미지, OGQ 이미지, transparent PNG outline",
    "aria.home": "Image Toolkit 홈", "aria.primaryNav": "주요 메뉴", "aria.languageSelector": "언어 선택",
    "aria.highlights": "개인정보 보호 및 브라우저 처리 안내",
    "nav.canvasOutline": "캔버스 맞춤·외곽선",
    "hero.eyebrow": "무료 온라인 이미지 편집 도구", "hero.subtitle": "빠르고 안전한 브라우저 기반 이미지 편집 도구입니다.",
    "hero.privateTitle": "안전한 처리", "hero.privateText": "이미지는 브라우저 안에서만 처리됩니다.",
    "hero.fastTitle": "빠른 작업", "hero.fastText": "서버 업로드 없이 바로 처리합니다.",
    "hero.expandableTitle": "규격 중심", "hero.expandableText": "OGQ 제출용 이미지 규격을 빠르게 준비합니다.",
    "tool.eyebrow": "첫 번째 도구", "tool.title": "캔버스 맞춤(Canvas Fit)·PNG 외곽선",
    "tool.description": "투명 이미지를 안전 여백 안에 맞춘 뒤, 브라우저에서 깔끔한 외곽선을 추가하세요.",
    "upload.title": "PNG 이미지 업로드", "upload.dropTitle": "PNG, JPG, JPEG 파일을 여기에 놓으세요",
    "upload.help": "여러 장을 선택할 수 있으며, 파일은 브라우저 밖으로 전송되지 않습니다.", "upload.selectButton": "이미지 선택",
    "options.title": "설정", "canvas.title": "캔버스 맞춤(Canvas Fit)", "canvas.width": "캔버스 너비", "canvas.height": "캔버스 높이",
    "canvas.safeMargin": "안전 여백", "canvas.applyButton": "캔버스 맞춤 적용",
    "preset.kicker": "네이버 OGQ", "preset.title": "네이버 OGQ 심사 규격 이미지 만들기",
    "preset.description": "실제 그림 영역을 기준으로 일반 이미지, 대표 이미지, 탭 이미지를 바로 만듭니다.",
    "preset.ogqButton": "740×640 일반 이미지 만들기", "preset.mainButton": "240×240 대표 이미지 만들기", "preset.tabButton": "96×74 탭 이미지 만들기",
    "preset.ogqLabel": "OGQ 일반 이미지", "preset.mainLabel": "대표 이미지", "preset.tabLabel": "탭 이미지",
    "preset.guideLink": "규격 가이드", "preset.disclaimer": "Image Toolkit은 OGQ 공식 도구가 아닙니다. 제출 전 최신 OGQ 가이드를 확인하세요.",
    "outline.title": "외곽선(Outline)", "outline.thickness": "외곽선 두께", "outline.color": "외곽선 색상",
    "outline.applyButton": "외곽선 적용", "options.resetButton": "설정 초기화",
    "process.initial": "이미지를 올린 뒤 캔버스 맞춤이나 외곽선을 적용하세요.",
    "process.invalidCanvas": "캔버스 너비와 높이는 0보다 큰 정수여야 합니다.",
    "process.uploadBeforeFit": "캔버스 맞춤을 적용할 유효한 이미지를 한 장 이상 올려주세요.",
    "process.fitProgress": "캔버스 맞춤: {current}/{total} 처리 중...", "process.fitComplete": "캔버스 맞춤 완료: {completed}개 성공, {failed}개 실패.",
    "process.uploadBeforePreset": "{label}를 만들 유효한 이미지를 한 장 이상 올려주세요.",
    "process.presetProgress": "{label}: {current}/{total} 처리 중...", "process.presetComplete": "{label} 완료: {completed}개 성공, {failed}개 실패.",
    "process.uploadBeforeOutline": "외곽선을 적용할 유효한 이미지를 한 장 이상 올려주세요.",
    "process.outlineProgress": "외곽선: {current}/{total} 처리 중...", "process.outlineComplete": "외곽선 적용 완료: {completed}개 성공, {failed}개 실패.",
    "process.reset": "설정을 초기화했습니다. 결과를 갱신하려면 캔버스 맞춤이나 외곽선을 다시 적용하세요.",
    "process.zipError": "ZIP 파일을 만들 수 없습니다.",
    "preview.title": "미리보기", "preview.downloadZip": "ZIP 일괄 다운로드", "preview.emptyTitle": "아직 이미지가 없습니다",
    "preview.emptyText": "이미지를 올리면 원본, 캔버스 맞춤 결과, 외곽선 결과를 미리 볼 수 있습니다.",
    "preview.original": "원본", "preview.finalOutline": "최종 외곽선", "preview.canvasFit": "캔버스 맞춤", "preview.result": "결과",
    "preview.processing": "처리 중...", "preview.applyHint": "캔버스 맞춤 또는 외곽선을 적용하세요",
    "preview.sizeError": "이미지 크기를 읽을 수 없습니다", "preview.sizeReading": "이미지 크기 확인 중...",
    "preview.artwork": "그림", "preview.transparentImage": "완전 투명 이미지", "preview.fitProcessing": "캔버스 맞춤 처리 중",
    "preview.fitFailed": "캔버스 맞춤 실패", "preview.originalError": "원본 이미지 오류", "preview.fitNotApplied": "캔버스 맞춤 미적용",
    "preview.outlined": "외곽선", "preview.safeLimit": "안전 한도", "preview.outlineProcessing": "외곽선 처리 중",
    "preview.outlineFailed": "외곽선 적용 실패", "preview.outlineNotApplied": "외곽선 미적용",
    "preview.downloadPng": "PNG 다운로드", "preview.delete": "삭제", "preview.downloadAria": "{name} 처리 결과 PNG 다운로드",
    "preview.deleteAria": "{name} 삭제", "preview.uploadCount": "{count}개 이미지 업로드됨",
    "error.loadImage": "이미지를 불러올 수 없습니다", "error.createFitPng": "캔버스 맞춤 PNG 미리보기를 만들 수 없습니다",
    "features.eyebrow": "지금 사용할 수 있어요", "features.title": "현재 제공하는 기능",
    "features.description": "실제로 작동하고 브라우저에서 바로 사용할 수 있는 기능만 안내합니다.",
    "features.canvasFit": "투명 여백을 제외한 실제 그림을 안전 여백 안에 맞춥니다.",
    "features.outline": "두께와 색상을 선택해 PNG 외곽선을 만듭니다.",
    "features.ogqStandard": "네이버 OGQ 일반 이미지를 만듭니다.",
    "features.mainImage": "OGQ 대표 이미지를 자동 생성합니다.",
    "features.tabImage": "그림이 점처럼 작아지지 않도록 탭 이미지를 만듭니다.",
    "features.zip": "여러 이미지의 최신 결과를 한 번에 다운로드합니다.",
    "footer.text": "간단하고 안전한 브라우저 기반 이미지 도구"
  },
  en: {
    "meta.title": "Canvas Fit & PNG Outline Tool | Image Toolkit",
    "meta.description": "Fit transparent PNG artwork to a safe canvas and add clean outlines directly in your browser. Images never leave your device.",
    "meta.keywords": "PNG Outline Tool, Add Outline to PNG, PNG Stroke Generator, Sticker Outline Generator, Emoji Outline Tool, Transparent PNG Outline",
    "aria.home": "Image Toolkit home", "aria.primaryNav": "Primary navigation", "aria.languageSelector": "Language selector",
    "aria.highlights": "Privacy and browser-based highlights",
    "nav.canvasOutline": "Canvas Fit & Outline",
    "hero.eyebrow": "Free online image editing tools", "hero.subtitle": "Free online image editing tools. Fast. Private. Browser-based.",
    "hero.privateTitle": "Private", "hero.privateText": "Images stay in your browser.", "hero.fastTitle": "Fast", "hero.fastText": "No server upload required.",
    "hero.expandableTitle": "Submission-ready", "hero.expandableText": "Prepare OGQ image dimensions in a clear workflow.",
    "tool.eyebrow": "First tool", "tool.title": "Canvas Fit & PNG Outline Tool",
    "tool.description": "Fit transparent artwork into a safe canvas, then add clean outlines directly in your browser.",
    "upload.title": "Upload PNG Images", "upload.dropTitle": "Drop PNG, JPG, or JPEG files here",
    "upload.help": "Select multiple images. Files stay in your browser.", "upload.selectButton": "Select Images",
    "options.title": "Options", "canvas.title": "Canvas Fit", "canvas.width": "Canvas Width", "canvas.height": "Canvas Height",
    "canvas.safeMargin": "Safe Margin", "canvas.applyButton": "Apply Canvas Fit",
    "preset.kicker": "Naver OGQ", "preset.title": "Create Naver OGQ Submission Images",
    "preset.description": "Create standard artwork, main, and tab images from the visible artwork bounds.",
    "preset.ogqButton": "Create 740×640 Standard Image", "preset.mainButton": "Create 240×240 Main", "preset.tabButton": "Create 96×74 Tab",
    "preset.ogqLabel": "OGQ standard image", "preset.mainLabel": "Main image", "preset.tabLabel": "Tab image",
    "preset.guideLink": "Size guide", "preset.disclaimer": "Image Toolkit is not an official OGQ tool. Check the latest OGQ guide before submission.",
    "outline.title": "Outline", "outline.thickness": "Outline Thickness", "outline.color": "Outline Color",
    "outline.applyButton": "Apply Outline", "options.resetButton": "Reset Options",
    "process.initial": "Upload images, then apply Canvas Fit or an outline.",
    "process.invalidCanvas": "Canvas width and height must be whole numbers greater than 0.",
    "process.uploadBeforeFit": "Upload at least one valid image before applying Canvas Fit.",
    "process.fitProgress": "Canvas Fit: {current} of {total} images...", "process.fitComplete": "Canvas Fit complete: {completed} processed, {failed} failed.",
    "process.uploadBeforePreset": "Upload at least one valid image before creating a {label}.",
    "process.presetProgress": "{label}: {current} of {total} images...", "process.presetComplete": "{label} complete: {completed} processed, {failed} failed.",
    "process.uploadBeforeOutline": "Upload at least one valid image before applying an outline.",
    "process.outlineProgress": "Processing outline: {current} of {total} images...", "process.outlineComplete": "Outline complete: {completed} processed, {failed} failed.",
    "process.reset": "Options reset. Apply Canvas Fit or outline again to update previews.", "process.zipError": "Could not create ZIP file.",
    "preview.title": "Preview", "preview.downloadZip": "Download ZIP", "preview.emptyTitle": "No images yet",
    "preview.emptyText": "Upload images to preview originals, Canvas Fit results, and outlined results.",
    "preview.original": "Original", "preview.finalOutline": "Final Outline", "preview.canvasFit": "Canvas Fit", "preview.result": "Result",
    "preview.processing": "Processing...", "preview.applyHint": "Apply Canvas Fit or Outline", "preview.sizeError": "Could not read image size",
    "preview.sizeReading": "Reading image size...", "preview.artwork": "artwork", "preview.transparentImage": "transparent image",
    "preview.fitProcessing": "Processing Canvas Fit", "preview.fitFailed": "Canvas Fit failed", "preview.originalError": "Original image error",
    "preview.fitNotApplied": "Canvas Fit not applied", "preview.outlined": "Outlined", "preview.safeLimit": "safe limit",
    "preview.outlineProcessing": "Processing outline", "preview.outlineFailed": "Outline failed", "preview.outlineNotApplied": "Outline not applied",
    "preview.downloadPng": "Download PNG", "preview.delete": "Delete", "preview.downloadAria": "Download processed PNG for {name}",
    "preview.deleteAria": "Delete {name}", "preview.uploadCount": "{count} {unit} uploaded", "preview.imageSingular": "image", "preview.imagePlural": "images",
    "error.loadImage": "Could not load image", "error.createFitPng": "Could not create Canvas Fit PNG preview",
    "features.eyebrow": "Available now", "features.title": "Current features",
    "features.description": "Only completed, working browser features are listed here.",
    "features.canvasFit": "Fit visible artwork inside a transparent safe margin.",
    "features.outline": "Create PNG outlines with adjustable color and thickness.",
    "features.ogqStandard": "Create 740×640 Naver OGQ standard artwork.",
    "features.mainImage": "Generate a 240×240 OGQ main image.",
    "features.tabImage": "Generate a 96×74 tab image without tiny-dot scaling.",
    "features.zip": "Download the latest result for multiple images as a ZIP.",
    "footer.text": "Browser-based image tools for simple, private workflows."
  }
});

const appState = {
  activeTool: "png-outline",
  outlineEngineReady: true,
  uploadedImages: [],
  isProcessing: false,
  locale: getInitialLocale(),
  processMessage: { key: "process.initial", params: {} },
  outlineOptions: {
    thickness: 8,
    color: "#ffffff",
  },
  canvasFitOptions: {
    width: 740,
    height: 640,
    safeMargin: CANVAS_FIT_SAFE_MARGIN,
  },
};

const allowedImageTypes = new Set(["image/png", "image/jpeg"]);
const elements = {};

function getInitialLocale() {
  try {
    const savedLocale = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (savedLocale === "ko" || savedLocale === "en") {
      return savedLocale;
    }
  } catch (error) {
    console.warn("Could not read the saved language preference.", error);
  }

  return navigator.language.toLowerCase().startsWith("ko") ? "ko" : "en";
}

function t(key, params = {}) {
  const dictionary = translations[appState.locale] || translations.en;
  const fallback = translations.en[key] || key;
  const template = dictionary[key] || fallback;

  return Object.entries(params).reduce(
    (message, [name, value]) => message.replaceAll(`{${name}}`, String(value)),
    template,
  );
}

function setProcessMessage(key, params = {}) {
  appState.processMessage = { key, params };
  if (elements.processSummary) {
    elements.processSummary.textContent = t(key, params);
  }
}

function applyTranslations() {
  document.documentElement.lang = appState.locale;
  document.documentElement.dataset.locale = appState.locale;
  document.title = t("meta.title");

  const description = document.querySelector('meta[name="description"]');
  const keywords = document.querySelector('meta[name="keywords"]');
  if (description) description.content = t("meta.description");
  if (keywords) keywords.content = t("meta.keywords");

  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });

  document.querySelectorAll("[data-i18n-aria-label]").forEach((node) => {
    node.setAttribute("aria-label", t(node.dataset.i18nAriaLabel));
  });

  document.querySelectorAll("[data-language]").forEach((button) => {
    const isActive = button.dataset.language === appState.locale;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  setProcessMessage(appState.processMessage.key, appState.processMessage.params);
  renderPreview();
}

function setLocale(locale, persist = true) {
  if (locale !== "ko" && locale !== "en") return;
  appState.locale = locale;

  if (persist) {
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, locale);
    } catch (error) {
      console.warn("Could not save the language preference.", error);
    }
  }

  applyTranslations();
}

function initializeApp() {
  document.documentElement.dataset.activeTool = appState.activeTool;
  collectElements();
  bindUploadEvents();
  setLocale(appState.locale, false);
  console.info("Image Toolkit loaded. Image processing runs locally in the browser.");
}

function collectElements() {
  elements.dropZone = document.querySelector("#drop-zone");
  elements.imageInput = document.querySelector("#image-input");
  elements.selectButton = document.querySelector("#select-images-button");
  elements.previewGrid = document.querySelector("#preview-grid");
  elements.previewEmpty = document.querySelector("#preview-empty");
  elements.uploadSummary = document.querySelector("#upload-summary");
  elements.canvasWidthInput = document.querySelector("#canvas-width-input");
  elements.canvasHeightInput = document.querySelector("#canvas-height-input");
  elements.safeMarginValue = document.querySelector("#safe-margin-value");
  elements.applyCanvasFitButton = document.querySelector("#apply-canvas-fit-button");
  elements.createOgqImageButton = document.querySelector("#create-ogq-image-button");
  elements.createTabImageButton = document.querySelector("#create-tab-image-button");
  elements.createMainImageButton = document.querySelector("#create-main-image-button");
  elements.thicknessInput = document.querySelector("#thickness-input");
  elements.thicknessValue = document.querySelector("#thickness-value");
  elements.colorInput = document.querySelector("#color-input");
  elements.applyOutlineButton = document.querySelector("#apply-outline-button");
  elements.resetOptionsButton = document.querySelector("#reset-options-button");
  elements.downloadZipButton = document.querySelector("#download-zip-button");
  elements.processSummary = document.querySelector("#process-summary");
  elements.languageButtons = Array.from(document.querySelectorAll("[data-language]"));
}

function bindUploadEvents() {
  elements.languageButtons.forEach((button) => {
    button.addEventListener("click", () => setLocale(button.dataset.language));
  });

  elements.selectButton.addEventListener("click", () => elements.imageInput.click());
  elements.dropZone.addEventListener("click", (event) => {
    if (event.target !== elements.selectButton) {
      elements.imageInput.click();
    }
  });
  elements.dropZone.addEventListener("keydown", handleDropZoneKeydown);
  elements.imageInput.addEventListener("change", (event) => {
    addFiles(event.target.files);
    event.target.value = "";
  });

  ["dragenter", "dragover"].forEach((eventName) => {
    elements.dropZone.addEventListener(eventName, handleDragOver);
  });

  ["dragleave", "drop"].forEach((eventName) => {
    elements.dropZone.addEventListener(eventName, handleDragLeave);
  });

  elements.dropZone.addEventListener("drop", (event) => {
    event.preventDefault();
    addFiles(event.dataTransfer.files);
  });

  elements.canvasWidthInput.addEventListener("input", syncCanvasFitOptions);
  elements.canvasHeightInput.addEventListener("input", syncCanvasFitOptions);
  elements.applyCanvasFitButton.addEventListener("click", applyCanvasFitToAllImages);
  elements.createOgqImageButton.addEventListener("click", () =>
    applyPresetToAllImages(OGQ_IMAGE_OPTIONS, (imageItem) => createProcessedFileName(imageItem.name, ["ogq"]), "preset.ogqLabel"),
  );
  elements.createTabImageButton.addEventListener("click", () =>
    applyPresetToAllImages(TAB_IMAGE_OPTIONS, "tab.png", "preset.tabLabel"),
  );
  elements.createMainImageButton.addEventListener("click", () =>
    applyPresetToAllImages(MAIN_IMAGE_OPTIONS, "main.png", "preset.mainLabel"),
  );

  elements.thicknessInput.addEventListener("input", () => {
    appState.outlineOptions.thickness = Number(elements.thicknessInput.value);
    elements.thicknessValue.textContent = elements.thicknessInput.value;
  });

  elements.colorInput.addEventListener("input", () => {
    appState.outlineOptions.color = elements.colorInput.value;
  });

  elements.applyOutlineButton.addEventListener("click", applyOutlineToAllImages);
  elements.resetOptionsButton.addEventListener("click", resetOptions);
  elements.downloadZipButton.addEventListener("click", downloadProcessedImagesZip);
}

function handleDropZoneKeydown(event) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    elements.imageInput.click();
  }
}

function handleDragOver(event) {
  event.preventDefault();
  elements.dropZone.classList.add("is-drag-over");
}

function handleDragLeave(event) {
  event.preventDefault();
  elements.dropZone.classList.remove("is-drag-over");
}

function addFiles(fileList) {
  const imageFiles = Array.from(fileList).filter(isSupportedImage);

  imageFiles.forEach((file) => {
    const imageItem = createImageItem(file);
    appState.uploadedImages.push(imageItem);
    loadImageMetadata(imageItem);
  });

  renderPreview();
}

function isSupportedImage(file) {
  return allowedImageTypes.has(file.type);
}

function createImageItem(file) {
  const uniqueId =
    window.crypto && window.crypto.randomUUID
      ? window.crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`;

  return {
    id: `${uniqueId}-${file.name}`,
    file,
    name: file.name,
    type: file.type,
    objectUrl: URL.createObjectURL(file),
    width: null,
    height: null,
    status: "loading",
    fitStatus: "idle",
    fitUrl: null,
    fitBlob: null,
    fitWidth: null,
    fitHeight: null,
    fitPlacement: null,
    fitError: "",
    outlineStatus: "idle",
    outlineUrl: null,
    outlineBlob: null,
    outlineWidth: null,
    outlineHeight: null,
    outlineAppliedThickness: null,
    outlineThicknessClamped: false,
    outlineError: "",
    finalUrl: null,
    finalBlob: null,
    finalFileName: null,
    finalWidth: null,
    finalHeight: null,
    finalKind: null,
  };
}

function loadImageMetadata(imageItem) {
  const previewImage = new Image();

  previewImage.onload = () => {
    imageItem.width = previewImage.naturalWidth;
    imageItem.height = previewImage.naturalHeight;
    imageItem.status = "ready";
    renderPreview();
  };

  previewImage.onerror = () => {
    imageItem.status = "error";
    renderPreview();
  };

  previewImage.src = imageItem.objectUrl;
}

function removeImage(imageId) {
  const imageIndex = appState.uploadedImages.findIndex((image) => image.id === imageId);

  if (imageIndex === -1) {
    return;
  }

  const [removedImage] = appState.uploadedImages.splice(imageIndex, 1);
  URL.revokeObjectURL(removedImage.objectUrl);
  revokeFitUrl(removedImage);
  revokeOutlineUrl(removedImage);
  clearFinalResult(removedImage);
  renderPreview();
}

function renderPreview() {
  const uploadCount = appState.uploadedImages.length;
  elements.uploadSummary.textContent = formatUploadSummary(uploadCount);
  elements.previewEmpty.classList.toggle("is-hidden", uploadCount > 0);
  elements.previewGrid.innerHTML = "";
  elements.applyCanvasFitButton.disabled = uploadCount === 0 || appState.isProcessing;
  elements.createTabImageButton.disabled = uploadCount === 0 || appState.isProcessing;
  elements.createMainImageButton.disabled = uploadCount === 0 || appState.isProcessing;
  elements.applyOutlineButton.disabled = uploadCount === 0 || appState.isProcessing;
  elements.downloadZipButton.disabled = getProcessedImages().length === 0 || appState.isProcessing;

  appState.uploadedImages.forEach((imageItem) => {
    elements.previewGrid.appendChild(createPreviewCard(imageItem));
  });
}

function createPreviewCard(imageItem) {
  const card = document.createElement("article");
  card.className = "preview-card";

  const previewPair = document.createElement("div");
  previewPair.className = "preview-pair";
  previewPair.append(
    createPreviewImageBlock(t("preview.original"), imageItem.objectUrl, imageItem.name),
    createResultImageBlock(imageItem),
  );

  const metadata = document.createElement("div");
  metadata.className = "preview-meta";

  const fileName = document.createElement("p");
  fileName.className = "file-name";
  fileName.title = imageItem.name;
  fileName.textContent = imageItem.name;

  const imageSize = document.createElement("p");
  imageSize.className = "image-size";
  imageSize.textContent = getImageSizeLabel(imageItem);

  const fitPill = document.createElement("span");
  fitPill.className = `status-pill ${getStatusClass(imageItem.fitStatus)}`;
  fitPill.textContent = getFitStatusLabel(imageItem);

  const outlinePill = document.createElement("span");
  outlinePill.className = `status-pill ${getStatusClass(imageItem.outlineStatus)}`;
  outlinePill.textContent = getOutlineStatusLabel(imageItem);

  const downloadButton = document.createElement("button");
  downloadButton.className = "button button-secondary download-button";
  downloadButton.type = "button";
  downloadButton.textContent = t("preview.downloadPng");
  downloadButton.disabled = !imageItem.finalUrl || appState.isProcessing;
  downloadButton.setAttribute("aria-label", t("preview.downloadAria", { name: imageItem.name }));
  downloadButton.addEventListener("click", () => downloadProcessedImage(imageItem));

  const removeButton = document.createElement("button");
  removeButton.className = "button remove-button";
  removeButton.type = "button";
  removeButton.textContent = t("preview.delete");
  removeButton.disabled = appState.isProcessing;
  removeButton.setAttribute("aria-label", t("preview.deleteAria", { name: imageItem.name }));
  removeButton.addEventListener("click", () => removeImage(imageItem.id));

  const cardActions = document.createElement("div");
  cardActions.className = "card-actions";
  cardActions.append(downloadButton, removeButton);

  metadata.append(fileName, imageSize, fitPill, outlinePill);
  card.append(previewPair, metadata, cardActions);

  return card;
}

function createPreviewImageBlock(label, imageUrl, fileName) {
  const block = document.createElement("div");
  block.className = "preview-image-block";

  const title = document.createElement("span");
  title.className = "preview-label";
  title.textContent = label;

  const thumbnailFrame = document.createElement("div");
  thumbnailFrame.className = "thumbnail-frame";

  const image = document.createElement("img");
  image.src = imageUrl;
  image.alt = `${label}: ${fileName}`;
  image.loading = "lazy";
  thumbnailFrame.appendChild(image);

  block.append(title, thumbnailFrame);

  return block;
}

function createResultImageBlock(imageItem) {
  if (imageItem.finalUrl) {
    const label = imageItem.finalKind === "outline" ? t("preview.finalOutline") : t("preview.canvasFit");
    return createPreviewImageBlock(label, imageItem.finalUrl, imageItem.finalFileName || imageItem.name);
  }

  const block = document.createElement("div");
  block.className = "preview-image-block";

  const title = document.createElement("span");
  title.className = "preview-label";
  title.textContent = t("preview.result");

  const thumbnailFrame = document.createElement("div");
  thumbnailFrame.className = "thumbnail-frame result-placeholder";
  thumbnailFrame.textContent = getResultPlaceholderText(imageItem);

  block.append(title, thumbnailFrame);

  return block;
}

function getResultPlaceholderText(imageItem) {
  if (imageItem.fitStatus === "processing" || imageItem.outlineStatus === "processing") {
    return t("preview.processing");
  }

  return t("preview.applyHint");
}

function getImageSizeLabel(imageItem) {
  if (imageItem.status === "error") {
    return t("preview.sizeError");
  }

  if (!imageItem.width || !imageItem.height) {
    return t("preview.sizeReading");
  }

  return `${imageItem.width} x ${imageItem.height}px`;
}

function getFitStatusLabel(imageItem) {
  if (imageItem.fitStatus === "ready") {
    const artworkSize = imageItem.fitPlacement
      ? ` / ${t("preview.artwork")} ${imageItem.fitPlacement.resizedWidth} x ${imageItem.fitPlacement.resizedHeight}px`
      : ` / ${t("preview.transparentImage")}`;

    return `${t("preview.canvasFit")} ${imageItem.fitWidth} x ${imageItem.fitHeight}px${artworkSize}`;
  }

  if (imageItem.fitStatus === "processing") {
    return t("preview.fitProcessing");
  }

  if (imageItem.fitStatus === "error") {
    return imageItem.fitError || t("preview.fitFailed");
  }

  if (imageItem.status === "error") {
    return t("preview.originalError");
  }

  return t("preview.fitNotApplied");
}

function getOutlineStatusLabel(imageItem) {
  if (imageItem.outlineStatus === "ready") {
    const thicknessLabel = imageItem.outlineAppliedThickness
      ? ` / ${imageItem.outlineAppliedThickness}px${imageItem.outlineThicknessClamped ? ` (${t("preview.safeLimit")})` : ""}`
      : "";

    return `${t("preview.outlined")} ${imageItem.outlineWidth} x ${imageItem.outlineHeight}px${thicknessLabel}`;
  }

  if (imageItem.outlineStatus === "processing") {
    return t("preview.outlineProcessing");
  }

  if (imageItem.outlineStatus === "error") {
    return imageItem.outlineError || t("preview.outlineFailed");
  }

  if (imageItem.status === "error") {
    return t("preview.originalError");
  }

  return t("preview.outlineNotApplied");
}

function getStatusClass(status) {
  if (status === "ready") {
    return "is-ready";
  }

  if (status === "processing") {
    return "is-processing";
  }

  if (status === "error") {
    return "is-error";
  }

  return "";
}

function syncCanvasFitOptions() {
  const width = Number.parseInt(elements.canvasWidthInput.value, 10);
  const height = Number.parseInt(elements.canvasHeightInput.value, 10);

  if (!Number.isFinite(width) || width < 1 || !Number.isFinite(height) || height < 1) {
    return false;
  }

  appState.canvasFitOptions.width = width;
  appState.canvasFitOptions.height = height;
  appState.canvasFitOptions.safeMargin = width === 96 && height === 74 ? 4 : CANVAS_FIT_SAFE_MARGIN;
  elements.safeMarginValue.textContent = `${appState.canvasFitOptions.safeMargin}px`;
  return true;
}

async function applyCanvasFitToAllImages() {
  const readyImages = appState.uploadedImages.filter((imageItem) => imageItem.status === "ready");

  if (!syncCanvasFitOptions()) {
    setProcessMessage("process.invalidCanvas");
    return;
  }

  if (readyImages.length === 0) {
    setProcessMessage("process.uploadBeforeFit");
    return;
  }

  appState.isProcessing = true;
  elements.applyCanvasFitButton.disabled = true;
  setProcessMessage("process.fitProgress", { current: 0, total: readyImages.length });

  let completedCount = 0;
  let failedCount = 0;

  for (const imageItem of readyImages) {
    imageItem.fitStatus = "processing";
    imageItem.fitError = "";
    renderPreview();

    try {
      await applyCanvasFitToImageItem(imageItem, appState.canvasFitOptions);
      completedCount += 1;
    } catch (error) {
      revokeFitUrl(imageItem);
      revokeOutlineUrl(imageItem);
      clearFinalResult(imageItem);
      imageItem.fitStatus = "error";
      imageItem.fitError = error.message || t("preview.fitFailed");
      failedCount += 1;
    }

    setProcessMessage("process.fitProgress", { current: completedCount + failedCount, total: readyImages.length });
    renderPreview();
  }

  setProcessMessage("process.fitComplete", { completed: completedCount, failed: failedCount });
  appState.isProcessing = false;
  renderPreview();
}

async function applyCanvasFitToImageItem(imageItem, options, finalFileName = null) {
  const result = await createCanvasFitPngBlob(imageItem.file, imageItem.objectUrl, options);

  revokeFitUrl(imageItem);
  revokeOutlineUrl(imageItem);
  clearFinalResult(imageItem);

  imageItem.fitBlob = result.blob;
  imageItem.fitUrl = URL.createObjectURL(result.blob);
  imageItem.fitWidth = result.width;
  imageItem.fitHeight = result.height;
  imageItem.fitPlacement = result.placement;
  imageItem.fitStatus = "ready";
  const resolvedFinalFileName = typeof finalFileName === "function" ? finalFileName(imageItem) : finalFileName;

  setFinalResult(imageItem, {
    blob: imageItem.fitBlob,
    url: imageItem.fitUrl,
    fileName: resolvedFinalFileName || createProcessedFileName(imageItem.name, ["fit"]),
    width: result.width,
    height: result.height,
    kind: "fit",
  });
}

async function applyPresetToAllImages(options, finalFileName, labelKey) {
  const readyImages = appState.uploadedImages.filter((imageItem) => imageItem.status === "ready");

  if (readyImages.length === 0) {
    setProcessMessage("process.uploadBeforePreset", { label: t(labelKey) });
    return;
  }

  appState.isProcessing = true;
  setProcessMessage("process.presetProgress", { label: t(labelKey), current: 0, total: readyImages.length });
  let completedCount = 0;
  let failedCount = 0;

  for (const imageItem of readyImages) {
    imageItem.fitStatus = "processing";
    imageItem.fitError = "";
    renderPreview();

    try {
      await applyCanvasFitToImageItem(imageItem, options, finalFileName);
      completedCount += 1;
    } catch (error) {
      revokeFitUrl(imageItem);
      revokeOutlineUrl(imageItem);
      clearFinalResult(imageItem);
      imageItem.fitStatus = "error";
      imageItem.fitError = error.message || `${t(labelKey)} ${t("preview.fitFailed")}`;
      failedCount += 1;
    }

    setProcessMessage("process.presetProgress", { label: t(labelKey), current: completedCount + failedCount, total: readyImages.length });
    renderPreview();
  }

  setProcessMessage("process.presetComplete", { label: t(labelKey), completed: completedCount, failed: failedCount });
  appState.isProcessing = false;
  renderPreview();
}

async function createCanvasFitPngBlob(file, objectUrl, options) {
  const sourceImage = await loadSourceImage(file, objectUrl);
  const sourceWidth = sourceImage.width;
  const sourceHeight = sourceImage.height;
  const sourceCanvas = document.createElement("canvas");
  const sourceContext = sourceCanvas.getContext("2d", { willReadFrequently: true });

  sourceCanvas.width = sourceWidth;
  sourceCanvas.height = sourceHeight;
  sourceContext.clearRect(0, 0, sourceWidth, sourceHeight);
  sourceContext.drawImage(sourceImage, 0, 0);

  if (sourceImage.close) {
    sourceImage.close();
  }

  const imageData = sourceContext.getImageData(0, 0, sourceWidth, sourceHeight);
  const contentBox = getAlphaBoundingBox(imageData.data, sourceWidth, sourceHeight);
  const resultCanvas = document.createElement("canvas");
  const resultContext = resultCanvas.getContext("2d");
  const canvasWidth = Math.max(1, Math.round(options.width));
  const canvasHeight = Math.max(1, Math.round(options.height));
  const effectiveMargin = Math.min(
    options.safeMargin,
    Math.floor((canvasWidth - 1) / 2),
    Math.floor((canvasHeight - 1) / 2),
  );
  const availableWidth = Math.max(1, canvasWidth - effectiveMargin * 2);
  const availableHeight = Math.max(1, canvasHeight - effectiveMargin * 2);

  resultCanvas.width = canvasWidth;
  resultCanvas.height = canvasHeight;
  resultContext.imageSmoothingEnabled = true;
  resultContext.imageSmoothingQuality = "high";
  resultContext.clearRect(0, 0, canvasWidth, canvasHeight);

  if (!contentBox) {
    return {
      blob: await canvasToPngBlob(resultCanvas),
      width: canvasWidth,
      height: canvasHeight,
      placement: null,
    };
  }

  const contentWidth = contentBox.width;
  const contentHeight = contentBox.height;
  const scale = Math.min(availableWidth / contentWidth, availableHeight / contentHeight);
  const resizedWidth = Math.max(1, Math.floor(contentWidth * scale));
  const resizedHeight = Math.max(1, Math.floor(contentHeight * scale));
  const x = Math.floor((canvasWidth - resizedWidth) / 2);
  const y = Math.floor((canvasHeight - resizedHeight) / 2);

  resultContext.drawImage(
    sourceCanvas,
    contentBox.x,
    contentBox.y,
    contentWidth,
    contentHeight,
    x,
    y,
    resizedWidth,
    resizedHeight,
  );

  return {
    blob: await canvasToPngBlob(resultCanvas),
    width: canvasWidth,
    height: canvasHeight,
    placement: {
      contentWidth,
      contentHeight,
      scale,
      resizedWidth,
      resizedHeight,
      x,
      y,
      safeMargin: effectiveMargin,
    },
  };
}

function getAlphaBoundingBox(rgbaData, width, height) {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const alpha = rgbaData[(y * width + x) * 4 + 3];

      if (alpha === 0) {
        continue;
      }

      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  if (maxX < minX || maxY < minY) {
    return null;
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  };
}

async function applyOutlineToAllImages() {
  const readyImages = appState.uploadedImages.filter((imageItem) => imageItem.status === "ready");

  if (readyImages.length === 0) {
    setProcessMessage("process.uploadBeforeOutline");
    return;
  }

  appState.isProcessing = true;
  elements.applyOutlineButton.disabled = true;
  setProcessMessage("process.outlineProgress", { current: 0, total: readyImages.length });

  let completedCount = 0;
  let failedCount = 0;

  for (const imageItem of readyImages) {
    imageItem.outlineStatus = "processing";
    imageItem.outlineError = "";
    renderPreview();

    try {
      await applyOutlineToImageItem(imageItem);
      completedCount += 1;
    } catch (error) {
      revokeOutlineUrl(imageItem);
      imageItem.outlineStatus = "error";
      imageItem.outlineError = error.message || t("preview.outlineFailed");
      failedCount += 1;
    }

    setProcessMessage("process.outlineProgress", { current: completedCount + failedCount, total: readyImages.length });
    renderPreview();
  }

  setProcessMessage("process.outlineComplete", { completed: completedCount, failed: failedCount });
  appState.isProcessing = false;
  renderPreview();
}

async function applyOutlineToImageItem(imageItem) {
  const sourceBlob = imageItem.fitBlob || imageItem.file;
  const sourceUrl = imageItem.fitUrl || imageItem.objectUrl;
  const requestedThickness = Math.max(1, Math.round(appState.outlineOptions.thickness));
  const fitSafeMargin = imageItem.fitPlacement?.safeMargin ?? 0;
  const preserveCanvasSize = Boolean(imageItem.fitBlob && imageItem.fitPlacement && fitSafeMargin >= 2);
  const maximumSafeThickness = preserveCanvasSize ? Math.max(1, fitSafeMargin - 1) : requestedThickness;
  const appliedThickness = Math.min(requestedThickness, maximumSafeThickness);
  const result = await createOutlinedPngBlob(sourceBlob, sourceUrl, {
    ...appState.outlineOptions,
    thickness: appliedThickness,
    preserveCanvasSize,
  });

  revokeOutlineUrl(imageItem);
  clearFinalResult(imageItem);
  imageItem.outlineBlob = result.blob;
  imageItem.outlineUrl = URL.createObjectURL(result.blob);
  imageItem.outlineWidth = result.width;
  imageItem.outlineHeight = result.height;
  imageItem.outlineAppliedThickness = result.appliedThickness;
  imageItem.outlineThicknessClamped = appliedThickness !== requestedThickness;
  imageItem.outlineStatus = "ready";
  setFinalResult(imageItem, {
    blob: imageItem.outlineBlob,
    url: imageItem.outlineUrl,
    fileName: createProcessedFileName(imageItem.name, imageItem.fitBlob ? ["fit", "outline"] : ["outline"]),
    width: result.width,
    height: result.height,
    kind: "outline",
  });
}

function resetOptions() {
  appState.outlineOptions.thickness = 8;
  appState.outlineOptions.color = "#ffffff";
  appState.canvasFitOptions.width = 740;
  appState.canvasFitOptions.height = 640;
  appState.canvasFitOptions.safeMargin = CANVAS_FIT_SAFE_MARGIN;
  elements.thicknessInput.value = "8";
  elements.thicknessValue.textContent = "8";
  elements.colorInput.value = "#ffffff";
  elements.canvasWidthInput.value = "740";
  elements.canvasHeightInput.value = "640";
  elements.safeMarginValue.textContent = `${CANVAS_FIT_SAFE_MARGIN}px`;
  setProcessMessage("process.reset");
}

function formatUploadSummary(uploadCount) {
  if (appState.locale === "ko") {
    return t("preview.uploadCount", { count: uploadCount });
  }

  return t("preview.uploadCount", {
    count: uploadCount,
    unit: uploadCount === 1 ? t("preview.imageSingular") : t("preview.imagePlural"),
  });
}

function downloadProcessedImage(imageItem) {
  if (!imageItem.finalUrl || !imageItem.finalFileName) {
    return;
  }

  triggerDownload(imageItem.finalUrl, imageItem.finalFileName);
}

async function downloadProcessedImagesZip() {
  const processedImages = getProcessedImages();

  if (processedImages.length === 0) {
    return;
  }

  elements.downloadZipButton.disabled = true;

  try {
    const zipFileNames = createUniqueFileNames(processedImages.map((imageItem) => imageItem.finalFileName));
    const zipBlob = await createZipBlob(
      processedImages.map((imageItem, index) => ({
        name: zipFileNames[index],
        blob: imageItem.finalBlob,
      })),
    );
    const zipUrl = URL.createObjectURL(zipBlob);

    triggerDownload(zipUrl, processedZipFileName);
    window.setTimeout(() => URL.revokeObjectURL(zipUrl), 1000);
  } catch (error) {
    setProcessMessage("process.zipError");
  } finally {
    renderPreview();
  }
}

function getProcessedImages() {
  return appState.uploadedImages.filter((imageItem) => imageItem.finalBlob && imageItem.finalUrl);
}

function createProcessedFileName(fileName, suffixes) {
  const extensionIndex = fileName.lastIndexOf(".");
  const baseName = extensionIndex > 0 ? fileName.slice(0, extensionIndex) : fileName;
  const safeBaseName = baseName.trim() || "image";

  return `${safeBaseName}_${suffixes.join("_")}.png`;
}

function createUniqueFileNames(fileNames) {
  const usedNames = new Map();

  return fileNames.map((fileName) => {
    const extensionIndex = fileName.lastIndexOf(".");
    const baseName = extensionIndex > 0 ? fileName.slice(0, extensionIndex) : fileName;
    const extension = extensionIndex > 0 ? fileName.slice(extensionIndex) : ".png";
    const normalizedName = fileName.toLocaleLowerCase();
    const usedCount = usedNames.get(normalizedName) || 0;

    usedNames.set(normalizedName, usedCount + 1);

    if (usedCount === 0) {
      return fileName;
    }

    const uniqueFileName = `${baseName}_${usedCount + 1}${extension}`;
    usedNames.set(uniqueFileName.toLocaleLowerCase(), 1);

    return uniqueFileName;
  });
}

function setFinalResult(imageItem, result) {
  imageItem.finalBlob = result.blob;
  imageItem.finalUrl = result.url;
  imageItem.finalFileName = result.fileName;
  imageItem.finalWidth = result.width;
  imageItem.finalHeight = result.height;
  imageItem.finalKind = result.kind;
}

function clearFinalResult(imageItem) {
  imageItem.finalBlob = null;
  imageItem.finalUrl = null;
  imageItem.finalFileName = null;
  imageItem.finalWidth = null;
  imageItem.finalHeight = null;
  imageItem.finalKind = null;
}

function revokeFitUrl(imageItem) {
  if (imageItem.fitUrl) {
    URL.revokeObjectURL(imageItem.fitUrl);
    imageItem.fitUrl = null;
  }

  imageItem.fitBlob = null;
  imageItem.fitWidth = null;
  imageItem.fitHeight = null;
  imageItem.fitPlacement = null;
  imageItem.fitError = "";
  imageItem.fitStatus = "idle";
}

function revokeOutlineUrl(imageItem) {
  if (imageItem.outlineUrl) {
    URL.revokeObjectURL(imageItem.outlineUrl);
    imageItem.outlineUrl = null;
  }

  imageItem.outlineBlob = null;
  imageItem.outlineWidth = null;
  imageItem.outlineHeight = null;
  imageItem.outlineAppliedThickness = null;
  imageItem.outlineThicknessClamped = false;
  imageItem.outlineError = "";
  imageItem.outlineStatus = "idle";
}

async function loadSourceImage(file, objectUrl) {
  if (window.createImageBitmap) {
    try {
      return await createImageBitmap(file);
    } catch (error) {
      console.warn("createImageBitmap failed. Falling back to HTMLImageElement.", error);
    }
  }

  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(t("error.loadImage")));
    image.src = objectUrl;
  });
}

function canvasToPngBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error(t("error.createFitPng")));
        return;
      }

      resolve(blob);
    }, "image/png");
  });
}

window.addEventListener("beforeunload", () => {
  appState.uploadedImages.forEach((imageItem) => {
    URL.revokeObjectURL(imageItem.objectUrl);
    revokeFitUrl(imageItem);
    revokeOutlineUrl(imageItem);
    clearFinalResult(imageItem);
  });
});

document.addEventListener("DOMContentLoaded", initializeApp);
