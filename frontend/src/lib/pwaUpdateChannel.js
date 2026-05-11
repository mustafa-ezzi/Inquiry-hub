/** Handoff between `virtual:pwa-register` (main.jsx) and React UI. */

/** @type {null | ((reload?: boolean) => Promise<void>)} */
let updateSWHandler = null;

export function setPwaUpdateHandler(handler) {
  updateSWHandler = handler;
}

export function applyPwaUpdate() {
  return updateSWHandler?.(true);
}

const REFRESH_EVENT = "pwa:update-available";

export function notifyPwaUpdateAvailable() {
  window.dispatchEvent(new Event(REFRESH_EVENT));
}

export function subscribePwaUpdateAvailable(callback) {
  window.addEventListener(REFRESH_EVENT, callback);
  return () => window.removeEventListener(REFRESH_EVENT, callback);
}
