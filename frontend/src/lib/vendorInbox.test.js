import { describe, expect, it } from "vitest";
import { INQUIRY_STATUS } from "./inquiryStatus";
import {
  filterVendorInbox,
  inboxProductOptions,
  summarizeVendorLeads,
} from "./vendorInbox";

describe("vendorInbox", () => {
  const rows = [
    {
      inquiryId: "1",
      status: INQUIRY_STATUS.AWAITING_VENDOR,
      productId: "p1",
      productName: "Steel pipe",
      buyerName: "Ali",
      phone: "0300",
      preview: "Need quote",
    },
    {
      inquiryId: "2",
      status: INQUIRY_STATUS.AWAITING_BUYER,
      productId: "p2",
      productName: "Copper",
      buyerName: "Sara",
      preview: "Thanks",
    },
    {
      inquiryId: "3",
      status: INQUIRY_STATUS.CLOSED,
      productId: "p1",
      productName: "Steel pipe",
      buyerName: "Omar",
      preview: "Done",
    },
  ];

  it("filters by status, product, and query", () => {
    expect(filterVendorInbox(rows, { status: INQUIRY_STATUS.AWAITING_VENDOR })).toHaveLength(
      1
    );
    expect(filterVendorInbox(rows, { productId: "p1" })).toHaveLength(2);
    expect(filterVendorInbox(rows, { query: "sara" })).toHaveLength(1);
    expect(filterVendorInbox(rows, { query: "0300" })).toHaveLength(1);
  });

  it("summarizes open vs awaiting vendor", () => {
    expect(summarizeVendorLeads(rows)).toEqual({
      total: 3,
      open: 2,
      awaitingVendor: 1,
      closed: 1,
    });
  });

  it("builds unique product options", () => {
    expect(inboxProductOptions(rows)).toEqual([
      { id: "p1", name: "Steel pipe" },
      { id: "p2", name: "Copper" },
    ]);
  });
});
