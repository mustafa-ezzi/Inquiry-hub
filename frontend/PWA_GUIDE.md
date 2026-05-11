# PWA Guide For This App

This frontend is a `Vite + React` app, so the cleanest way to make it a Progressive Web App is to use `vite-plugin-pwa`.

## Goal

After this setup, users should be able to:

- install the app on mobile or desktop
- get an app icon and splash behavior
- load key assets faster through caching
- see a basic offline fallback for previously cached pages/assets

## Recommended Approach

Use `vite-plugin-pwa` instead of wiring a service worker manually. It is simpler, safer, and fits this project well.

## 1. Install The PWA Package

From the `frontend` folder run:

```powershell
npm install -D vite-plugin-pwa
```

## 2. Create App Icons

Create a `public` folder if it does not exist:

```text
frontend/public
```

Add at least these files:

- `frontend/public/pwa-192x192.png`
- `frontend/public/pwa-512x512.png`
- `frontend/public/apple-touch-icon.png`

Recommended:

- use your InquireHub branding
- background color: `#0F6B36`
- keep the logo centered with enough padding

You can also add:

- `frontend/public/maskable-icon-512x512.png`

If you add a maskable icon, Android install screens will look better.

## 3. Update `vite.config.js`

Replace the current config in [vite.config.js](/d:/Inquiry_Platform/frontend/vite.config.js) with a PWA-enabled version like this:

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["apple-touch-icon.png"],
      manifest: {
        name: "InquireHub.PK",
        short_name: "InquireHub",
        description:
          "Find trusted hardware suppliers across Pakistan and connect directly with verified vendors.",
        theme_color: "#0F6B36",
        background_color: "#F8FAFC",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png"
          },
          {
            src: "/maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ]
      }
    })
  ]
});
```

If you do not create `maskable-icon-512x512.png`, remove that icon entry.

## 4. Register The Service Worker

Update [src/main.jsx](/d:/Inquiry_Platform/frontend/src/main.jsx) to register the PWA service worker.

**Current behavior (after redeploy):** `vite.config.js` uses `registerType: "prompt"`, and `main.jsx` uses `registerSW` with **`onNeedRefresh`**: when a new service worker is available, the user sees a **browser confirm** (“Reload now to update?”). If they accept, `updateSW(true)` applies the new version and reloads.

To go back to **silent** updates (no dialog), set `registerType: "autoUpdate"` in `vite.config.js` and use `registerSW({ immediate: true })` in `main.jsx` instead.

```js
import { registerSW } from "virtual:pwa-register";

const updateSW = registerSW({
  onNeedRefresh() {
    if (window.confirm("A new version… Reload now?")) {
      void updateSW(true);
    }
  },
});
```

## 5. Clean Up `index.html`

Your [index.html](/d:/Inquiry_Platform/frontend/index.html) already has a good `theme-color`, which is helpful for PWA behavior.

You should also add:

```html
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
```

You do not need to manually add `<link rel="manifest">` when using the plugin because it handles that for you.

## 6. Add Offline Strategy

For a first version, the plugin's default Workbox setup is usually enough.

If you want better offline behavior later, add `workbox` rules in `vite.config.js`:

```js
VitePWA({
  registerType: "autoUpdate",
  workbox: {
    globPatterns: ["**/*.{js,css,html,png,svg,ico}"]
  },
  manifest: {
    ...
  }
})
```

If product data comes from Firebase or live APIs, keep this in mind:

- static files can be cached well
- live product/vendor data should usually use network-first or stale-while-revalidate rules
- do not blindly cache dynamic API responses without deciding how fresh they must be

## 7. Build And Test

Run:

```powershell
npm run build
npm run preview
```

Then test in Chrome:

1. open the app
2. open DevTools
3. go to `Application`
4. check `Manifest`
5. check `Service Workers`
6. verify installability

Also test:

- mobile viewport
- desktop install prompt
- refresh after first load
- offline mode in DevTools

## 8. Important Deployment Requirement

PWA install and service worker support require:

- `HTTPS` in production

This is mandatory unless you are testing on `localhost`.

## 9. Nice-To-Have Next Steps

After the basic PWA works, you can improve it with:

- custom offline page
- install prompt button
- update available notification
- cached product thumbnails
- background sync for inquiry submissions

## 10. File Checklist

Files you will likely touch:

- [package.json](/d:/Inquiry_Platform/frontend/package.json)
- [vite.config.js](/d:/Inquiry_Platform/frontend/vite.config.js)
- [src/main.jsx](/d:/Inquiry_Platform/frontend/src/main.jsx)
- [index.html](/d:/Inquiry_Platform/frontend/index.html)

Files you will likely add:

- `frontend/public/pwa-192x192.png`
- `frontend/public/pwa-512x512.png`
- `frontend/public/apple-touch-icon.png`
- optional: `frontend/public/maskable-icon-512x512.png`

## Suggested Order

1. install `vite-plugin-pwa`
2. add app icons in `public`
3. update `vite.config.js`
4. register the service worker in `src/main.jsx`
5. add apple touch icon in `index.html`
6. build and test with Chrome DevTools
7. deploy over HTTPS

## Notes For This Project

- your current theme color `#0F6B36` is a good fit for the manifest
- this app already looks mobile-focused, which is good for PWA installability
- if you later add authentication, saved inquiries, or carts, we should design caching rules carefully so offline behavior does not show stale private data

---

## Troubleshooting: Lighthouse passes but “Install” never appears

### 1. Icon pixel size must match the manifest

Chrome requires that each PNG’s **real width/height** matches the `sizes` value in the web manifest (e.g. `192x192` must be a true 192×192 image). Copying one large `logo.png` to `pwa-192x192.png` **without resizing** often **breaks installability** even when Lighthouse looks fine.

This repo runs **`npm run prebuild`** → `scripts/generate-pwa-icons.mjs` (uses **sharp**) to generate correct **`pwa-192x192.png`**, **`pwa-512x512.png`**, and **`apple-touch-icon.png`** from `public/logo.png` before `vite build`. Redeploy after a fresh build.

### 2. SPA hosting on Vercel

Deep links like `/product/xyz` must serve **`index.html`** when there is no physical file. This repo includes **`vercel.json`** with a fallback rewrite so refreshes and the service worker behave correctly.

### 3. `beforeinstallprompt` (Chrome / Android / desktop)

- The **address-bar install icon** only appears after Chrome’s **engagement** rules (visit again, interact a bit, HTTPS).
- **Safari on iOS does not fire `beforeinstallprompt`.** Users must use **Share → Add to Home Screen**. The header **“Add to Home”** button explains that.

### 4. Check DevTools for the real error

Open **Application → Manifest**. If anything is invalid (icons, `start_url`, `scope`), Chrome lists it there. Also check the **Console** for red errors (CSP, mixed content, failed SW).

