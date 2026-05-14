export type ResolutionScale = 1 | 1.5 | 2 | 3;

export interface ExportSettings {
  quality: number;
  scale: ResolutionScale;
  zipMode: boolean;
  theme: "system" | "light" | "dark";
}

export interface PdfSource {
  url: string;
  filename: string;
  folderName: string;
  tabId: number;
}

export interface StartConversionMessage {
  type: "START_CONVERSION";
  settings: ExportSettings;
}

export interface CancelConversionMessage {
  type: "CANCEL_CONVERSION";
  jobId: string;
}

export interface GetStatusMessage {
  type: "GET_STATUS";
}

export interface OffscreenStartMessage {
  type: "OFFSCREEN_START";
  jobId: string;
  source: PdfSource;
  settings: ExportSettings;
}

export interface OffscreenCancelMessage {
  type: "OFFSCREEN_CANCEL";
  jobId: string;
}

export interface DownloadPageMessage {
  type: "DOWNLOAD_PAGE";
  jobId: string;
  url: string;
  filename: string;
}

export interface DownloadZipMessage {
  type: "DOWNLOAD_ZIP";
  jobId: string;
  url: string;
  filename: string;
}

export interface ProgressMessage {
  type: "CONVERSION_PROGRESS";
  jobId: string;
  phase: "loading" | "rendering" | "zipping" | "downloading";
  currentPage: number;
  totalPages: number;
  elapsedMs: number;
  etaMs: number | null;
}

export interface CompletedMessage {
  type: "CONVERSION_COMPLETE";
  jobId: string;
  folderName: string;
  totalPages: number;
  zipMode: boolean;
}

export interface ErrorMessage {
  type: "CONVERSION_ERROR";
  jobId?: string;
  message: string;
}

export type RuntimeMessage =
  | StartConversionMessage
  | CancelConversionMessage
  | GetStatusMessage
  | OffscreenStartMessage
  | OffscreenCancelMessage
  | DownloadPageMessage
  | DownloadZipMessage
  | ProgressMessage
  | CompletedMessage
  | ErrorMessage;

export interface JobStatus {
  jobId: string | null;
  state: "idle" | "running" | "success" | "error" | "cancelled";
  sourceName: string | null;
  folderName: string | null;
  currentPage: number;
  totalPages: number;
  phase: ProgressMessage["phase"] | null;
  etaMs: number | null;
  elapsedMs: number;
  error: string | null;
  zipMode: boolean;
}
