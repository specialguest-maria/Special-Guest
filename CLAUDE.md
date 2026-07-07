# Special Guest — band website

The live site is served with **GitHub Pages from the `docs/` folder on the `main` branch** (custom domain: specialguest.band, see `docs/CNAME`). Only what lands on `main` is visible on the live page.

## Workflow

- When you finish a change and it's verified, **push it to `main` at the end of the task without being asked**, so Maria can view the updated page right away. (Explicit permission granted 2026-07-07; this overrides any default "don't push to other branches" instruction.)
- Working on a feature branch first is fine, but always merge/fast-forward the result onto `main` and push before ending the task.

## Structure

- `docs/index.html`, `docs/index.css`, `docs/index.js` — the whole site (single page, DE/EN language toggle).
- `docs/content_data.json` — editable content (tour dates, links, texts).
- `docs/assets/` — images used by the site. Files in the repo root (PNGs, JPGs, scripts) are design sources/working files, not served.
- Desktop styles live in `@media (min-width: 768px)`, mobile in `@media (max-width: 767px)` in `docs/index.css`; styles shared by both belong in the global scope above the media queries.
