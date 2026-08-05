(function registerZipWriter(globalScope) {
let crc32Table = null;

async function createZipBlob(entries) {
  const localParts = [];
  const centralDirectoryParts = [];
  const textEncoder = new TextEncoder();
  let localOffset = 0;

  for (const entry of entries) {
    const fileNameBytes = textEncoder.encode(entry.name);
    const fileBytes = new Uint8Array(await entry.blob.arrayBuffer());
    const crc32 = calculateCrc32(fileBytes);
    const localHeader = createZipLocalHeader(fileNameBytes, crc32, fileBytes.length);
    const centralDirectoryHeader = createZipCentralDirectoryHeader(
      fileNameBytes,
      crc32,
      fileBytes.length,
      localOffset,
    );

    localParts.push(localHeader, fileBytes);
    centralDirectoryParts.push(centralDirectoryHeader);
    localOffset += localHeader.length + fileBytes.length;
  }

  const centralDirectorySize = centralDirectoryParts.reduce((size, part) => size + part.length, 0);
  const endOfCentralDirectory = createZipEndOfCentralDirectory(
    entries.length,
    centralDirectorySize,
    localOffset,
  );

  return new Blob([...localParts, ...centralDirectoryParts, endOfCentralDirectory], {
    type: "application/zip",
  });
}

function createZipLocalHeader(fileNameBytes, crc32, fileSize) {
  const header = new Uint8Array(30 + fileNameBytes.length);
  const view = new DataView(header.buffer);

  view.setUint32(0, 0x04034b50, true);
  view.setUint16(4, 20, true);
  view.setUint16(6, 0x0800, true);
  view.setUint16(8, 0, true);
  view.setUint16(10, 0, true);
  view.setUint16(12, 0, true);
  view.setUint32(14, crc32, true);
  view.setUint32(18, fileSize, true);
  view.setUint32(22, fileSize, true);
  view.setUint16(26, fileNameBytes.length, true);
  view.setUint16(28, 0, true);
  header.set(fileNameBytes, 30);

  return header;
}

function createZipCentralDirectoryHeader(fileNameBytes, crc32, fileSize, localOffset) {
  const header = new Uint8Array(46 + fileNameBytes.length);
  const view = new DataView(header.buffer);

  view.setUint32(0, 0x02014b50, true);
  view.setUint16(4, 20, true);
  view.setUint16(6, 20, true);
  view.setUint16(8, 0x0800, true);
  view.setUint16(10, 0, true);
  view.setUint16(12, 0, true);
  view.setUint16(14, 0, true);
  view.setUint32(16, crc32, true);
  view.setUint32(20, fileSize, true);
  view.setUint32(24, fileSize, true);
  view.setUint16(28, fileNameBytes.length, true);
  view.setUint16(30, 0, true);
  view.setUint16(32, 0, true);
  view.setUint16(34, 0, true);
  view.setUint16(36, 0, true);
  view.setUint32(38, 0, true);
  view.setUint32(42, localOffset, true);
  header.set(fileNameBytes, 46);

  return header;
}

function createZipEndOfCentralDirectory(entryCount, centralDirectorySize, centralDirectoryOffset) {
  const header = new Uint8Array(22);
  const view = new DataView(header.buffer);

  view.setUint32(0, 0x06054b50, true);
  view.setUint16(4, 0, true);
  view.setUint16(6, 0, true);
  view.setUint16(8, entryCount, true);
  view.setUint16(10, entryCount, true);
  view.setUint32(12, centralDirectorySize, true);
  view.setUint32(16, centralDirectoryOffset, true);
  view.setUint16(20, 0, true);

  return header;
}

function calculateCrc32(bytes) {
  const table = getCrc32Table();
  let crc = 0xffffffff;

  bytes.forEach((byte) => {
    crc = (crc >>> 8) ^ table[(crc ^ byte) & 0xff];
  });

  return (crc ^ 0xffffffff) >>> 0;
}

function getCrc32Table() {
  if (crc32Table) {
    return crc32Table;
  }

  crc32Table = new Uint32Array(256);

  for (let i = 0; i < 256; i += 1) {
    let value = i;

    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }

    crc32Table[i] = value >>> 0;
  }

  return crc32Table;
}

globalScope.ImageToolkitZipWriter = {
  createZipBlob,
};
})(window);
