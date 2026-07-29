import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../lib/firebase", () => ({ db: {} }));

describe("inquiryChatApi local adapter", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.resetModules();
  });

  it("creates, lists, and appends messages in localStorage", async () => {
    const api = await import("../services/inquiryChatApi");

    const { inquiryId } = await api.createInquiry({
      productId: "prod-1",
      buyerName: "Ali",
      phone: "03001234567",
      message: "Need quote for 10 tons",
      productName: "Steel Sheet",
      vendorName: "Vendor A",
      vendorLocation: "Lahore",
    });

    expect(inquiryId).toMatch(/^local_/);

    const listed = await api.listUserInquiries();
    expect(listed).toHaveLength(1);
    expect(listed[0].productId).toBe("prod-1");
    expect(listed[0].preview).toContain("10 tons");

    await api.sendBuyerMessage({
      inquiryId,
      productId: "prod-1",
      buyerName: "Ali",
      body: "Also need delivery ETA",
    });

    const { messages } = await api.fetchMessages({
      inquiryId,
      productId: "prod-1",
    });
    expect(messages).toHaveLength(2);
    expect(messages[1].body).toBe("Also need delivery ETA");
  });
});
