import { beforeEach, describe, expect, it, vi } from "vitest";

const addDoc = vi.fn();
const getDocs = vi.fn();
const getDoc = vi.fn();
const updateDoc = vi.fn();
const collection = vi.fn(() => "col");
const doc = vi.fn(() => "docRef");
const query = vi.fn((...a) => a);
const where = vi.fn();
const orderBy = vi.fn();
const limit = vi.fn();
const serverTimestamp = vi.fn(() => "ts");
const onSnapshot = vi.fn();
const notifyNewInquiryMock = vi.fn(async () => undefined);

vi.mock("firebase/firestore", () => ({
  addDoc: (...a) => addDoc(...a),
  getDocs: (...a) => getDocs(...a),
  getDoc: (...a) => getDoc(...a),
  updateDoc: (...a) => updateDoc(...a),
  collection: (...a) => collection(...a),
  doc: (...a) => doc(...a),
  query: (...a) => query(...a),
  where: (...a) => where(...a),
  orderBy: (...a) => orderBy(...a),
  limit: (...a) => limit(...a),
  serverTimestamp: (...a) => serverTimestamp(...a),
  onSnapshot: (...a) => onSnapshot(...a),
}));

vi.mock("../lib/firebase", () => ({ db: {} }));
vi.mock("./notifyInquiry", () => ({
  notifyNewInquiry: (...a) => notifyNewInquiryMock(...a),
}));

describe("inquiryFirestoreService", () => {
  beforeEach(() => {
    vi.resetModules();
    addDoc.mockReset();
    getDocs.mockReset();
    getDoc.mockReset();
    updateDoc.mockReset();
    onSnapshot.mockReset();
    notifyNewInquiryMock.mockReset();
  });

  it("rejects create without buyerUid", async () => {
    const { createFirestoreInquiry } = await import("./inquiryFirestoreService");
    await expect(
      createFirestoreInquiry({
        productId: "p1",
        buyerUid: "",
        buyerName: "Ali",
        phone: "03001234567",
        message: "Need quote",
      })
    ).rejects.toThrow(/Sign in/i);
  });

  it("creates inquiry and first message", async () => {
    getDocs.mockResolvedValue({ empty: true, docs: [] });
    addDoc
      .mockResolvedValueOnce({ id: "inq-1" })
      .mockResolvedValueOnce({ id: "m-1" });

    const { createFirestoreInquiry } = await import("./inquiryFirestoreService");
    const result = await createFirestoreInquiry({
      productId: "p1",
      shopId: "s1",
      buyerUid: "u1",
      buyerName: "Ali Khan",
      phone: "03001234567",
      message: "Need 10 tons steel",
      productName: "Steel",
    });

    expect(result.inquiryId).toBe("inq-1");
    expect(addDoc).toHaveBeenCalledTimes(2);
    expect(notifyNewInquiryMock).toHaveBeenCalledWith(
      expect.objectContaining({ inquiryId: "inq-1", shopId: "s1" })
    );
  });

  it("getInquiry returns mapped doc", async () => {
    getDoc.mockResolvedValue({
      exists: () => true,
      id: "inq-9",
      data: () => ({
        productId: "p9",
        shopId: "s9",
        buyerName: "Ali",
        status: "awaiting_vendor",
      }),
    });
    const { getInquiry } = await import("./inquiryFirestoreService");
    const row = await getInquiry("inq-9");
    expect(row.inquiryId).toBe("inq-9");
    expect(row.productId).toBe("p9");
  });

  it("lists buyer inquiries", async () => {
    getDocs.mockResolvedValue({
      docs: [
        {
          id: "inq-1",
          data: () => ({
            productId: "p1",
            buyerUid: "u1",
            buyerName: "Ali",
            productName: "Pipe",
            status: "awaiting_vendor",
            preview: "Hello",
            updatedAt: { toMillis: () => 1000 },
          }),
        },
      ],
    });
    const { listBuyerInquiries } = await import("./inquiryFirestoreService");
    const rows = await listBuyerInquiries("u1");
    expect(rows).toHaveLength(1);
    expect(rows[0].inquiryId).toBe("inq-1");
    expect(rows[0].productId).toBe("p1");
  });

  it("sendFirestoreMessage appends and updates status", async () => {
    addDoc.mockResolvedValue({ id: "m2" });
    updateDoc.mockResolvedValue(undefined);
    const { sendFirestoreMessage } = await import("./inquiryFirestoreService");
    await sendFirestoreMessage({
      inquiryId: "inq-1",
      body: "Follow up",
      role: "buyer",
      senderName: "Ali",
      senderUid: "u1",
    });
    expect(addDoc).toHaveBeenCalled();
    expect(updateDoc).toHaveBeenCalled();
  });

  it("rejects unauthorized empty sender on send", async () => {
    const { sendFirestoreMessage } = await import("./inquiryFirestoreService");
    await expect(
      sendFirestoreMessage({
        inquiryId: "inq-1",
        body: "Hi",
        role: "buyer",
        senderName: "Ali",
        senderUid: "",
      })
    ).rejects.toThrow(/Missing inquiry or sender/);
  });

  it("fetchFirestoreMessages maps docs", async () => {
    getDocs.mockResolvedValue({
      docs: [
        {
          id: "m1",
          data: () => ({
            role: "buyer",
            senderName: "Ali",
            body: "Hi",
            createdAt: { toMillis: () => 50 },
          }),
        },
      ],
    });
    const { fetchFirestoreMessages } = await import("./inquiryFirestoreService");
    const { messages } = await fetchFirestoreMessages("inq-1");
    expect(messages[0].body).toBe("Hi");
    expect(messages[0].createdAt).toBe(50);
  });

  it("listShopInquiries and subscribeShopInquiries", async () => {
    getDocs.mockResolvedValue({
      docs: [
        {
          id: "inq-s",
          data: () => ({
            shopId: "shop-1",
            productName: "Rod",
            status: "awaiting_vendor",
            updatedAt: 99,
          }),
        },
      ],
    });
    const { listShopInquiries, subscribeShopInquiries } = await import(
      "./inquiryFirestoreService"
    );
    const rows = await listShopInquiries("shop-1");
    expect(rows[0].inquiryId).toBe("inq-s");

    expect(await listShopInquiries("")).toEqual([]);

    const onData = vi.fn();
    onSnapshot.mockImplementation((_q, ok) => {
      ok({
        docs: [
          {
            id: "inq-live",
            data: () => ({ shopId: "shop-1", productName: "Live" }),
          },
        ],
      });
      return () => {};
    });
    const unsub = subscribeShopInquiries("shop-1", onData);
    expect(onData).toHaveBeenCalledWith([
      expect.objectContaining({ inquiryId: "inq-live" }),
    ]);
    unsub();

    const empty = vi.fn();
    subscribeShopInquiries("", empty);
    expect(empty).toHaveBeenCalledWith([]);
  });
});
