import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const createFirestoreInquiry = vi.fn(async () => ({ inquiryId: "fs-1" }));
const fetchFirestoreMessages = vi.fn(async () => ({
  messages: [{ id: "m1", body: "Hi", role: "buyer", createdAt: 1 }],
}));
const listBuyerInquiries = vi.fn(async () => [
  {
    inquiryId: "fs-1",
    productId: "p1",
    productName: "Pipe",
    preview: "Hi",
    updatedAt: 10,
    vendorName: "V",
    vendorLocation: "Lhr",
    status: "awaiting_vendor",
  },
]);
const sendFirestoreMessage = vi.fn(async () => undefined);
const subscribeFirestoreMessages = vi.fn((id, onData) => {
  onData([{ id: "m1", body: "Live", role: "buyer", createdAt: 2 }]);
  return () => {};
});
const findBuyerProductInquiry = vi.fn(async () => null);

vi.mock("./inquiryFirestoreService", () => ({
  createFirestoreInquiry: (...a) => createFirestoreInquiry(...a),
  fetchFirestoreMessages: (...a) => fetchFirestoreMessages(...a),
  findBuyerProductInquiry: (...a) => findBuyerProductInquiry(...a),
  listBuyerInquiries: (...a) => listBuyerInquiries(...a),
  sendFirestoreMessage: (...a) => sendFirestoreMessage(...a),
  subscribeFirestoreMessages: (...a) => subscribeFirestoreMessages(...a),
}));

describe("inquiryChatApi firestore facade", () => {
  beforeEach(async () => {
    vi.resetModules();
    createFirestoreInquiry.mockClear();
    fetchFirestoreMessages.mockClear();
    listBuyerInquiries.mockClear();
    sendFirestoreMessage.mockClear();
    const api = await import("./inquiryChatApi");
    api.__setInquiryBackendForTests("firestore");
  });

  afterEach(async () => {
    const api = await import("./inquiryChatApi");
    api.__setInquiryBackendForTests(null);
  });

  it("createInquiry / list / send / fetch / subscribe use Firestore", async () => {
    const api = await import("./inquiryChatApi");
    expect(api.getInquiryBackend()).toBe("firestore");
    expect(api.usesFirestoreInquiries()).toBe(true);

    const created = await api.createInquiry({
      productId: "p1",
      buyerUid: "u1",
      buyerName: "Ali Khan",
      phone: "03001234567",
      message: "Need stock",
      shopId: "s1",
    });
    expect(created.inquiryId).toBe("fs-1");
    expect(createFirestoreInquiry).toHaveBeenCalled();

    const listed = await api.listUserInquiries({ buyerUid: "u1" });
    expect(listed[0].productId).toBe("p1");

    await api.sendBuyerMessage({
      inquiryId: "fs-1",
      productId: "p1",
      buyerName: "Ali",
      buyerUid: "u1",
      body: "Ping",
    });
    expect(sendFirestoreMessage).toHaveBeenCalled();

    await api.sendVendorMessage({
      inquiryId: "fs-1",
      body: "We have stock",
      vendorName: "Shop",
      vendorUid: "v1",
    });

    const { messages } = await api.fetchMessages({
      inquiryId: "fs-1",
      productId: "p1",
    });
    expect(messages[0].body).toBe("Hi");

    let live = [];
    const unsub = api.subscribeMessages(
      { inquiryId: "fs-1", productId: "p1" },
      (m) => {
        live = m;
      }
    );
    expect(live[0].body).toBe("Live");
    unsub();
  });
});
