# PDF to JPG Converter

PDF to JPG Converter is a Manifest V3 Chrome extension that converts the PDF open in the active tab into JPG page images entirely inside the browser.

Version: `1.0.0`

## Features

- Local-only conversion with no backend, uploads, telemetry, analytics, accounts, or cloud APIs.
- Active PDF tab detection.
- JPG quality control from 50 to 100.
- Resolution scale controls: 1x, 1.5x, 2x, and 3x.
- Optional ZIP export.
- Automatic output folder naming from the PDF filename.
- Automatic page naming: `page-001.jpg`, `page-002.jpg`, and onward.
- Dark and light popup UI with progress, ETA, cancellation, and success/error states.
- Sequential rendering with cleanup after every page for large PDFs.
- Manifest V3-compatible CSP with no inline scripts, no remote scripts, and no eval-dependent runtime paths.

## Install For Development

```powershell
npm install
npm run icons
npm run build
```

Then open `chrome://extensions`, enable Developer mode, choose **Load unpacked**, and select the `dist` folder.

For local `file://` PDFs, open the extension details in Chrome and enable **Allow access to file URLs**.

## Important Loading Note

Load the compiled `dist` directory in Chrome, not the repository root. The root contains TypeScript source files and build scripts; `dist` contains the bundled Manifest V3 extension that Chrome can execute.

## Package For Chrome Web Store

```powershell
npm run package
```

The upload artifact is written to `release/pdf-to-jpg-converter-v1.0.0.zip`.

## Build Scripts

- `npm run typecheck`: validates the TypeScript source.
- `npm run build`: generates icons, typechecks, builds with Vite, copies static assets, and sanitizes pdf.js eval probes for MV3 CSP compliance.
- `npm run package`: rebuilds and creates the Chrome Web Store upload ZIP.
- `npm run clean`: removes generated `dist` and `release` output.

## Usage

1. Open a PDF in Chrome.
2. Click the PDF to JPG Converter extension icon.
3. Choose JPG quality, resolution scale, and ZIP mode.
4. Click **Convert**.
5. Chrome saves the JPGs automatically.

If the PDF is named `physics-notes.pdf`, non-ZIP output is saved as:

```text
physics-notes/page-001.jpg
physics-notes/page-002.jpg
```

With ZIP mode enabled, Chrome saves `physics-notes.zip` containing the same folder structure.

## Architecture

- `src/background/service-worker.ts`: active tab detection, offscreen document lifecycle, downloads, and job state.
- `src/offscreen/offscreen.ts`: pdf.js loading, page rendering, JPG encoding, cancellation checks, and memory cleanup.
- `src/offscreen/zip.ts`: local no-dependency ZIP writer used for ZIP export mode.
- `src/popup/popup.ts`: settings, UI state, progress updates, and cancellation controls.
- `src/shared`: typed messages, defaults, filename handling, and formatting helpers.
- `scripts/copy-static-assets.mjs`: copies manifest/icons/store assets and keeps bundled pdf.js assets MV3 CSP-safe.

## Chrome Web Store Readiness

The repository includes:

- Manifest V3 extension source and production build output.
- Required icon sizes: 16, 32, 48, and 128 px.
- Privacy policy, store listing copy, release notes, edge-case documentation, and performance notes.
- Screenshot and promotional image placeholders under `store-assets`.
- Ready-to-upload ZIP under `release`.

## Troubleshooting

- **Failed to load extension / missing popup**: load `dist`, not the project root.
- **CSP errors mentioning `blob:` or `new Function`**: rebuild with `npm run package`; the current build script removes those incompatible runtime paths.
- **Cannot read local PDFs**: enable **Allow access to file URLs** for the extension in `chrome://extensions`.
- **Very large PDFs are slow in ZIP mode**: use non-ZIP mode for lower memory use because pages can be downloaded one at a time.

## Privacy

All conversion work happens locally in Chrome. See `PRIVACY.md` for the full policy.
