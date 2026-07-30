/** Response-time / “Replies quickly” badge helpers (Phase 5). */

/** Avg first-reply ≤ 24h and at least this many samples. */
export const REPLIES_QUICKLY_MAX_MS = 24 * 60 * 60 * 1000;
export const REPLIES_QUICKLY_MIN_SAMPLES = 3;

/**
 * @param {{ avgFirstReplyMs?: number, sampleSize?: number } | null | undefined} metrics
 */
export function computeRepliesQuickly(metrics) {
  const sampleSize = Number(metrics?.sampleSize) || 0;
  const avg = Number(metrics?.avgFirstReplyMs);
  if (sampleSize < REPLIES_QUICKLY_MIN_SAMPLES) return false;
  if (!Number.isFinite(avg) || avg < 0) return false;
  return avg <= REPLIES_QUICKLY_MAX_MS;
}

/**
 * Running average after a new first-reply observation.
 * @param {{ avgFirstReplyMs?: number, sampleSize?: number } | null | undefined} prev
 * @param {number} firstReplyMs
 */
export function mergeFirstReplySample(prev, firstReplyMs) {
  const ms = Number(firstReplyMs);
  if (!Number.isFinite(ms) || ms < 0) {
    return normalizeMetrics(prev);
  }
  const sampleSize = Number(prev?.sampleSize) || 0;
  const avg = Number(prev?.avgFirstReplyMs) || 0;
  const nextSize = sampleSize + 1;
  const nextAvg =
    sampleSize === 0 ? ms : (avg * sampleSize + ms) / nextSize;
  return normalizeMetrics({
    avgFirstReplyMs: nextAvg,
    sampleSize: nextSize,
  });
}

/**
 * @param {{ avgFirstReplyMs?: number, sampleSize?: number } | null | undefined} metrics
 */
export function normalizeMetrics(metrics) {
  const sampleSize = Math.max(0, Math.floor(Number(metrics?.sampleSize) || 0));
  const avgFirstReplyMs = Number(metrics?.avgFirstReplyMs) || 0;
  return {
    avgFirstReplyMs,
    sampleSize,
    repliesQuickly: computeRepliesQuickly({
      avgFirstReplyMs,
      sampleSize,
    }),
  };
}
