import { createWriteStream } from "node:fs";
import { mkdir, readdir, stat } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import yazl from "yazl";
import packageJson from "../package.json" with { type: "json" };

const root = process.cwd();
const releaseDir = join(root, "release");
const zipPath = join(releaseDir, `chrome-web-store-assets-v${packageJson.version}.zip`);

const entries = [
  "icons/icon-128.png",
  "store-assets",
  "STORE_LISTING.md",
  "CHROME_WEB_STORE_SUBMISSION.md",
  "PRIVACY.md",
  "RELEASE_NOTES.md",
  "SUPPORT.md"
];

await mkdir(releaseDir, { recursive: true });

const zip = new yazl.ZipFile();
for (const entry of entries) {
  await addEntry(entry);
}

zip.end();
await new Promise((resolve, reject) => {
  zip.outputStream
    .pipe(createWriteStream(zipPath))
    .on("close", resolve)
    .on("error", reject);
});

console.log(`Created ${zipPath}`);

async function addEntry(entry) {
  const absolute = join(root, entry);
  const info = await stat(absolute);
  if (info.isDirectory()) {
    await addDirectory(absolute, entry);
    return;
  }
  zip.addFile(absolute, normalizeZipPath(join("chrome-web-store-assets", entry)));
}

async function addDirectory(directory, baseEntry) {
  const files = await readdir(directory, { withFileTypes: true });
  for (const file of files) {
    const absolute = join(directory, file.name);
    if (file.isDirectory()) {
      await addDirectory(absolute, join(baseEntry, file.name));
      continue;
    }
    const archivePath = join("chrome-web-store-assets", relative(root, absolute));
    zip.addFile(absolute, normalizeZipPath(archivePath));
  }
}

function normalizeZipPath(path) {
  return path.split(sep).join("/");
}
