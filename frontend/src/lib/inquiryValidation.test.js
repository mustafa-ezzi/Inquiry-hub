import { describe, expect, it } from "vitest";
import {
  INQUIRY_STATUS,
  isValidInquiryStatus,
  statusAfterMessage,
} from "./inquiryStatus";
import {
  isValidMessageBody,
  isValidPhone,
  validateInquiryOnboarding,
} from "./inquiryValidation";

describe("inquiryStatus", () => {
  it("validates known statuses", () => {
    expect(isValidInquiryStatus(INQUIRY_STATUS.AWAITING_VENDOR)).toBe(true);
    expect(isValidInquiryStatus("nope")).toBe(false);
  });

  it("maps message role to next status", () => {
    expect(statusAfterMessage("buyer")).toBe(INQUIRY_STATUS.AWAITING_VENDOR);
    expect(statusAfterMessage("vendor")).toBe(INQUIRY_STATUS.AWAITING_BUYER);
  });
});

describe("inquiryValidation", () => {
  it("validates phone and message limits", () => {
    expect(isValidPhone("03001234567")).toBe(true);
    expect(isValidPhone("123")).toBe(false);
    expect(isValidMessageBody("Need quote")).toBe(true);
    expect(isValidMessageBody("")).toBe(false);
  });

  it("returns onboarding errors", () => {
    expect(
      validateInquiryOnboarding({
        buyerName: "A",
        phone: "03001234567",
        message: "Hi",
      })
    ).toMatch(/name/i);
    expect(
      validateInquiryOnboarding({
        buyerName: "Ali Khan",
        phone: "03001234567",
        message: "Need 10 tons",
      })
    ).toBeNull();
  });
});
