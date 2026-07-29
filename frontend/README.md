# InquireHub.PK frontend

Vite + React 18 + Tailwind PWA. Data: Firebase Firestore. Optional inquiry REST via `VITE_INQUIRY_API_BASE`.

## Setup

```bash
cp .env.example .env
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Local dev server |
| `npm run build` | Production build (also regenerates PWA icons) |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint — **errors fail CI** |
| `npm run test` | Vitest once (must be 100% green) |
| `npm run test:watch` | Vitest watch mode |
| `npm run test:coverage` | Coverage for `src/services` + `src/lib` (Phase 1 floor ≥ 40%) |

## Architecture sketch

- **Routes:** `/`, `/product/:id`, `/shop/:id`, `/inquiry/:id`, `/inquiries`, `/vendor-waitlist`, legal pages
- **Services:** `productService`, `shopsService`, `categoriesService`, `inquiryChatApi`
- **Mappers:** `lib/mapProduct.js`, `shopsService.mapShopForCard`

## PWA / offline (Phase 1)

| Capability | Offline behavior |
|------------|------------------|
| App shell (HTML/JS/CSS) | Cached by Workbox after first visit |
| Product / shop browse | Needs network (Firestore); on failure home may show sample catalog + error banner |
| Inquiry chat | Demo mode uses `localStorage` (device-local only). Production path needs API (Phase 3) |
| Install / update | Install button + update prompt (`registerType: "prompt"`) |

Staging checklist: install on Android Chrome, open product → inquiry, accept update prompt after a new deploy.

## Lint warnings policy

ESLint **errors** fail CI. `react-refresh/only-export-components` is a **warning** and does not fail the gate unless promoted later.
