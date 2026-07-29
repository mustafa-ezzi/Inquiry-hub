import { beforeEach, describe, expect, it, vi } from "vitest";

const addDoc = vi.fn();
const updateDoc = vi.fn();
const deleteDoc = vi.fn();
const getDoc = vi.fn();
const collection = vi.fn(() => "col");
const doc = vi.fn(() => "docRef");
const serverTimestamp = vi.fn(() => "ts");

vi.mock("firebase/firestore", () => ({
  addDoc: (...a) => addDoc(...a),
  updateDoc: (...a) => updateDoc(...a),
  deleteDoc: (...a) => deleteDoc(...a),
  getDoc: (...a) => getDoc(...a),
  collection: (...a) => collection(...a),
  doc: (...a) => doc(...a),
  serverTimestamp: (...a) => serverTimestamp(...a),
}));

vi.mock("../lib/firebase", () => ({ db: {} }));

vi.mock("./productService", () => ({
  PRODUCTS_COLLECTION: "products",
  fetchProductsByShopId: vi.fn(async () => [{ id: "p1", name: "Pipe" }]),
}));

describe("vendorProductService", () => {
  beforeEach(() => {
    vi.resetModules();
    addDoc.mockReset();
    updateDoc.mockReset();
    deleteDoc.mockReset();
    getDoc.mockReset();
  });

  it("lists products for a shop", async () => {
    const { listVendorProducts } = await import("./vendorProductService");
    const { fetchProductsByShopId } = await import("./productService");
    const rows = await listVendorProducts("shop-1");
    expect(fetchProductsByShopId).toHaveBeenCalledWith("shop-1", 80);
    expect(rows).toHaveLength(1);
  });

  it("creates a product after validation", async () => {
    addDoc.mockResolvedValue({ id: "new-p" });
    const { createVendorProduct } = await import("./vendorProductService");
    const result = await createVendorProduct({
      shopId: "s1",
      ownerUid: "u1",
      name: "Copper sheet",
      price: "1200",
      description: "1mm",
      category: "Sheets",
      imageUrl: "https://cdn.example/a.jpg",
    });
    expect(result.id).toBe("new-p");
    expect(addDoc).toHaveBeenCalled();
  });

  it("rejects create without shop", async () => {
    const { createVendorProduct } = await import("./vendorProductService");
    await expect(
      createVendorProduct({ shopId: "", ownerUid: "u1", name: "X" })
    ).rejects.toThrow(/Shop and owner/);
  });

  it("updates and deletes", async () => {
    updateDoc.mockResolvedValue(undefined);
    deleteDoc.mockResolvedValue(undefined);
    const { updateVendorProduct, deleteVendorProduct } = await import(
      "./vendorProductService"
    );
    await updateVendorProduct("p1", {
      name: "Updated",
      price: "",
      description: "",
      category: "",
      imageUrl: "",
      location: "Lahore",
    });
    expect(updateDoc).toHaveBeenCalled();
    await deleteVendorProduct("p1");
    expect(deleteDoc).toHaveBeenCalled();
  });
});
