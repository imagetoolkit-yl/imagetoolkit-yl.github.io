(function registerDownloadUtils(globalScope) {
const outlinedZipFileName = "image-toolkit-outlined-images.zip";

function triggerDownload(url, fileName) {
  const downloadLink = document.createElement("a");
  downloadLink.href = url;
  downloadLink.download = fileName;
  downloadLink.rel = "noopener";
  document.body.appendChild(downloadLink);
  downloadLink.click();
  downloadLink.remove();
}

function createOutlinedFileName(fileName) {
  const extensionIndex = fileName.lastIndexOf(".");
  const baseName = extensionIndex > 0 ? fileName.slice(0, extensionIndex) : fileName;
  const safeBaseName = baseName.trim() || "image";

  return `${safeBaseName}_outline.png`;
}

function createUniqueZipFileNames(fileNames) {
  const usedNames = new Map();

  return fileNames.map((fileName) => {
    const outlinedFileName = createOutlinedFileName(fileName);
    const extensionIndex = outlinedFileName.lastIndexOf(".");
    const baseName = outlinedFileName.slice(0, extensionIndex);
    const extension = outlinedFileName.slice(extensionIndex);
    const normalizedName = outlinedFileName.toLocaleLowerCase();
    const usedCount = usedNames.get(normalizedName) || 0;

    usedNames.set(normalizedName, usedCount + 1);

    if (usedCount === 0) {
      return outlinedFileName;
    }

    const uniqueFileName = `${baseName}_${usedCount + 1}${extension}`;
    usedNames.set(uniqueFileName.toLocaleLowerCase(), 1);

    return uniqueFileName;
  });
}

globalScope.ImageToolkitDownloadUtils = {
  createOutlinedFileName,
  createUniqueZipFileNames,
  outlinedZipFileName,
  triggerDownload,
};
})(window);
