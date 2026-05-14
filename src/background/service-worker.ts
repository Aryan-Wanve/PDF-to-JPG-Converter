import { IDLE_STATUS } from "../shared/defaults";
import { filenameFromUrl, hasPdfExtension, sanitizeFolderName } from "../shared/filename";
import type {
  CompletedMessage,
  DownloadPageMessage,
  DownloadZipMessage,
  ErrorMessage,
  JobStatus,
  PdfSource,
  ProgressMessage,
  RuntimeMessage,
  StartConversionMessage
} from "../shared/types";

let status: JobStatus = { ...IDLE_STATUS };

chrome.runtime.onMessage.addListener((message: RuntimeMessage, _sender, sendResponse) => {
  void handleMessage(message)
    .then((response) => sendResponse(response))
    .catch((error: unknown) => {
      const messageText = error instanceof Error ? error.message : "Unexpected extension error.";
      publishError({ type: "CONVERSION_ERROR", jobId: status.jobId ?? undefined, message: messageText });
      sendResponse({ ok: false, error: messageText });
    });

  return true;
});

async function handleMessage(message: RuntimeMessage): Promise<unknown> {
  switch (message.type) {
    case "START_CONVERSION":
      return startConversion(message);
    case "CANCEL_CONVERSION":
      if (message.jobId === status.jobId) {
        status = { ...status, state: "cancelled", error: null };
        await chrome.runtime.sendMessage({ type: "OFFSCREEN_CANCEL", jobId: message.jobId });
        broadcastStatus();
      }
      return { ok: true };
    case "GET_STATUS":
      return { ok: true, status };
    case "DOWNLOAD_PAGE":
      await downloadPage(message);
      return { ok: true };
    case "DOWNLOAD_ZIP":
      await downloadZip(message);
      return { ok: true };
    case "CONVERSION_PROGRESS":
      publishProgress(message);
      return { ok: true };
    case "CONVERSION_COMPLETE":
      publishComplete(message);
      return { ok: true };
    case "CONVERSION_ERROR":
      publishError(message);
      return { ok: true };
    default:
      return { ok: false, error: "Unsupported message." };
  }
}

async function startConversion(message: StartConversionMessage): Promise<{ ok: true; status: JobStatus }> {
  if (status.state === "running") {
    throw new Error("A conversion is already running. Cancel it before starting another one.");
  }

  const source = await getActivePdfSource();
  const jobId = crypto.randomUUID();
  status = {
    ...IDLE_STATUS,
    jobId,
    state: "running",
    sourceName: source.filename,
    folderName: source.folderName,
    phase: "loading",
    zipMode: message.settings.zipMode
  };
  broadcastStatus();

  await ensureOffscreenDocument();
  await chrome.runtime.sendMessage({
    type: "OFFSCREEN_START",
    jobId,
    source,
    settings: message.settings
  });

  return { ok: true, status };
}

async function getActivePdfSource(): Promise<PdfSource> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id || !tab.url) throw new Error("Open a PDF in the active tab, then try again.");

  const url = extractPdfUrl(tab.url);
  const filename = filenameFromUrl(url);
  if (!hasPdfExtension(filename) && !hasPdfExtension(url)) {
    throw new Error("The active tab does not look like a PDF. Open a .pdf file in Chrome first.");
  }

  return {
    url,
    filename,
    folderName: sanitizeFolderName(filename),
    tabId: tab.id
  };
}

function extractPdfUrl(tabUrl: string): string {
  try {
    const url = new URL(tabUrl);
    const fileParam = url.searchParams.get("file");
    if (fileParam) return fileParam;
  } catch {
    return tabUrl;
  }
  return tabUrl;
}

async function ensureOffscreenDocument(): Promise<void> {
  const offscreenUrl = chrome.runtime.getURL("offscreen.html");
  const contexts = await chrome.runtime.getContexts({
    contextTypes: [chrome.runtime.ContextType.OFFSCREEN_DOCUMENT],
    documentUrls: [offscreenUrl]
  });

  if (contexts.length > 0) return;

  await chrome.offscreen.createDocument({
    url: "offscreen.html",
    reasons: [chrome.offscreen.Reason.BLOBS],
    justification: "Render PDF pages to JPG images locally before saving them with chrome.downloads."
  });
}

async function downloadPage(message: DownloadPageMessage): Promise<void> {
  if (message.jobId !== status.jobId || status.state !== "running") return;
  await chrome.downloads.download({
    url: message.url,
    filename: message.filename,
    conflictAction: "uniquify",
    saveAs: false
  });
}

async function downloadZip(message: DownloadZipMessage): Promise<void> {
  if (message.jobId !== status.jobId || status.state !== "running") return;
  await chrome.downloads.download({
    url: message.url,
    filename: message.filename,
    conflictAction: "uniquify",
    saveAs: false
  });
}

function publishProgress(message: ProgressMessage): void {
  if (message.jobId !== status.jobId || status.state !== "running") return;
  status = {
    ...status,
    phase: message.phase,
    currentPage: message.currentPage,
    totalPages: message.totalPages,
    elapsedMs: message.elapsedMs,
    etaMs: message.etaMs
  };
  broadcastStatus();
}

function publishComplete(message: CompletedMessage): void {
  if (message.jobId !== status.jobId) return;
  status = {
    ...status,
    state: "success",
    phase: "downloading",
    currentPage: message.totalPages,
    totalPages: message.totalPages,
    folderName: message.folderName,
    zipMode: message.zipMode,
    error: null
  };
  broadcastStatus();
}

function publishError(message: ErrorMessage): void {
  if (message.jobId && status.jobId && message.jobId !== status.jobId) return;
  status = {
    ...status,
    state: "error",
    error: message.message
  };
  broadcastStatus();
}

function broadcastStatus(): void {
  void chrome.runtime.sendMessage({ type: "STATUS_UPDATE", status }).catch(() => undefined);
}
