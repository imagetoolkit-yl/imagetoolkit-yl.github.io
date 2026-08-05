(function registerOutlineEngine(globalScope) {
async function createOutlinedPngBlob(file, objectUrl, options) {
  const sourceImage = await loadSourceImage(file, objectUrl);
  const resultCanvas = createOutlineCanvas(sourceImage, {
    thickness: options.thickness,
    color: options.color,
    preserveCanvasSize: options.preserveCanvasSize === true,
  });
  const resultBlob = await canvasToPngBlob(resultCanvas);

  if (sourceImage.close) {
    sourceImage.close();
  }

  return {
    blob: resultBlob,
    width: resultCanvas.width,
    height: resultCanvas.height,
    appliedThickness: Math.max(1, Math.round(options.thickness)),
    preservedCanvasSize: options.preserveCanvasSize === true,
  };
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
    image.onerror = () => reject(new Error("Could not load image"));
    image.src = objectUrl;
  });
}

function createOutlineCanvas(sourceImage, options) {
  const thickness = Math.max(1, Math.round(options.thickness));
  const sourceWidth = sourceImage.width;
  const sourceHeight = sourceImage.height;
  const preserveCanvasSize = options.preserveCanvasSize === true;
  const outputWidth = preserveCanvasSize ? sourceWidth : sourceWidth + thickness * 2;
  const outputHeight = preserveCanvasSize ? sourceHeight : sourceHeight + thickness * 2;
  const sourceOffset = preserveCanvasSize ? 0 : thickness;
  const sourceCanvas = document.createElement("canvas");
  const outputCanvas = document.createElement("canvas");

  sourceCanvas.width = sourceWidth;
  sourceCanvas.height = sourceHeight;
  outputCanvas.width = outputWidth;
  outputCanvas.height = outputHeight;

  const sourceContext = sourceCanvas.getContext("2d", { willReadFrequently: true });
  const outputContext = outputCanvas.getContext("2d");

  sourceContext.clearRect(0, 0, sourceWidth, sourceHeight);
  sourceContext.drawImage(sourceImage, 0, 0);

  const sourceImageData = sourceContext.getImageData(0, 0, sourceWidth, sourceHeight);
  const sourceData = sourceImageData.data;
  const outputImageData = outputContext.createImageData(outputWidth, outputHeight);
  const outputData = outputImageData.data;
  const outlineColor = hexToRgb(options.color);
  const sourceAlpha = extractAlphaChannel(sourceData);
  const cleanAlpha = removeIsolatedAlphaNoise(sourceAlpha, sourceWidth, sourceHeight);
  const outlineSourceAlpha = preserveCanvasSize
    ? cleanAlpha
    : padAlphaChannel(cleanAlpha, sourceWidth, sourceHeight, thickness);
  const expandedAlpha = createQualityOutlineAlpha(outlineSourceAlpha, outputWidth, outputHeight, thickness);

  for (let index = 0; index < expandedAlpha.length; index += 1) {
    const outputIndex = index * 4;

    outputData[outputIndex] = outlineColor.r;
    outputData[outputIndex + 1] = outlineColor.g;
    outputData[outputIndex + 2] = outlineColor.b;
    outputData[outputIndex + 3] = expandedAlpha[index];
  }

  outputContext.putImageData(outputImageData, 0, 0);
  outputContext.drawImage(sourceImage, sourceOffset, sourceOffset);

  return outputCanvas;
}

function createQualityOutlineAlpha(alpha, width, height, radius) {
  const coreAlpha = dilateAlphaChannel(alpha, width, height, radius);
  const antialiasAlpha = dilateAlphaChannel(alpha, width, height, radius + 1);

  return softenOutlineEdge(coreAlpha, antialiasAlpha, width, height);
}

function extractAlphaChannel(rgbaData) {
  const alpha = new Uint8ClampedArray(rgbaData.length / 4);

  for (let sourceIndex = 3, alphaIndex = 0; sourceIndex < rgbaData.length; sourceIndex += 4) {
    alpha[alphaIndex] = rgbaData[sourceIndex];
    alphaIndex += 1;
  }

  return alpha;
}

function removeIsolatedAlphaNoise(alpha, width, height) {
  const cleanedAlpha = new Uint8ClampedArray(alpha);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = y * width + x;
      const currentAlpha = alpha[index];

      if (currentAlpha === 0 || currentAlpha >= 24) {
        continue;
      }

      if (!hasNeighborAlphaAbove(alpha, width, height, x, y, 64)) {
        cleanedAlpha[index] = 0;
      }
    }
  }

  return cleanedAlpha;
}

function hasNeighborAlphaAbove(alpha, width, height, centerX, centerY, threshold) {
  const top = Math.max(0, centerY - 1);
  const bottom = Math.min(height - 1, centerY + 1);
  const left = Math.max(0, centerX - 1);
  const right = Math.min(width - 1, centerX + 1);

  for (let y = top; y <= bottom; y += 1) {
    for (let x = left; x <= right; x += 1) {
      if (x === centerX && y === centerY) {
        continue;
      }

      if (alpha[y * width + x] >= threshold) {
        return true;
      }
    }
  }

  return false;
}

function padAlphaChannel(sourceAlpha, sourceWidth, sourceHeight, padding) {
  const outputWidth = sourceWidth + padding * 2;
  const outputHeight = sourceHeight + padding * 2;
  const paddedAlpha = new Uint8ClampedArray(outputWidth * outputHeight);

  for (let y = 0; y < sourceHeight; y += 1) {
    const sourceStart = y * sourceWidth;
    const outputStart = (y + padding) * outputWidth + padding;
    paddedAlpha.set(sourceAlpha.subarray(sourceStart, sourceStart + sourceWidth), outputStart);
  }

  return paddedAlpha;
}

function dilateAlphaChannel(alpha, width, height, radius) {
  const horizontalPass = maxFilterHorizontal(alpha, width, height, radius);

  return maxFilterVertical(horizontalPass, width, height, radius);
}

function maxFilterHorizontal(alpha, width, height, radius) {
  const filteredAlpha = new Uint8ClampedArray(alpha.length);

  for (let y = 0; y < height; y += 1) {
    const rowOffset = y * width;

    for (let x = 0; x < width; x += 1) {
      const left = Math.max(0, x - radius);
      const right = Math.min(width - 1, x + radius);
      let maxAlpha = 0;

      for (let sampleX = left; sampleX <= right; sampleX += 1) {
        const sampleAlpha = alpha[rowOffset + sampleX];

        if (sampleAlpha > maxAlpha) {
          maxAlpha = sampleAlpha;

          if (maxAlpha === 255) {
            break;
          }
        }
      }

      filteredAlpha[rowOffset + x] = maxAlpha;
    }
  }

  return filteredAlpha;
}

function maxFilterVertical(alpha, width, height, radius) {
  const filteredAlpha = new Uint8ClampedArray(alpha.length);

  for (let y = 0; y < height; y += 1) {
    const top = Math.max(0, y - radius);
    const bottom = Math.min(height - 1, y + radius);

    for (let x = 0; x < width; x += 1) {
      let maxAlpha = 0;

      for (let sampleY = top; sampleY <= bottom; sampleY += 1) {
        const sampleAlpha = alpha[sampleY * width + x];

        if (sampleAlpha > maxAlpha) {
          maxAlpha = sampleAlpha;

          if (maxAlpha === 255) {
            break;
          }
        }
      }

      filteredAlpha[y * width + x] = maxAlpha;
    }
  }

  return filteredAlpha;
}

function softenOutlineEdge(coreAlpha, antialiasAlpha, width, height) {
  const softenedAlpha = new Uint8ClampedArray(coreAlpha);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = y * width + x;

      if (coreAlpha[index] > 0) {
        softenedAlpha[index] = isAlphaEdgePixel(coreAlpha, width, height, x, y)
          ? getSmoothedAlpha(coreAlpha, width, height, x, y)
          : coreAlpha[index];
        continue;
      }

      if (antialiasAlpha[index] > 0) {
        softenedAlpha[index] = Math.max(24, Math.round(antialiasAlpha[index] * 0.42));
      }
    }
  }

  return softenedAlpha;
}

function isAlphaEdgePixel(alpha, width, height, centerX, centerY) {
  const currentAlpha = alpha[centerY * width + centerX];

  if (currentAlpha === 0) {
    return false;
  }

  const top = Math.max(0, centerY - 1);
  const bottom = Math.min(height - 1, centerY + 1);
  const left = Math.max(0, centerX - 1);
  const right = Math.min(width - 1, centerX + 1);

  for (let y = top; y <= bottom; y += 1) {
    for (let x = left; x <= right; x += 1) {
      if (alpha[y * width + x] === 0) {
        return true;
      }
    }
  }

  return false;
}

function getSmoothedAlpha(alpha, width, height, centerX, centerY) {
  const weightedSamples = [
    { x: centerX, y: centerY, weight: 4 },
    { x: centerX - 1, y: centerY, weight: 2 },
    { x: centerX + 1, y: centerY, weight: 2 },
    { x: centerX, y: centerY - 1, weight: 2 },
    { x: centerX, y: centerY + 1, weight: 2 },
    { x: centerX - 1, y: centerY - 1, weight: 1 },
    { x: centerX + 1, y: centerY - 1, weight: 1 },
    { x: centerX - 1, y: centerY + 1, weight: 1 },
    { x: centerX + 1, y: centerY + 1, weight: 1 },
  ];
  let weightedAlpha = 0;
  let totalWeight = 0;

  weightedSamples.forEach((sample) => {
    if (sample.x < 0 || sample.y < 0 || sample.x >= width || sample.y >= height) {
      return;
    }

    weightedAlpha += alpha[sample.y * width + sample.x] * sample.weight;
    totalWeight += sample.weight;
  });

  return Math.max(alpha[centerY * width + centerX], Math.round(weightedAlpha / totalWeight));
}

function hexToRgb(hexColor) {
  const normalizedColor = hexColor.replace("#", "");
  const numericColor = Number.parseInt(normalizedColor, 16);

  return {
    r: (numericColor >> 16) & 255,
    g: (numericColor >> 8) & 255,
    b: numericColor & 255,
  };
}

function canvasToPngBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Could not create outlined PNG preview"));
        return;
      }

      resolve(blob);
    }, "image/png");
  });
}

globalScope.ImageToolkitOutlineEngine = {
  createOutlinedPngBlob,
};
})(window);
