# App Grid Bookmarks

A production-ready Next.js + TypeScript single page that mirrors an iPhone-style grid of bookmark “apps”. The experience includes animated shared-element transitions, a detail panel with deep-linking, persistent layout controls, and URL-synchronised filters.

## Quick Start

```bash
npm ci
npm run dev
```

### Scripts

- `npm run dev` – start the local dev server.
- `npm run build` – type-check and build for production.
- `npm run start` – serve the production build.
- `npm run lint` – run ESLint (core-web-vitals rules).
- `npm run type-check` – run `tsc` without emitting output.

## Project Structure

```
public/
  data/bookmarks.json      ← content & default layout values
  icons/*.svg              ← lightweight bookmark glyphs
src/
  app/
    page.tsx               ← server component loading the JSON + client shell
    layout.tsx             ← global shell, fonts, metadata
    globals.css            ← design tokens + Tailwind layers
  components/
    HomeClient.tsx         ← query-sync logic, filters, layout & details overlay
    AppTile.tsx            ← animated tile with icon/label interactions
    ControlsBar.tsx        ← icon size, gap, radius, column controls (persisted)
    Filters.tsx            ← tags, search, sort controls tied to URL params
    DetailsPanel.tsx       ← shared-element detail view, copy/share actions
  lib/
    data/types.ts          ← Bookmark / Settings contracts
    data/loaders.ts        ← filesystem + fetch loader, favicon helper
    ui/useSettings.ts      ← localStorage persistence + CSS variable binding
tailwind.config.ts         ← maps CSS variables into Tailwind tokens
tsconfig.json              ← strict TS settings + path alias
```

## Data Model

`public/data/bookmarks.json` includes:

- `bookmarks[]`: `id`, `title`, `url`, `description`, optional `iconSrc`, `color`, `tags`, `order`, timestamps, and `featured`.
- `settings`: grid defaults (`iconSize`, `radius`, `gap`, `columns { sm, md, lg }`).

Update this file to curate tiles, tags, and layout defaults. Icons referenced with `/icons/*.svg` should exist in `public/icons`.

## Feature Highlights

- **Responsive App Grid**: CSS grid template `repeat(auto-fit, minmax(var(--grid-min), 1fr))` adapts across breakpoints. Icon, gap, and radius adjustments update CSS variables in real time.
- **Framer Motion Transitions**: Shared layout IDs animate the selected tile into the detail view. Motion respects `prefers-reduced-motion`.
- **Deep Linking**: URL query parameters track selection (`?selected=`), filters (`tags=`), search (`q=`), sort (`sort=`), and layout tweaks (`icon=`, `gap=`, `radius=`, `cols=`).
- **Persistent Controls**: `useSettings` hydrates defaults from JSON, merges localStorage, applies query overrides, and writes updates back to both localStorage and CSS variables.
- **Graceful Data Loading**: `loadBookmarks` fetches `/data/bookmarks.json` when a public origin is available and falls back to filesystem reads during builds. Friendly empty state messaging prevents crashes.
- **Accessibility**: Skip link, focus rings, keyboard navigation (Enter/Space to open, Esc/backdrop to close), focus restoration, semantic regions, `aria-modal` detail view, and high-contrast tokens.
- **Performance**: Lazy icon loading, minimal SVG assets, CSS variable design tokens, and CI guardrails (lint/build/type-check).

## Customisation & Deployment

- Update colours, typography, and spacing via CSS variables in `globals.css` and Tailwind tokens in `tailwind.config.ts`.
- Extend controls or filters by editing `useSettings`, `ControlsBar`, and `Filters`.
- Deploy to Vercel: `npm ci && npm run build`. Shared-element transitions and deep links work without extra configuration.

Enjoy curating your personal app grid!
