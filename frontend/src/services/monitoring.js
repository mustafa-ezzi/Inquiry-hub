/**
 * Error monitoring facade (Phase 6).
 * Wire `setErrorReporter` to Sentry (or similar) in production.
 */

/** @type {(error: unknown, context?: Record<string, unknown>) => void | Promise<void>} */
let reporter = (error, context) => {
  if (typeof console !== "undefined") {
    console.error("[monitoring]", error, context || {});
  }
};

/**
 * @param {(error: unknown, context?: Record<string, unknown>) => void | Promise<void>} fn
 */
export function setErrorReporter(fn) {
  reporter = fn;
}

export function resetErrorReporter() {
  reporter = (error, context) => {
    if (typeof console !== "undefined") {
      console.error("[monitoring]", error, context || {});
    }
  };
}

/**
 * @param {unknown} error
 * @param {Record<string, unknown>} [context]
 */
export async function reportError(error, context = {}) {
  try {
    await reporter(error, context);
  } catch {
    /* never throw from monitoring */
  }
}

/**
 * Convenience for inquiry / API failures.
 * @param {string} operation
 * @param {unknown} error
 * @param {Record<string, unknown>} [extra]
 */
export async function reportInquiryFailure(operation, error, extra = {}) {
  await reportError(error, {
    area: "inquiry",
    operation,
    ...extra,
  });
}
