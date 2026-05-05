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

Update [src/main.jsx](/d:/Inquiry_Platform/frontend/src/main.jsx) to register the PWA service worker:

```js
import React from "react";
import ReactDOM from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App";
import "./index.css";

registerSW({ immediate: true });

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

Later, if you want, you can show an "Update available" toast instead of using the simple immediate registration.

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

