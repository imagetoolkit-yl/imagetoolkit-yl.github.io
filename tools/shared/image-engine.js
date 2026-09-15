(function registerImageEngine(globalScope) {
  "use strict";

  const MAX_DIMENSION = 12000;
  const MAX_PIXELS = 64000000;
  const SUPPORTED_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

  function validateFile(file) {
    if (!(file instanceof Blob) || !SUPPORTED_TYPES.has(file.type)) {
      throw new Error("PNG, JPEG, WebP 이미지만 사용할 수 있습니다. / Use a PNG, JPEG, or WebP image.");
    }
  }

  function validateSize(width, height) {
    const w = Number.parseInt(width, 10);
    const h = Number.parseInt(height, 10);
    if (!Number.isFinite(w) || !Number.isFinite(h) || w < 1 || h < 1) {
      throw new Error("너비와 높이는 1 이상의 정수여야 합니다. / Width and height must be positive integers.");
    }
    if (w > MAX_DIMENSION || h > MAX_DIMENSION || w * h > MAX_PIXELS) {
      throw new Error("결과 크기가 안전 한도를 넘습니다. 최대 12,000px, 64MP입니다. / Output exceeds the 12,000px or 64MP safety limit.");
    }
    return { width: w, height: h };
  }

  async function decode(file) {
    validateFile(file);
    if (globalScope.createImageBitmap) {
      try { return await createImageBitmap(file); } catch (error) { /* fallback below */ }
    }
    const url = URL.createObjectURL(file);
    try {
      return await new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error("이미지를 읽을 수 없습니다. / The image could not be decoded."));
        image.src = url;
      });
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  function closeImage(image) {
    if (image && typeof image.close === "function") image.close();
  }

  function createCanvas(width, height, background) {
    const size = validateSize(width, height);
    const canvas = document.createElement("canvas");
    canvas.width = size.width;
    canvas.height = size.height;
    const context = canvas.getContext("2d", { alpha: true });
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    if (background && background !== "transparent") {
      context.fillStyle = background;
      context.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
    return { canvas, context };
  }

  function canvasToBlob(canvas, type, quality) {
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("결과 파일을 만들 수 없습니다. / Could not export the result.")), type, quality);
    });
  }

  async function resize(file, options) {
    const size = validateSize(options.width, options.height);
    const outputType = options.type || "image/png";
    const background = outputType === "image/jpeg" ? (options.background || "#ffffff") : options.background;
    const image = await decode(file);
    try {
      const { canvas, context } = createCanvas(size.width, size.height, background);
      context.drawImage(image, 0, 0, size.width, size.height);
      return { blob: await canvasToBlob(canvas, outputType, options.quality), width: size.width, height: size.height, type: outputType };
    } finally { closeImage(image); }
  }

  async function fit(file, options) {
    const size = validateSize(options.width, options.height);
    const image = await decode(file);
    try {
      const { canvas, context } = createCanvas(size.width, size.height, options.background);
      const mode = options.mode === "cover" ? "cover" : "contain";
      const scale = mode === "cover"
        ? Math.max(size.width / image.width, size.height / image.height)
        : Math.min(size.width / image.width, size.height / image.height);
      const drawWidth = image.width * scale;
      const drawHeight = image.height * scale;
      const focalX = Math.min(100, Math.max(0, Number(options.focalX ?? 50))) / 100;
      const focalY = Math.min(100, Math.max(0, Number(options.focalY ?? 50))) / 100;
      const x = (size.width - drawWidth) * focalX;
      const y = (size.height - drawHeight) * focalY;
      context.drawImage(image, x, y, drawWidth, drawHeight);
      const type = options.type || "image/png";
      return { blob: await canvasToBlob(canvas, type, options.quality), width: size.width, height: size.height, type };
    } finally { closeImage(image); }
  }

  async function fitVisibleArtwork(file, options) {
    const size = validateSize(options.width, options.height);
    const margin = Math.max(0, Math.min(Math.floor(Math.min(size.width, size.height) / 2), Number(options.margin) || 0));
    const image = await decode(file);
    try {
      const sourceCanvas = document.createElement("canvas");
      sourceCanvas.width = image.width;
      sourceCanvas.height = image.height;
      const sourceContext = sourceCanvas.getContext("2d", { willReadFrequently: true });
      sourceContext.drawImage(image, 0, 0);
      const pixels = sourceContext.getImageData(0, 0, image.width, image.height).data;
      let left = image.width, top = image.height, right = -1, bottom = -1;
      for (let y = 0; y < image.height; y += 1) {
        for (let x = 0; x < image.width; x += 1) {
          if (pixels[(y * image.width + x) * 4 + 3] > 0) {
            if (x < left) left = x;
            if (x > right) right = x;
            if (y < top) top = y;
            if (y > bottom) bottom = y;
          }
        }
      }
      const bounds = right >= left && bottom >= top
        ? { x: left, y: top, width: right - left + 1, height: bottom - top + 1 }
        : { x: 0, y: 0, width: image.width, height: image.height };
      const availableWidth = Math.max(1, size.width - margin * 2);
      const availableHeight = Math.max(1, size.height - margin * 2);
      const scale = Math.min(availableWidth / bounds.width, availableHeight / bounds.height);
      const x = (size.width - bounds.width * scale) / 2 - bounds.x * scale;
      const y = (size.height - bounds.height * scale) / 2 - bounds.y * scale;
      const { canvas, context } = createCanvas(size.width, size.height, "transparent");
      context.drawImage(image, x, y, image.width * scale, image.height * scale);
      return { blob: await canvasToBlob(canvas, "image/png"), width: size.width, height: size.height, type: "image/png" };
    } finally { closeImage(image); }
  }

  async function convert(file, options) {
    const image = await decode(file);
    try {
      const type = options.type || "image/png";
      const background = type === "image/jpeg" ? (options.background || "#ffffff") : "transparent";
      const { canvas, context } = createCanvas(image.width, image.height, background);
      context.drawImage(image, 0, 0);
      return { blob: await canvasToBlob(canvas, type, options.quality), width: image.width, height: image.height, type };
    } finally { closeImage(image); }
  }

  async function metadata(file) {
    const image = await decode(file);
    const result = { width: image.width, height: image.height, type: file.type, size: file.size };
    closeImage(image);
    return result;
  }

  function extensionForType(type) {
    return type === "image/jpeg" ? "jpg" : type === "image/webp" ? "webp" : "png";
  }

  function outputName(fileName, suffix, type) {
    const dot = fileName.lastIndexOf(".");
    const base = (dot > 0 ? fileName.slice(0, dot) : fileName).trim() || "image";
    return `${base}_${suffix}.${extensionForType(type)}`;
  }

  function formatBytes(bytes) {
    if (!Number.isFinite(bytes) || bytes < 1) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    const unit = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const value = bytes / Math.pow(1024, unit);
    return `${value.toFixed(value >= 10 || unit === 0 ? 0 : 1)} ${units[unit]}`;
  }

  function download(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  globalScope.ImageToolkitEngine = {
    MAX_DIMENSION, MAX_PIXELS, SUPPORTED_TYPES, canvasToBlob, convert, decode, download,
    extensionForType, fit, fitVisibleArtwork, formatBytes, metadata, outputName, resize, validateFile, validateSize,
  };
})(window);
