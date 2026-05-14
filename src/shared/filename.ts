const INVALID_PATH_CHARS = /[<>:"/\\|?*\u0000-\u001f]/g;
const TRAILING_DOTS_SPACES = /[.\s]+$/g;

export function sanitizeFolderName(input: string): string {
  const cleaned = input
    .replace(/\.pdf$/i, "")
    .replace(INVALID_PATH_CHARS, "-")
    .replace(TRAILING_DOTS_SPACES, "")
    .trim();

  return cleaned || "converted-pdf";
}

export function pageFilename(page: number): string {
  return `page-${String(page).padStart(3, "0")}.jpg`;
}

export function filenameFromUrl(rawUrl: string): string {
  try {
    const url = new URL(rawUrl);
    const embeddedFile = url.searchParams.get("file");
    if (embeddedFile) return filenameFromUrl(embeddedFile);

    const pathname = decodeURIComponent(url.pathname);
    const last = pathname.split("/").filter(Boolean).pop();
    if (last) return last;
  } catch {
    const fallback = rawUrl.split(/[\\/]/).pop();
    if (fallback) return fallback;
  }

  return "document.pdf";
}

export function hasPdfExtension(nameOrUrl: string): boolean {
  return /\.pdf($|[?#])/i.test(nameOrUrl);
}
