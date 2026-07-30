# AGENTS.md

## Cursor Cloud specific instructions

This repo is a **purely static website** (a GeoCities-style parody "LLM2HUMAN CLINIC" homestead) deployed on Cloudflare Pages (`llm2human.pages.dev`). There is no build step, package manager, backend, or test suite.

Structure:
- `index.html` — English homepage (self-contained: inline CSS + inline JS for the hit counter and countdown timer).
- `de/`, `es/`, `fr/`, `ja/`, `pt/`, `zh/` — localized `index.html` variants.
- `assets/` — images (Bitcoin QR, Product Hunt thumbnails, gallery).
- `robots.txt`, `sitemap.xml` — SEO/crawler files pointing at the production domain.

Running locally (development):
- Serve the directory with any static file server. Python 3 is available, so `python3 -m http.server 8000` from the repo root works. Open `http://localhost:8000/` (English) or `http://localhost:8000/<locale>/`.
- Do NOT open `index.html` via `file://`; the language links and asset paths are absolute (`/de/`, `/assets/...`) and only resolve when served from the site root.

Lint / test / build:
- None. There is no linter, test runner, or build pipeline configured. "Verifying" a change means serving the files and viewing the page in a browser.
