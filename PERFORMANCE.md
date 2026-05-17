# Performance Optimization Notes

- Rendering is sequential to avoid multiplying canvas memory on large PDFs.
- Rendering uses a hidden DOM canvas in the extension's offscreen document for compatibility with Chrome extension contexts.
- Canvas dimensions are reset after each JPG is encoded.
- pdf.js page cleanup runs after every page render.
- The renderer yields back to Chrome between pages to keep the extension responsive.
- Page preparation, rendering, encoding, and download-data preparation have timeouts so damaged or unusually heavy PDFs report a clear error instead of remaining stuck.
- Non-ZIP mode streams work page-by-page into Chrome downloads and is recommended for 500+ page PDFs.
- ZIP mode is convenient but stores generated pages in memory until the archive is produced.
- Scale 3x can create very large canvases on poster-size PDFs. Use 1x or 1.5x for very large source pages.
