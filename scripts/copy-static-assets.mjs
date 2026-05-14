import { copyFile, cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";

const root = process.cwd();
const dist = join(root, "dist");

async function copyIntoDist(source, target) {
  if (!existsSync(source)) return;
  await mkdir(dirname(target), { recursive: true });
  await copyFile(source, target);
}

await copyIntoDist(join(root, "manifest.json"), join(dist, "manifest.json"));
await copyIntoDist(join(dist, "src", "popup", "popup.html"), join(dist, "popup.html"));
await copyIntoDist(join(dist, "src", "offscreen", "offscreen.html"), join(dist, "offscreen.html"));
await rm(join(dist, "src"), { recursive: true, force: true });

if (existsSync(join(root, "icons"))) {
  await cp(join(root, "icons"), join(dist, "icons"), { recursive: true });
}

if (existsSync(join(root, "store-assets"))) {
  await cp(join(root, "store-assets"), join(dist, "store-assets"), { recursive: true });
}

await copyIntoDist(
  join(root, "node_modules", "pdfjs-dist", "build", "pdf.worker.min.mjs"),
  join(dist, "assets", "pdf.worker.min.mjs")
);

await sanitizeMv3EvalProbes(join(dist, "assets"));

async function sanitizeMv3EvalProbes(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const absolute = join(directory, entry.name);
    if (entry.isDirectory()) {
      await sanitizeMv3EvalProbes(absolute);
      continue;
    }
    if (!/\.(js|mjs)$/.test(entry.name)) continue;

    const original = await readFile(absolute, "utf8");
    const sanitized = original
      .replaceAll('try{return new Function(""),!0}catch{return!1}', "return!1")
      .replaceAll("try{return new Function(''),!0}catch{return!1}", "return!1")
      .replace(/try\{new Function\(["']{2}\);return!0\}catch\{return!1\}/g, "return!1")
      .replace(/return new Function\("src","srcOffset","dest","destOffset",e\)/g, "return null");
    if (sanitized !== original) {
      await writeFile(absolute, sanitized);
    }
  }
}
