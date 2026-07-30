import { afterEach, describe, expect, it, vi } from "vitest";
import {
  reportError,
  reportInquiryFailure,
  resetErrorReporter,
  setErrorReporter,
} from "./monitoring";

describe("monitoring", () => {
  afterEach(() => {
    resetErrorReporter();
  });

  it("calls injected reporter", async () => {
    const fn = vi.fn();
    setErrorReporter(fn);
    await reportError(new Error("boom"), { area: "test" });
    expect(fn).toHaveBeenCalled();
  });

  it("reportInquiryFailure tags area", async () => {
    const fn = vi.fn();
    setErrorReporter(fn);
    await reportInquiryFailure("create", new Error("fail"), { id: "1" });
    expect(fn).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ area: "inquiry", operation: "create" })
    );
  });
});
