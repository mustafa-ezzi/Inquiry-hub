import { afterEach, describe, expect, it } from "vitest";
import {
  COOKIE_CONSENT_KEY,
  readCookieConsent,
  writeCookieConsent,
} from "./cookieConsent";

describe("cookieConsent", () => {
  afterEach(() => {
    localStorage.removeItem(COOKIE_CONSENT_KEY);
  });

  it("reads and writes consent", () => {
    expect(readCookieConsent()).toBeNull();
    writeCookieConsent("accepted");
    expect(readCookieConsent()).toBe("accepted");
    writeCookieConsent("declined");
    expect(readCookieConsent()).toBe("declined");
  });
});
