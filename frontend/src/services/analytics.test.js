import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ANALYTICS_EVENTS,
  resetAnalyticsTracker,
  setAnalyticsTracker,
  trackEvent,
} from "./analytics";
import { COOKIE_CONSENT_KEY, writeCookieConsent } from "../lib/cookieConsent";

describe("analytics", () => {
  afterEach(() => {
    resetAnalyticsTracker();
    localStorage.removeItem(COOKIE_CONSENT_KEY);
  });

  it("skips funnel events without consent", async () => {
    const fn = vi.fn();
    setAnalyticsTracker(fn);
    await trackEvent(ANALYTICS_EVENTS.INQUIRY_CREATED, { inquiryId: "i1" });
    expect(fn).not.toHaveBeenCalled();
  });

  it("calls tracker when consent accepted", async () => {
    writeCookieConsent("accepted");
    const fn = vi.fn();
    setAnalyticsTracker(fn);
    await trackEvent(ANALYTICS_EVENTS.INQUIRY_CREATED, { inquiryId: "i1" });
    expect(fn).toHaveBeenCalledWith(ANALYTICS_EVENTS.INQUIRY_CREATED, {
      inquiryId: "i1",
    });
  });

  it("can bypass consent for ops events", async () => {
    const fn = vi.fn();
    setAnalyticsTracker(fn);
    await trackEvent(
      ANALYTICS_EVENTS.SHOP_VERIFIED,
      { shopId: "s1" },
      { requireConsent: false }
    );
    expect(fn).toHaveBeenCalled();
  });

  it("ignores empty event names", async () => {
    writeCookieConsent("accepted");
    const fn = vi.fn();
    setAnalyticsTracker(fn);
    await trackEvent("");
    expect(fn).not.toHaveBeenCalled();
  });
});
