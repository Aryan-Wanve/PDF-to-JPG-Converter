# Edge-Case Handling

## Local Files

Chrome requires users to enable **Allow access to file URLs** before extensions can read `file://` PDFs. The background worker checks this before starting and the offscreen renderer reports a direct local-file access error if Chrome still blocks the read. After changing the toggle, reload the PDF tab before converting.

## Protected Or Authenticated PDFs

The extension requests the active PDF URL with browser credentials included. PDFs behind active browser sessions can work when Chrome allows extension access to the URL. PDFs that block extension fetches, require special viewers, or prevent cross-origin reads may need to be opened from a direct PDF URL.

## Chrome PDF Viewer URLs

If Chrome exposes the original PDF in a viewer `file` query parameter, the extension extracts that source URL and converts it.

## Large PDFs

Pages are rendered sequentially. Each page canvas is cleared after encoding, and pdf.js page resources are cleaned up after every page.

Each page render has a timeout so a damaged, massive, or browser-blocked page cannot leave the popup stuck forever at the same progress value. Retrying at `1x` scale is the safest fallback for unusually heavy PDFs.

## ZIP Mode

ZIP mode intentionally keeps generated images until the archive is created. For very large PDFs, non-ZIP mode is more memory efficient because each page is downloaded immediately after rendering.

## Filename Safety

The output folder removes `.pdf`, trims trailing spaces/dots, replaces invalid filesystem characters, and falls back to `converted-pdf` when the filename is empty.

## Cancellation

Cancellation is checked between fetch, load, page render, and ZIP phases. A page already being rendered may finish before cancellation fully settles.
