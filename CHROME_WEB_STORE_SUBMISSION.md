# Chrome Web Store Submission Checklist

This checklist is based on the current Chrome Web Store documentation for listing images, privacy fields, and permission review.

## Build

1. Run `npm install`.
2. Run `npm run package`.
3. Run `npm run package:store-assets`.
4. Upload `release/pdf-to-jpg-converter-v1.0.0.zip` in the Developer Dashboard.
5. Use `release/chrome-web-store-assets-v1.0.0.zip` as the upload/copy source for listing assets and text.

## Required Store Assets

Chrome requires a store icon, at least one screenshot, and a small promotional image. This project provides all required assets plus the optional marquee promo tile.

| Asset | Required | File | Size |
| --- | --- | --- | --- |
| Store icon | Yes | `icons/icon-128.png` | 128x128 |
| Screenshot 1 | Yes | `store-assets/screenshots/01-popup-ready.png` | 1280x800 |
| Screenshot 2 | Recommended | `store-assets/screenshots/02-popup-progress.png` | 1280x800 |
| Screenshot 3 | Recommended | `store-assets/screenshots/03-popup-success.png` | 1280x800 |
| Screenshot 4 | Recommended | `store-assets/screenshots/04-downloads-output.png` | 1280x800 |
| Small promo tile | Yes | `store-assets/banners/small-promo-440x280.png` | 440x280 |
| Marquee promo tile | Optional | `store-assets/banners/marquee-1400x560.png` | 1400x560 |

Regenerate assets with:

```powershell
npm run icons
npm run store-assets
```

## Developer Dashboard Fields

- Name: use `PDF to JPG Converter`.
- Short description: copy from `STORE_LISTING.md`.
- Detailed description: copy from `STORE_LISTING.md`.
- Category: `Productivity`.
- Language: `English`.
- Privacy policy URL: publish `PRIVACY.md` somewhere public, such as the GitHub repository, and paste that URL.
- Support URL: use the GitHub Issues page or repository README.

## Privacy Practices

Use the privacy answers in `STORE_LISTING.md`.

Recommended data collection answer: **No user data collected**.

Be consistent across:

- Store listing description.
- Privacy practices form.
- Published privacy policy.
- Extension behavior.

## Permission Review Notes

The extension has a narrow single purpose: converting the active PDF tab into local JPG files.

Remaining permissions:

- `activeTab`
- `downloads`
- `storage`
- `offscreen`
- `<all_urls>` host access

`scripting` was intentionally removed because it is not used.

## Local Test Before Submission

1. Open `chrome://extensions`.
2. Enable Developer mode.
3. Load the `dist` folder as an unpacked extension.
4. Enable **Allow access to file URLs** if testing local PDFs.
5. Open a PDF in Chrome.
6. Convert with ZIP mode off.
7. Convert with ZIP mode on.
8. Confirm downloads contain JPG pages or the ZIP file.
9. Confirm no extension errors in `chrome://extensions`.

## Official References

- Chrome image requirements: https://developer.chrome.com/webstore/images
- Listing information: https://developer.chrome.com/docs/webstore/cws-dashboard-listing/
- Privacy fields: https://developer.chrome.com/docs/webstore/cws-dashboard-privacy
- Permission policy: https://developer.chrome.com/docs/webstore/program-policies/permissions/
