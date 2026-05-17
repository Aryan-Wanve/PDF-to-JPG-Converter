# Chrome Web Store Listing Copy

Use this file as the source copy for the Chrome Web Store Developer Dashboard.

## Product Details

**Name:** PDF to JPG Converter

**Short description:** Convert the PDF open in Chrome into JPG page images locally, with quality, scale, and ZIP controls.

**Category:** Productivity

**Language:** English

**Version:** 1.0.0

## Detailed Description

PDF to JPG Converter turns the PDF open in your active Chrome tab into JPG page images directly in Chrome.

Open a PDF, choose your JPG quality and resolution scale, decide whether you want individual JPG downloads or one ZIP file, then click Convert. The extension renders the PDF locally in the browser and saves the output using clean, predictable filenames such as `page-001.jpg`, `page-002.jpg`, and onward.

The extension is built for students, teachers, office users, and anyone who needs quick PDF page images without uploading private documents to a web service.

Key features:

- Convert the active PDF tab into JPG images.
- Process documents locally in Chrome.
- No accounts, uploads, backend servers, analytics, telemetry, ads, or tracking.
- JPG quality control from 50 to 100.
- Resolution scale controls: 1x, 1.5x, 2x, and 3x.
- Optional ZIP export containing the output folder.
- Automatic output folder names based on the PDF filename.
- Predictable page filenames such as `page-001.jpg`.
- Progress state with page count, ETA, step details, cancellation, and completion/error states.
- Dark and light popup themes.

Important local file note:

For local `file://` PDFs, Chrome requires users to enable **Allow access to file URLs** for the extension from `chrome://extensions`. This is a Chrome security setting. After enabling it, reload the PDF tab before converting.

## Promotional Text

Fast local PDF to JPG conversion directly inside Chrome.

## Release Notes

Initial launch release with local PDF rendering, JPG export, ZIP mode, saved settings, progress tracking, cancellation, local-file handling, and Chrome Web Store-ready packaging.

## Graphic Assets To Upload

Store icon:

- `icons/icon-128.png`

Screenshots:

- `store-assets/screenshots/01-popup-ready.png`
- `store-assets/screenshots/02-popup-progress.png`
- `store-assets/screenshots/03-popup-success.png`
- `store-assets/screenshots/04-downloads-output.png`

Promotional images:

- `store-assets/banners/small-promo-440x280.png`
- `store-assets/banners/marquee-1400x560.png`

Package ZIP:

- `release/pdf-to-jpg-converter-v1.0.0.zip`

Store asset bundle:

- `release/chrome-web-store-assets-v1.0.0.zip`

## Privacy Practices Tab

### Single Purpose

PDF to JPG Converter converts the PDF open in the active Chrome tab into local JPG image files, with optional ZIP export.

### Data Usage Certification

The extension does not collect, sell, transmit, or share user data. PDF content is read only to render JPG files locally in Chrome. The extension does not use analytics, telemetry, advertising, tracking pixels, remote scripts, cloud services, or external processing.

Recommended data collection answer: **No user data collected**.

### Permission Justifications

`activeTab`

Used only after the user opens the popup, so the extension can identify the current PDF tab and derive the source PDF URL.

`downloads`

Used to save generated JPG files or a ZIP file to the user's Chrome downloads folder.

`storage`

Used to remember local export preferences such as JPG quality, resolution scale, ZIP mode, and theme.

`offscreen`

Used to create an extension-owned offscreen document that renders PDF pages into JPG images without opening another visible tab or sending files to a server.

`<all_urls>` host access

Used only to read the active PDF URL selected by the user for conversion, including local `file://` PDFs when the user explicitly enables Chrome's **Allow access to file URLs** setting. The extension does not crawl, monitor, or collect browsing activity.

## Support URL Copy

Use the repository README or a GitHub Issues page as the support URL after the repository is public.

Suggested support text:

For support, open an issue on the project repository and include Chrome version, PDF source type, selected scale, ZIP mode setting, and the exact popup status or error message.
