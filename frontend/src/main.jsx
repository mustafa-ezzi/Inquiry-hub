import React from "react";
import ReactDOM from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App";
import "./index.css";
import {
  notifyPwaUpdateAvailable,
  setPwaUpdateHandler,
} from "./lib/pwaUpdateChannel";

const updateSW = registerSW({
  onNeedRefresh() {
    notifyPwaUpdateAvailable();
  },
});

setPwaUpdateHandler(() => updateSW(true));

if (import.meta.env.DEV) {
  globalThis.__updateSW = updateSW;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
