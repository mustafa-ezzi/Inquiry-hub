import { beforeEach, describe, expect, it, vi } from "vitest";

const getDocs = vi.fn();
const getDoc = vi.fn();
const collection = vi.fn(() => "col");
const query = vi.fn((...args) => args);
const orderBy = vi.fn();
const limit = vi.fn();
const startAfter = vi.fn();
const where = vi.fn();
const doc = vi.fn(() => "docRef");

vi.mock("firebase/firestore", () => ({
  collection: (...a) => collection(...a),
  getDocs: (...a) => getDocs(...a),
  getDoc: (...a) => getDoc(...a),
  query: (...a) => query(...a),
  orderBy: (...a) => orderBy(...a),
  limit: (...a) => limit(...a),
  startAfter: (...a) => startAfter(...a),
  where: (...a) => where(...a),
  doc: (...a) => doc(...a),
  addDoc: vi.fn(),
  serverTimestamp: vi.fn(),
}));

vi.mock("../lib/firebase", () => ({ db: {} }));

describe("productService + shopsService fetches", () => {
  beforeEach(() => {
    vi.resetModules();
    getDocs.mockReset();
    getDoc.mockReset();
  });

  it("fetchProducts maps records", async () => {
    getDocs.mockResolvedValue({
      docs: [
        {
          id: "p1",
          data: () => ({ name: "Rod", price: "1000", created_at: {} }),
        },
      ],
    });
    const { fetchProducts } = await import("../services/productService");
    const res = await fetchProducts();
    expect(res.products).toHaveLength(1);
    expect(res.products[0].name).toBe("Rod");
    expect(res.products[0].numericPrice).toBe(1000);
  });

  it("fetchShopById returns mapped shop or null", async () => {
    getDoc.mockResolvedValueOnce({
      exists: () => true,
      id: "s1",
      data: () => ({ shopName: "Steel Hub", location: "Lahore", verified: true }),
    });
    const { fetchShopById } = await import("../services/shopsService");
    const shop = await fetchShopById("s1");
    expect(shop.shopName).toBe("Steel Hub");
    expect(shop.isVerified).toBe(true);

    getDoc.mockResolvedValueOnce({ exists: () => false });
    expect(await fetchShopById("missing")).toBeNull();
  });

  it("fetchCategories maps and sorts", async () => {
    getDocs.mockResolvedValue({
      docs: [
        {
          id: "c2",
          data: () => ({ name: "Bolts", sortOrder: 2, icon: "bolt" }),
        },
        {
          id: "c1",
          data: () => ({ name: "Pipes", order: 1, iconKey: "pipe" }),
        },
      ],
    });
    const { fetchCategories } = await import("../services/categoriesService");
    const rows = await fetchCategories();
    expect(rows.map((r) => r.name)).toEqual(["Pipes", "Bolts"]);
    expect(typeof rows[0].icon).toBe("function");
  });
});
