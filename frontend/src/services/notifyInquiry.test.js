import { afterEach, describe, expect, it, vi } from "vitest";
import {
  notifyNewInquiry,
  requestInquiryNotifyPermission,
  resetInquiryNotifier,
  setInquiryNotifier,
} from "./notifyInquiry";

describe("notifyInquiry", () => {
  afterEach(() => {
    resetInquiryNotifier();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("calls injected notifier", async () => {
    const fn = vi.fn(async () => undefined);
    setInquiryNotifier(fn);
    await notifyNewInquiry({
      inquiryId: "i1",
      shopId: "s1",
      buyerName: "Ali",
      preview: "Hello",
    });
    expect(fn).toHaveBeenCalledWith(
      expect.objectContaining({ inquiryId: "i1", shopId: "s1" })
    );
  });

  it("default notifier logs and shows Notification when granted", async () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    const NotificationMock = vi.fn();
    NotificationMock.permission = "granted";
    vi.stubGlobal("Notification", NotificationMock);

    await notifyNewInquiry({
      inquiryId: "i2",
      buyerName: "Sara",
      preview: "Need steel",
    });

    expect(info).toHaveBeenCalledWith(
      "[inquiry-notify]",
      expect.objectContaining({ inquiryId: "i2" })
    );
    expect(NotificationMock).toHaveBeenCalledWith(
      "New inquiry",
      expect.objectContaining({ body: expect.stringContaining("Sara") })
    );
  });

  it("requestInquiryNotifyPermission maps permission states", async () => {
    vi.stubGlobal("Notification", {
      permission: "granted",
      requestPermission: vi.fn(),
    });
    expect(await requestInquiryNotifyPermission()).toBe("granted");

    vi.stubGlobal("Notification", {
      permission: "denied",
      requestPermission: vi.fn(),
    });
    expect(await requestInquiryNotifyPermission()).toBe("denied");

    const requestPermission = vi.fn(async () => "granted");
    vi.stubGlobal("Notification", {
      permission: "default",
      requestPermission,
    });
    expect(await requestInquiryNotifyPermission()).toBe("granted");
    expect(requestPermission).toHaveBeenCalled();
  });
});
