import React from "react";
import ReactDOM from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App";
import "./index.css";

const updateSW = registerSW({
  onNeedRefresh() {
    if (
      window.confirm(
        "A new version of InquireHub is available. Reload now to update?"
      )
    ) {
      void updateSW(true);
    }
  },
});

// Expose for debugging in DevTools if needed
if (import.meta.env.DEV) {
  globalThis.__updateSW = updateSW;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
