import { createWriteStream } from "node:fs";
import { mkdir, readdir, rm, stat } from "node:fs/promises";
import { join, relative } from "node:path";
import { Readable } from "node:stream";
import { finished } from "node:stream/promises";
import { ZipFile } from "yazl";

const root = process.cwd();
const outDir = join(root, "release");
const zipPath = join(outDir, "pdf-to-jpg-converter-v1.0.0.zip");

await mkdir(outDir, { recursive: true });
await rm(zipPath, { force: true });

const zip = new ZipFile();
await addDirectory(join(root, "dist"));

zip.end();
await finished(Readable.from(zip.outputStream).pipe(createWriteStream(zipPath)));
console.log(`Created ${zipPath}`);

async function addDirectory(directory) {
  const entries = await readdir(directory);
  for (const entry of entries) {
    const absolute = join(directory, entry);
    const details = await stat(absolute);
    if (details.isDirectory()) {
      await addDirectory(absolute);
      continue;
    }
    zip.addFile(absolute, relative(join(root, "dist"), absolute).replaceAll("\\", "/"));
  }
}
