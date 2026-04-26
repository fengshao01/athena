@AGENTS.md

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start the dev server at http://localhost:3000
- `npm run build` — production build
- `npm start` — run the production build
- `npm run lint` — ESLint (flat config at `eslint.config.mjs`)
- `npx tsc --noEmit` — type-check (no `typecheck` script is wired up)

No test runner is configured.

## Stack

- Next.js **16.2.4** with the App Router (`src/app/`). Per `AGENTS.md`, treat this as a version with breaking changes vs. prior Next.js — consult `node_modules/next/dist/docs/` (especially `01-app/`) before writing code that touches Next APIs, routing conventions, caching, or `next/*` imports.
- React **19.2.4**.
- Tailwind CSS **v4** via `@tailwindcss/postcss` (configured in `postcss.config.mjs`). v4 is CSS-first — there is no `tailwind.config.*`; theme/customization lives in `src/app/globals.css`.
- TypeScript strict mode. Path alias `@/*` → `./src/*` (see `tsconfig.json`).
- ESLint 9 flat config extending `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`.

## Architecture notes

- App Router only — there is no `pages/` directory. Layouts/pages live in `src/app/`.
- Fonts are loaded via `next/font/google` in `src/app/layout.tsx` and exposed as CSS variables (`--font-geist-sans`, `--font-geist-mono`) on `<html>`.
- The repo was bootstrapped from `create-next-app` and currently contains only the default landing page; most directories you might expect (components, lib, api routes, tests) do not exist yet — create them under `src/` as needed.
