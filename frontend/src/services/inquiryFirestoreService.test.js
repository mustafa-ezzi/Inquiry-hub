import { beforeEach, describe, expect, it, vi } from "vitest";

const addDoc = vi.fn();
const getDocs = vi.fn();
const updateDoc = vi.fn();
const collection = vi.fn(() => "col");
const doc = vi.fn(() => "docRef");
const query = vi.fn((...a) => a);
const where = vi.fn();
const orderBy = vi.fn();
const limit = vi.fn();
const serverTimestamp = vi.fn(() => "ts");
const onSnapshot = vi.fn();

vi.mock("firebase/firestore", () => ({
  addDoc: (...a) => addDoc(...a),
  getDocs: (...a) => getDocs(...a),
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

describe("inquiryFirestoreService", () => {
  beforeEach(() => {
    vi.resetModules();
    addDoc.mockReset();
    getDocs.mockReset();
    updateDoc.mockReset();
    onSnapshot.mockReset();
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
});
