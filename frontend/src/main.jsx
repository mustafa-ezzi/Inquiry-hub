import React from "react";
import ReactDOM from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App";
import "./index.css";
import {
  notifyPwaUpdateAvailable,
  setPwaUpdateHandler,
} from "./lib/pwaUpdateChannel";
import { reportError, setErrorReporter } from "./services/monitoring";

const updateSW = registerSW({
  onNeedRefresh() {
    notifyPwaUpdateAvailable();
  },
});

setPwaUpdateHandler(() => updateSW(true));

if (import.meta.env.DEV) {
  globalThis.__updateSW = updateSW;
}

/** Optional: POST errors to a webhook (Sentry Relay / Cloudflare Worker / etc.). */
const ERROR_WEBHOOK = import.meta.env.VITE_ERROR_WEBHOOK_URL?.trim();
if (ERROR_WEBHOOK) {
  setErrorReporter(async (error, context) => {
    const message =
      error instanceof Error ? error.message : String(error ?? "unknown");
    try {
      await fetch(ERROR_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          context,
          href: typeof location !== "undefined" ? location.href : "",
          ts: Date.now(),
        }),
        keepalive: true,
      });
    } catch {
      console.error("[monitoring]", error, context);
    }
  });
}

if (typeof window !== "undefined") {
  window.addEventListener("error", (event) => {
    void reportError(event.error || event.message, { type: "window.error" });
  });
  window.addEventListener("unhandledrejection", (event) => {
    void reportError(event.reason, { type: "unhandledrejection" });
  });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
