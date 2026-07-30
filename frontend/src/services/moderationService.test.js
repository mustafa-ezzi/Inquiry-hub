import { beforeEach, describe, expect, it, vi } from "vitest";

const addDoc = vi.fn();
const updateDoc = vi.fn();
const getDocs = vi.fn();
const collection = vi.fn(() => "col");
const doc = vi.fn(() => "docRef");
const query = vi.fn((...a) => a);
const where = vi.fn();
const orderBy = vi.fn();
const limit = vi.fn();
const serverTimestamp = vi.fn(() => "ts");

vi.mock("firebase/firestore", () => ({
  addDoc: (...a) => addDoc(...a),
  updateDoc: (...a) => updateDoc(...a),
  getDocs: (...a) => getDocs(...a),
  collection: (...a) => collection(...a),
  doc: (...a) => doc(...a),
  query: (...a) => query(...a),
  where: (...a) => where(...a),
  orderBy: (...a) => orderBy(...a),
  limit: (...a) => limit(...a),
  serverTimestamp: (...a) => serverTimestamp(...a),
}));

vi.mock("../lib/firebase", () => ({ db: {} }));

const trackEvent = vi.fn(async () => undefined);
vi.mock("./analytics", () => ({
  ANALYTICS_EVENTS: {
    REPORT_CREATED: "report_created",
  },
  trackEvent: (...a) => trackEvent(...a),
}));

describe("moderationService", () => {
  beforeEach(() => {
    vi.resetModules();
    addDoc.mockReset();
    updateDoc.mockReset();
    getDocs.mockReset();
    trackEvent.mockReset();
  });

  it("creates a report", async () => {
    addDoc.mockResolvedValue({ id: "r1" });
    const { createReport } = await import("./moderationService");
    const result = await createReport({
      targetType: "product",
      targetId: "p1",
      reason: "Spam listing",
      reporterUid: "u1",
    });
    expect(result.id).toBe("r1");
    expect(trackEvent).toHaveBeenCalled();
  });

  it("rejects incomplete reports", async () => {
    const { createReport } = await import("./moderationService");
    await expect(
      createReport({
        targetType: "product",
        targetId: "p1",
        reason: "x",
        reporterUid: "u1",
      })
    ).rejects.toThrow(/reason/i);
  });

  it("lists open reports and resolves", async () => {
    getDocs.mockResolvedValue({
      docs: [
        {
          id: "r1",
          data: () => ({
            targetType: "product",
            targetId: "p1",
            reason: "Abuse",
            status: "open",
            reporterUid: "u1",
            createdAt: 1,
          }),
        },
      ],
    });
    updateDoc.mockResolvedValue(undefined);
    const { listOpenReports, resolveReport, setProductHidden } = await import(
      "./moderationService"
    );
    const rows = await listOpenReports();
    expect(rows[0].id).toBe("r1");
    await resolveReport("r1", { resolution: "ok" });
    expect(updateDoc).toHaveBeenCalled();
    await setProductHidden("p1", true);
    expect(updateDoc).toHaveBeenCalled();
  });
});
