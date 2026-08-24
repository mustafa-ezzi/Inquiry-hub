import { describe, expect, it } from "vitest";
import {
  WAITLIST_STATUS,
  isValidWaitlistStatus,
  validateWaitlistSubmission,
} from "../lib/waitlistValidation";
import {
  defaultSiteConfig,
  mergeSiteConfig,
} from "../services/siteConfigService";

describe("waitlistValidation", () => {
  it("accepts known statuses", () => {
    expect(isValidWaitlistStatus(WAITLIST_STATUS.PENDING)).toBe(true);
    expect(isValidWaitlistStatus("nope")).toBe(false);
  });

  it("validates required fields", () => {
    expect(
      validateWaitlistSubmission({ name: "A", phone: "123", shopName: "X" })
    ).toMatch(/name/i);
    expect(
      validateWaitlistSubmission({
        name: "Ali",
        phone: "03001234",
        shopName: "Steel Co",
      })
    ).toBeNull();
    expect(
      validateWaitlistSubmission({
        name: "Ali",
        phone: "12",
        shopName: "Steel Co",
      })
    ).toMatch(/phone/i);
  });
});

describe("mergeSiteConfig", () => {
  it("returns defaults for empty input", () => {
    const base = defaultSiteConfig();
    expect(mergeSiteConfig(null)).toEqual(base);
    expect(mergeSiteConfig({})).toEqual(base);
  });

  it("merges trimmed overrides", () => {
    const merged = mergeSiteConfig({
      supportEmail: "  ops@example.com ",
      ctaLabel: "Join",
      ctaTo: "/join",
      supportWhatsAppUrl: "",
    });
    expect(merged.supportEmail).toBe("ops@example.com");
    expect(merged.ctaLabel).toBe("Join");
    expect(merged.ctaTo).toBe("/join");
    expect(merged.supportWhatsAppUrl).toBe(
      defaultSiteConfig().supportWhatsAppUrl
    );
  });
});
