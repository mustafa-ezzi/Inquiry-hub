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
    Object.defineProperty(NotificationMock, "permission", {
      value: "granted",
      configurable: true,
    });
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
    vi.unstubAllGlobals();
  });

  it("requestInquiryNotifyPermission handles missing Notification", async () => {
    const had = "Notification" in window;
    const prev = had ? window.Notification : undefined;
    // Force unsupported path
    Object.defineProperty(window, "Notification", {
      value: undefined,
      configurable: true,
      writable: true,
    });
    delete window.Notification;
    expect(await requestInquiryNotifyPermission()).toBe("unsupported");

    const granted = { permission: "granted", requestPermission: vi.fn() };
    window.Notification = granted;
    expect(await requestInquiryNotifyPermission()).toBe("granted");

    window.Notification = {
      permission: "denied",
      requestPermission: vi.fn(),
    };
    expect(await requestInquiryNotifyPermission()).toBe("denied");

    const requestPermission = vi.fn(async () => "granted");
    window.Notification = { permission: "default", requestPermission };
    expect(await requestInquiryNotifyPermission()).toBe("granted");
    expect(requestPermission).toHaveBeenCalled();

    if (had) window.Notification = prev;
  });
});
