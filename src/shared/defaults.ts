import type { ExportSettings, JobStatus } from "./types";

export const DEFAULT_SETTINGS: ExportSettings = {
  quality: 92,
  scale: 2,
  zipMode: false,
  theme: "system"
};

export const IDLE_STATUS: JobStatus = {
  jobId: null,
  state: "idle",
  sourceName: null,
  folderName: null,
  currentPage: 0,
  totalPages: 0,
  phase: null,
  etaMs: null,
  elapsedMs: 0,
  error: null,
  zipMode: false
};

export const SETTINGS_KEY = "pdfToJpgSettings";
