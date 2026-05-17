import * as pdfjsLib from "pdfjs-dist";
import { pageFilename } from "../shared/filename";
import type { OffscreenCancelMessage, OffscreenStartMessage, RuntimeMessage } from "../shared/types";
import { createZipBlob, type ZipEntry } from "./zip";

pdfjsLib.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL("assets/pdf.worker.min.mjs");

const cancelledJobs = new Set<string>();
const PDF_FETCH_TIMEOUT_MS = 30000;
const PAGE_RENDER_TIMEOUT_MS = 90000;

chrome.runtime.onMessage.addListener((message: RuntimeMessage) => {
  if (message.type === "OFFSCREEN_START") {
    void convertPdf(message);
  }
  if (message.type === "OFFSCREEN_CANCEL") {
    cancelJob(message);
  }
});

function cancelJob(message: OffscreenCancelMessage): void {
  cancelledJobs.add(message.jobId);
}

async function convertPdf(message: OffscreenStartMessage): Promise<void> {
  const { jobId, source, settings } = message;
  const startedAt = performance.now();

  try {
    cancelledJobs.delete(jobId);
    postProgress(jobId, "loading", 0, 0, startedAt);

    let pdf: pdfjsLib.PDFDocumentProxy | null = null;
    const pdfBytes = await fetchPdfBytes(source.url);
    ensureNotCancelled(jobId);

    pdf = await pdfjsLib.getDocument({ data: pdfBytes, useWorkerFetch: false, isEvalSupported: false }).promise;
    const totalPages = pdf.numPages;
    const zipEntries: ZipEntry[] | null = settings.zipMode ? [] : null;

    for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
      ensureNotCancelled(jobId);
      postProgress(jobId, "rendering", pageNumber - 1, totalPages, startedAt);

      const jpgDataUrl = await renderPageToJpg(pdf, pageNumber, settings.scale, settings.quality / 100);
      const jpgName = pageFilename(pageNumber);

      if (zipEntries) {
        zipEntries.push({
          path: `${source.folderName}/${jpgName}`,
          data: dataUrlToUint8Array(jpgDataUrl)
        });
      } else {
        await chrome.runtime.sendMessage({
          type: "DOWNLOAD_PAGE",
          jobId,
          url: jpgDataUrl,
          filename: `${source.folderName}/${jpgName}`
        });
      }

      postProgress(jobId, "rendering", pageNumber, totalPages, startedAt);
      await yieldToBrowser();
    }

    if (zipEntries) {
      ensureNotCancelled(jobId);
      postProgress(jobId, "zipping", totalPages, totalPages, startedAt);
      const zipBlob = createZipBlob(zipEntries);
      const zipDataUrl = await blobToDataUrl(zipBlob);
      await chrome.runtime.sendMessage({
        type: "DOWNLOAD_ZIP",
        jobId,
        url: zipDataUrl,
        filename: `${source.folderName}.zip`
      });
    }

    pdf.destroy();
    await chrome.runtime.sendMessage({
      type: "CONVERSION_COMPLETE",
      jobId,
      folderName: source.folderName,
      totalPages,
      zipMode: settings.zipMode
    });
  } catch (error) {
    if (cancelledJobs.has(jobId)) {
      cancelledJobs.delete(jobId);
      return;
    }

    await chrome.runtime.sendMessage({
      type: "CONVERSION_ERROR",
      jobId,
      message: error instanceof Error ? error.message : "Could not convert this PDF."
    });
  }
}

async function fetchPdfBytes(url: string): Promise<ArrayBuffer> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), PDF_FETCH_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(url, { credentials: "include", cache: "no-store", signal: controller.signal });
  } catch (error) {
    if (url.startsWith("file:")) {
      throw new Error(
        "Chrome could not read this local PDF. Enable Allow access to file URLs for the extension in chrome://extensions, reload the PDF tab, and try again."
      );
    }
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Chrome timed out while reading the PDF. Try reopening the PDF tab and converting again.");
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }

  if (!response.ok) {
    throw new Error(`Chrome could not read the PDF (${response.status}). Try a direct PDF URL or allow file URL access.`);
  }
  return response.arrayBuffer();
}

async function renderPageToJpg(
  pdf: pdfjsLib.PDFDocumentProxy,
  pageNumber: number,
  scale: number,
  quality: number
): Promise<string> {
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale });

  const canvas =
    typeof OffscreenCanvas !== "undefined"
      ? new OffscreenCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height))
      : document.createElement("canvas");

  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);

  const context = canvas.getContext("2d", { alpha: false });
  if (!context) throw new Error("Chrome could not create a rendering canvas.");

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);

  const renderTask = page.render({
    canvasContext: context as CanvasRenderingContext2D,
    viewport
  });

  try {
    await withTimeout(
      renderTask.promise,
      PAGE_RENDER_TIMEOUT_MS,
      () => renderTask.cancel(),
      `Rendering page ${pageNumber} timed out. Try 1x scale, then reopen the PDF tab and convert again.`
    );
  } finally {
    page.cleanup();
  }


  const blob =
    canvas instanceof OffscreenCanvas
      ? await canvas.convertToBlob({ type: "image/jpeg", quality })
      : await htmlCanvasToBlob(canvas, quality);

  canvas.width = 0;
  canvas.height = 0;

  return blobToDataUrl(blob);
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, onTimeout: () => void, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      onTimeout();
      reject(new Error(message));
    }, timeoutMs);

    promise.then(
      (value) => {
        window.clearTimeout(timeoutId);
        resolve(value);
      },
      (error: unknown) => {
        window.clearTimeout(timeoutId);
        reject(error);
      }
    );
  });
}

function htmlCanvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Chrome could not encode the page as JPG."));
      },
      "image/jpeg",
      quality
    );
  });
}

function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Chrome could not prepare the JPG for download."));
    reader.readAsDataURL(blob);
  });
}

function postProgress(
  jobId: string,
  phase: "loading" | "rendering" | "zipping" | "downloading",
  currentPage: number,
  totalPages: number,
  startedAt: number
): void {
  const elapsedMs = performance.now() - startedAt;
  const etaMs = currentPage > 0 && totalPages > 0 ? (elapsedMs / currentPage) * (totalPages - currentPage) : null;
  void chrome.runtime.sendMessage({ type: "CONVERSION_PROGRESS", jobId, phase, currentPage, totalPages, elapsedMs, etaMs });
}

function ensureNotCancelled(jobId: string): void {
  if (cancelledJobs.has(jobId)) throw new Error("Conversion cancelled.");
}

function yieldToBrowser(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}
