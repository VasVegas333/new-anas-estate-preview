# Ana's Estate

Premium Kalamata PDO Extra Virgin Olive Oil — marketing site built with [Astro](https://astro.build).

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:4321](http://localhost:4321) to preview the site locally.

## Build

```bash
npm run build
```

Static output is written to `dist/`. Preview the production build with:

```bash
npm run preview
```

## Project structure

```
src/
  assets/images/    Source images (optimized at build time via astro:assets)
  assets/images.ts  Central image imports
  components/
    layout/         Topbar, Header, Footer
    sections/       Homepage sections
  config/site.ts    Site constants, Stripe links, forms
  data/             Build-time data (JSON-LD schema)
  layouts/          Page shell (BaseLayout)
  pages/            Routes (index, shipping)
  scripts/          Shared client scripts (reveal, smooth-scroll)
  styles/           Global CSS
public/
  favicon/          Favicons and web manifest
  fonts/            Custom web fonts
  files/            Downloadable PDFs
  textures/         CSS background images
```

## Images

Page images use Astro's `<Image>` component from `astro:assets`, which generates responsive WebP output at build time. Source files live in `src/assets/images/`.

## Scripts

Client-side behavior is colocated with the code that uses it:

- **Header** — mobile navigation
- **HeroSection** — scroll and pointer parallax
- **index** — active section highlighting in the nav
- **BaseLayout** — scroll reveal animations and smooth anchor scrolling (shared across pages)

## Stripe payment links

Stripe checkout URLs are configured in `src/config/site.ts`.

## Deployment

Build the site (`npm run build`), then deploy the contents of `dist/` to your static host.
