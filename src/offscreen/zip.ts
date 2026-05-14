export interface ZipEntry {
  path: string;
  data: Uint8Array;
}

interface CentralDirectoryRecord {
  pathBytes: Uint8Array;
  crc32: number;
  size: number;
  offset: number;
  time: number;
  date: number;
}

const encoder = new TextEncoder();
const crcTable = makeCrcTable();

export function createZipBlob(entries: ZipEntry[]): Blob {
  const parts: ArrayBuffer[] = [];
  const centralDirectory: CentralDirectoryRecord[] = [];
  let offset = 0;
  const now = new Date();
  const time = dosTime(now);
  const date = dosDate(now);

  for (const entry of entries) {
    const pathBytes = encoder.encode(entry.path.replaceAll("\\", "/"));
    const crc32 = calculateCrc32(entry.data);
    const localHeader = localFileHeader(pathBytes, crc32, entry.data.byteLength, time, date);

    const fileBytes = new Uint8Array(entry.data.byteLength);
    fileBytes.set(entry.data);
    parts.push(localHeader, fileBytes.buffer);
    centralDirectory.push({ pathBytes, crc32, size: entry.data.byteLength, offset, time, date });
    offset += localHeader.byteLength + entry.data.byteLength;
  }

  const centralStart = offset;
  for (const record of centralDirectory) {
    const header = centralDirectoryHeader(record);
    parts.push(header);
    offset += header.byteLength;
  }

  parts.push(endOfCentralDirectory(centralDirectory.length, offset - centralStart, centralStart));
  return new Blob(parts, { type: "application/zip" });
}

function localFileHeader(pathBytes: Uint8Array, crc32: number, size: number, time: number, date: number): ArrayBuffer {
  const buffer = new ArrayBuffer(30 + pathBytes.byteLength);
  const view = new DataView(buffer);
  writeUint32(view, 0, 0x04034b50);
  writeUint16(view, 4, 20);
  writeUint16(view, 6, 0x0800);
  writeUint16(view, 8, 0);
  writeUint16(view, 10, time);
  writeUint16(view, 12, date);
  writeUint32(view, 14, crc32);
  writeUint32(view, 18, size);
  writeUint32(view, 22, size);
  writeUint16(view, 26, pathBytes.byteLength);
  writeUint16(view, 28, 0);
  new Uint8Array(buffer, 30).set(pathBytes);
  return buffer;
}

function centralDirectoryHeader(record: CentralDirectoryRecord): ArrayBuffer {
  const buffer = new ArrayBuffer(46 + record.pathBytes.byteLength);
  const view = new DataView(buffer);
  writeUint32(view, 0, 0x02014b50);
  writeUint16(view, 4, 20);
  writeUint16(view, 6, 20);
  writeUint16(view, 8, 0x0800);
  writeUint16(view, 10, 0);
  writeUint16(view, 12, record.time);
  writeUint16(view, 14, record.date);
  writeUint32(view, 16, record.crc32);
  writeUint32(view, 20, record.size);
  writeUint32(view, 24, record.size);
  writeUint16(view, 28, record.pathBytes.byteLength);
  writeUint16(view, 30, 0);
  writeUint16(view, 32, 0);
  writeUint16(view, 34, 0);
  writeUint16(view, 36, 0);
  writeUint32(view, 38, 0);
  writeUint32(view, 42, record.offset);
  new Uint8Array(buffer, 46).set(record.pathBytes);
  return buffer;
}

function endOfCentralDirectory(entryCount: number, centralSize: number, centralOffset: number): ArrayBuffer {
  const buffer = new ArrayBuffer(22);
  const view = new DataView(buffer);
  writeUint32(view, 0, 0x06054b50);
  writeUint16(view, 4, 0);
  writeUint16(view, 6, 0);
  writeUint16(view, 8, entryCount);
  writeUint16(view, 10, entryCount);
  writeUint32(view, 12, centralSize);
  writeUint32(view, 16, centralOffset);
  writeUint16(view, 20, 0);
  return buffer;
}

function calculateCrc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ byte) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeCrcTable(): Uint32Array {
  const table = new Uint32Array(256);
  for (let index = 0; index < 256; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    table[index] = value >>> 0;
  }
  return table;
}

function dosTime(date: Date): number {
  return (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
}

function dosDate(date: Date): number {
  return ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
}

function writeUint16(view: DataView, offset: number, value: number): void {
  view.setUint16(offset, value, true);
}

function writeUint32(view: DataView, offset: number, value: number): void {
  view.setUint32(offset, value >>> 0, true);
}
