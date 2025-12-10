# GenZlator-v2 Web App (React + TypeScript + Vite)

This is the frontend web app for GenZlator-v2, scaffolded with Vite, React, and TypeScript.

## Prerequisites
- Node.js `>=18` (tested with `20.17.0`)

## Scripts
- `npm install` — install dependencies
- `npm run dev` — start the local dev server at `http://localhost:5173/`
- `npm run build` — type-check and build production assets
- `npm run preview` — preview the production build locally
- `npm run lint` — run ESLint checks
- `npm run test` — execute Vitest in CI mode

## Project Structure
- `src/` — application source (entry: `src/main.tsx`, root component: `src/App.tsx`)
- `public/` — static assets served as-is
- `index.html` — application HTML entry
- `vite.config.ts` — Vite configuration

## Notes
- Vite and its React plugin are pinned to versions compatible with current Node.
- If upgrading Node to `>=20.19`, you can consider bumping Vite to v7.
