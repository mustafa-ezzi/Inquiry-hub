# Making InquireHub a PWA (Daraz-style)

This document explains how to turn this **Vite + React** frontend into a **Progressive Web App (PWA)**—installable on the home screen, fast repeat visits, and (optionally) offline support—similar in *behavior* to apps like **Daraz** (install prompt, app icon, standalone window, cached shell).

> **Scope:** PWAs run in the browser with a **service worker** + **web app manifest**. They are not native App Store / Play Store apps unless you wrap them (e.g. TWA) or publish a separate native shell.

---

## 1. What “Daraz-like” usually means for a PWA

| Goal | What users see | Technical piece |
|------|----------------|-----------------|
| **Installable** | “Add to Home Screen” / install banner | Web App Manifest + HTTPS + service worker (Chrome installability criteria) |
| **Looks like an app** | No browser URL bar (optional), splash, theme | `display: standalone`, `theme_color`, icons |
| **Fast return visits** | Instant shell, fewer network round-trips | Service worker **precaching** app shell (HTML/JS/CSS) |
| **Resilient / offline** | Cached pages or offline fallback | Runtime caching + offline page (optional; more complex for API-heavy pages) |
| **Engagement** | Push for promos / order updates (optional) | Web Push + backend (Firebase Cloud Messaging, etc.) |

Daraz also has **native apps**; a PWA is the **web** path to a similar *install and open from home screen* experience—not a 1:1 replacement for every native feature.

---

## 2. Prerequisites (non-negotiable)

1. **HTTPS** everywhere (localhost is exempt for dev). Production must use TLS.
2. A **stable origin** (one domain; avoid mixed content).
3. **Icons** at multiple sizes (see manifest section below).

---

## 3. Core building blocks

### 3.1 Web App Manifest (`manifest.webmanifest`)

Describes the “app” to the OS:

- `name` / `short_name`
- `start_url` (usually `/` or `/index.html`)
- `display`: `standalone` (recommended for app-like UI)
- `theme_color` / `background_color` (match your brand, e.g. `#0F6B36`)
- `icons`: 192×192 and 512×512 minimum; maskable icons for Android

### 3.2 Service Worker

A script the browser runs in the background to:

- **Precache** critical assets on install (your JS/CSS, shell routes).
- **Cache at runtime** (optional) for same-origin or CDN assets.
- Serve **offline fallback** when the network fails.

**Caution:** Aggressive caching of **Firestore / API** responses can show stale data unless you use strategies carefully (network-first for API, cache-first for static assets is a common split).

### 3.3 Registration

The app must **register** the service worker once (typically in `main.jsx` after the app mounts or on first load).

---

## 4. Recommended approach for **this** repo (Vite)

Use **`vite-plugin-pwa`** (maintained; integrates **Workbox**):

1. Install:

   ```bash
   npm install -D vite-plugin-pwa
   ```

2. In `vite.config.js`, add the plugin with at least:

   - `registerType: 'autoUpdate'` (or `prompt` if you want “New version available” UX)
   - `manifest` object mirroring your brand (name, colors, icons, `start_url`)
   - `workbox` options: `globPatterns` for build output; optional `runtimeCaching` for same-origin assets

3. Add **PWA icons** under `public/` (e.g. `pwa-192x192.png`, `pwa-512x512.png`) and reference them in the manifest.

4. **Optional:** `devOptions.enabled: true` during development to test the SW locally (can be fiddly; many teams test PWA only on staging HTTPS).

5. Build and verify:

   ```bash
   npm run build && npm run preview
   ```

   Open Chrome DevTools → **Application** → **Manifest** / **Service Workers** / **Lighthouse** (PWA audit).

---

## 5. Daraz-style UX checklist

- [ ] **Install:** Manifest + SW + HTTPS → Chrome “Install app” / Android “Add to Home screen”.
- [ ] **Standalone:** `display: standalone` so it opens without the full browser chrome (still not a true “system” app on iOS without extra steps).
- [ ] **iOS:** Add `apple-touch-icon` links in `index.html` (you may already have `logo.png`); consider `meta name="apple-mobile-web-app-capable"` and `apple-mobile-web-app-status-bar-style`.
- [ ] **Theme:** `theme-color` in HTML + manifest matches your green brand.
- [ ] **Scope:** `start_url` and `scope` cover your SPA routes (e.g. `/` only if everything is under one origin path).
- [ ] **Updates:** Decide `autoUpdate` vs user prompt when a new build ships.
- [ ] **Offline policy:** Document which pages work offline (e.g. home shell only) vs “network required” (Firestore lists).

---

## 6. Firebase / dynamic data and PWAs

- **Firestore reads** are not “installed” with the PWA; they need network (unless you add **Firestore persistence** / custom IndexedDB logic—that’s a separate product decision).
- **Practical Daraz-like behavior:** Cache **static UI** and **last-known-good** UI sparingly; use **loading states** when offline; optionally show a small “You’re offline” banner.
- **Images:** Runtime cache for your CDN / `firebasestorage` URLs can speed repeat views but increases storage and invalidation complexity.

---

## 7. Deployment notes

- **SPA routing:** If you use React Router `BrowserRouter`, the server must **rewrite** all paths to `index.html` (so refresh on `/product/123` works). Same requirement for PWA `start_url` deep links.
- **Cache busting:** Each `npm run build` produces new hashed filenames; Workbox precache handles that automatically when configured correctly.
- **Headers:** Some hosts send `Cache-Control` on `index.html`; avoid caching HTML aggressively if you rely on instant SW updates (tune per host).

---

## 8. Optional next steps (beyond basic PWA)

| Feature | Notes |
|---------|--------|
| **Web Push** | Needs backend + user permission; FCM is common with Firebase. |
| **Share target / shortcuts** | Manifest `shortcuts` for “Search”, “Post inquiry”, etc. |
| **Badging** | `navigator.setAppBadge` (limited support). |
| **Play Store (TWA)** | Bubblewrap / PWA Builder to wrap the site as a Trusted Web Activity. |

---

## 9. Suggested implementation order for this project

1. Add `vite-plugin-pwa` + manifest + icons → **installable** + **standalone**.
2. Tune **Workbox** precache for built assets only.
3. Add **offline fallback** page (optional) for navigations when offline.
4. Align **iOS** meta tags and icons with `public/logo.png` or dedicated PWA icons.
5. Run **Lighthouse PWA** on staging HTTPS until audits pass.
6. (Later) **Push** / **Firestore offline persistence** if product requires it.

---

## 10. References

- [web.dev — Progressive Web Apps](https://web.dev/progressive-web-apps/)
- [Vite PWA plugin](https://vite-pwa-org.netlify.app/)
- [MDN — Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Workbox](https://developer.chrome.com/docs/workbox)

---

*This file is a roadmap and checklist. Actual plugin config and code changes belong in `vite.config.js`, `main.jsx`, and `public/` assets when you implement the PWA.*
