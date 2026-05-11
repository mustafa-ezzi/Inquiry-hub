import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // "prompt" = new build waits until user accepts (see main.jsx confirm).
      // Use "autoUpdate" if you prefer silent refresh with no dialog.
      registerType: "prompt",
      includeAssets: ["apple-touch-icon.png", "logo.png"],
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,svg,ico,webp,woff2}"],
        // SPA: so navigations (e.g. /product/:id) stay installable / offline-shell friendly
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api\//],
      },
      manifest: {
        name: "InquireHub.PK",
        short_name: "InquireHub",
        description:
          "Find trusted hardware suppliers across Pakistan and connect directly with verified vendors.",
        theme_color: "#0F6B36",
        background_color: "#F8FAFC",
        display: "standalone",
        orientation: "any",
        start_url: "/",
        scope: "/",
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
        ],
      },
    }),
  ],
});
