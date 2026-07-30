import { describe, expect, it } from "vitest";
import {
  computeRepliesQuickly,
  mergeFirstReplySample,
  normalizeMetrics,
  REPLIES_QUICKLY_MAX_MS,
  REPLIES_QUICKLY_MIN_SAMPLES,
} from "./responseBadge";

describe("responseBadge", () => {
  it("requires minimum samples", () => {
    expect(
      computeRepliesQuickly({
        avgFirstReplyMs: 1000,
        sampleSize: REPLIES_QUICKLY_MIN_SAMPLES - 1,
      })
    ).toBe(false);
  });

  it("is true when avg is within 24h with enough samples", () => {
    expect(
      computeRepliesQuickly({
        avgFirstReplyMs: REPLIES_QUICKLY_MAX_MS,
        sampleSize: REPLIES_QUICKLY_MIN_SAMPLES,
      })
    ).toBe(true);
    expect(
      computeRepliesQuickly({
        avgFirstReplyMs: REPLIES_QUICKLY_MAX_MS + 1,
        sampleSize: REPLIES_QUICKLY_MIN_SAMPLES,
      })
    ).toBe(false);
  });

  it("merges running average", () => {
    const a = mergeFirstReplySample(null, 1000);
    expect(a.sampleSize).toBe(1);
    expect(a.avgFirstReplyMs).toBe(1000);
    const b = mergeFirstReplySample(a, 3000);
    expect(b.sampleSize).toBe(2);
    expect(b.avgFirstReplyMs).toBe(2000);
  });

  it("normalizeMetrics sets repliesQuickly", () => {
    const m = normalizeMetrics({
      avgFirstReplyMs: 60_000,
      sampleSize: 3,
    });
    expect(m.repliesQuickly).toBe(true);
  });
});
