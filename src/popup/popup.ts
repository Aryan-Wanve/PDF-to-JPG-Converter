import { DEFAULT_SETTINGS, SETTINGS_KEY } from "../shared/defaults";
import { formatDuration } from "../shared/time";
import type { ExportSettings, JobStatus, ResolutionScale } from "../shared/types";
import "./styles.css";

const quality = document.querySelector<HTMLInputElement>("#quality")!;
const qualityValue = document.querySelector<HTMLElement>("#qualityValue")!;
const scaleButtons = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-scale]"));
const zipMode = document.querySelector<HTMLButtonElement>("#zipMode")!;
const themeButton = document.querySelector<HTMLButtonElement>("#themeButton")!;
const themeIcon = document.querySelector<HTMLElement>("#themeIcon")!;
const convertButton = document.querySelector<HTMLButtonElement>("#convertButton")!;
const cancelButton = document.querySelector<HTMLButtonElement>("#cancelButton")!;
const statusText = document.querySelector<HTMLElement>("#statusText")!;
const pageCounter = document.querySelector<HTMLElement>("#pageCounter")!;
const progressBar = document.querySelector<HTMLElement>("#progressBar")!;
const eta = document.querySelector<HTMLElement>("#eta")!;
const folderName = document.querySelector<HTMLElement>("#folderName")!;
const progressCard = document.querySelector<HTMLElement>("#progressCard")!;

let settings: ExportSettings = { ...DEFAULT_SETTINGS };
let currentJobId: string | null = null;

void boot();

async function boot(): Promise<void> {
  settings = await loadSettings();
  bindControls();
  renderSettings();
  applyTheme();
  const response = await chrome.runtime.sendMessage({ type: "GET_STATUS" });
  if (response?.status) renderStatus(response.status);
}

function bindControls(): void {
  quality.addEventListener("input", () => {
    settings.quality = Number(quality.value);
    renderSettings();
    void saveSettings();
  });

  for (const button of scaleButtons) {
    button.addEventListener("click", () => {
      settings.scale = Number(button.dataset.scale) as ResolutionScale;
      renderSettings();
      void saveSettings();
    });
  }

  zipMode.addEventListener("click", () => {
    settings.zipMode = !settings.zipMode;
    renderSettings();
    void saveSettings();
  });

  themeButton.addEventListener("click", () => {
    settings.theme = settings.theme === "dark" ? "light" : settings.theme === "light" ? "system" : "dark";
    renderSettings();
    applyTheme();
    void saveSettings();
  });

  convertButton.addEventListener("click", async () => {
    setBusy(true);
    renderInfo("Starting conversion...");
    const response = await chrome.runtime.sendMessage({ type: "START_CONVERSION", settings });
    if (response?.error) renderError(response.error);
    if (response?.status) renderStatus(response.status);
  });

  cancelButton.addEventListener("click", async () => {
    if (!currentJobId) return;
    await chrome.runtime.sendMessage({ type: "CANCEL_CONVERSION", jobId: currentJobId });
    renderInfo("Cancelling...");
  });

  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "STATUS_UPDATE") renderStatus(message.status as JobStatus);
  });
}

async function loadSettings(): Promise<ExportSettings> {
  const result = await chrome.storage.sync.get(SETTINGS_KEY);
  return { ...DEFAULT_SETTINGS, ...(result[SETTINGS_KEY] ?? {}) };
}

async function saveSettings(): Promise<void> {
  await chrome.storage.sync.set({ [SETTINGS_KEY]: settings });
}

function renderSettings(): void {
  quality.value = String(settings.quality);
  qualityValue.textContent = String(settings.quality);
  zipMode.setAttribute("aria-checked", String(settings.zipMode));
  zipMode.classList.toggle("is-on", settings.zipMode);

  for (const button of scaleButtons) {
    button.classList.toggle("is-active", Number(button.dataset.scale) === settings.scale);
  }

  themeIcon.textContent = settings.theme === "dark" ? "D" : settings.theme === "light" ? "L" : "S";
}

function renderStatus(status: JobStatus): void {
  currentJobId = status.jobId;
  setBusy(status.state === "running");

  const total = status.totalPages || 0;
  const current = status.currentPage || 0;
  const percent = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : status.state === "running" ? 8 : 0;
  progressBar.style.width = `${percent}%`;
  pageCounter.textContent = `${current} / ${total}`;
  eta.textContent = status.state === "running" ? `ETA ${formatDuration(status.etaMs)}` : "ETA --";
  folderName.textContent = status.folderName ? `${status.zipMode ? "ZIP" : "Folder"}: ${status.folderName}` : "Folder auto-named from PDF";

  progressCard.dataset.state = status.state;

  if (status.state === "running") {
    const phase =
      status.detail ??
      (status.phase === "zipping"
        ? "Creating ZIP"
        : status.phase === "loading"
          ? "Loading PDF"
          : status.phase === "encoding"
            ? "Encoding JPG"
            : status.phase === "saving"
              ? "Saving output"
              : status.phase === "preparing"
                ? "Preparing page"
                : "Rendering pages");
    statusText.textContent = `${phase}${total && !status.detail ? ` (${percent}%)` : ""}`;
    return;
  }

  if (status.state === "success") {
    statusText.textContent = `Saved ${status.totalPages} JPG${status.totalPages === 1 ? "" : "s"}`;
    progressBar.style.width = "100%";
    return;
  }

  if (status.state === "error") {
    renderError(status.error ?? "Conversion failed.");
    return;
  }

  if (status.state === "cancelled") {
    renderInfo("Conversion cancelled");
    return;
  }

  renderInfo("Ready to convert the active PDF tab");
}

function renderInfo(message: string): void {
  progressCard.dataset.state = "idle";
  statusText.textContent = message;
}

function renderError(message: string): void {
  setBusy(false);
  progressCard.dataset.state = "error";
  statusText.textContent = message;
}

function setBusy(isBusy: boolean): void {
  convertButton.disabled = isBusy;
  cancelButton.disabled = !isBusy;
}

function applyTheme(): void {
  const prefersDark = matchMedia("(prefers-color-scheme: dark)").matches;
  const resolved = settings.theme === "system" ? (prefersDark ? "dark" : "light") : settings.theme;
  document.documentElement.dataset.theme = resolved;
}
