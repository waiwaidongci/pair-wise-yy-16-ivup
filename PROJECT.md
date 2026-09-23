# Dechen Lhamo — Photographer Portfolio

Dark, editorial personal site for a high-plateau photographer, built with
**React + TypeScript + Vite**. Five routes (Home, Work, Series, About,
Contact) plus one global, non-route **Lightbox**.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-checks and produces dist/
node e2e-verify.mjs   # real-browser checks (dev server must be running)
```

## Content: one single source of truth

All business content comes from the authoritative `mock-data/photos.json`
and the JPEGs under `mock-data/photos/` — nothing is copied or re-hard-coded:

- `src/data/gallery.ts` imports the JSON and bundles the images in place via
  Vite's `import.meta.glob("../../mock-data/photos/**/*.jpg", { query: "?url" })`.
- `/work` and `/work/:seriesId` derive from the same in-memory model. The
  series page reads its photos in the exact `photoIds` order declared by the
  data (`getSeries()`); titles and captions are rendered straight from it.
- Creative content (series titles, photo titles, captions) stays in its
  original language as authored; only site chrome uses English labels
  (`getCategoryUiLabel`), per `assets/FONTS.md`. The data file is untouched.

## How the coupled constraints are wired

1. **Filter persistence** — the `/work` category filter lives in `App`
   (above the routed pages), so visiting a series and pressing Back restores
   the exact group instead of resetting to All.
2. **Scoped lightbox navigation** — the lightbox is a React context
   (`LightboxProvider`) rendered once at the root. Every opener hands it the
   concrete list it is currently showing (`open(scope, index)`): the filtered
   result on `/work`, or one series on `/work/:seriesId`. Arrow keys /
   buttons cycle with modulo **only inside that list**.
3. **No CLS** — `AspectImage` reserves the box with
   `aspect-ratio: width / height` from the real metadata before any bytes
   arrive; the `<img>` fades in absolutely positioned inside the reserved
   frame (measured CLS ≈ 0 in `e2e-verify.mjs`).
4. **Shared data model** — see above; no second photo list exists anywhere.
5. **Responsive** — below 760px the work grid becomes one column with the
   caption moved under the image, and the lightbox switches from a side
   information panel to a bottom information bar.
6. **Offline fonts** — `@font-face` in `src/styles.css` loads Inter and
   Playfair Display (normal + italic) from `public/fonts/`, copied from
   `assets/fonts/`. No Google Fonts requests are made (asserted in the
   browser checks).
7. **Contact form** — inline errors appear next to each field on blur /
   submit (empty fields, malformed email), the submit button is disabled
   until valid, sending shows a spinner, and success replaces the form with a
   clear confirmation screen (simulated front-end only).

## Structure

```
index.html
public/fonts/            # self-hosted woff2
src/
  data/
    types.ts
    gallery.ts           # single source: mock-data/photos.json + images
  components/
    Header.tsx  Footer.tsx
    AspectImage.tsx      # aspect-ratio placeholder (CLS guard)
    PhotoCard.tsx        # opens the scoped lightbox
    LightboxContext.tsx  # open(photos, index) / close / navigate
    Lightbox.tsx         # global overlay, keyboard + responsive
    useWindowSize.ts
  pages/
    HomePage.tsx  WorkPage.tsx  SeriesPage.tsx
    AboutPage.tsx  ContactPage.tsx
  App.tsx                # routes + lifted /work filter
  main.tsx  styles.css
e2e-verify.mjs           # Playwright checks for all seven constraints
```
