import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";

vi.mock("../lib/firebase", () => ({ db: {} }));

const fetchShopById = vi.fn();
const fetchProductsByShopId = vi.fn();

vi.mock("../services/shopsService", async () => {
  const actual = await vi.importActual("../services/shopsService");
  return {
    ...actual,
    fetchShopById: (...args) => fetchShopById(...args),
  };
});

vi.mock("../services/productService", () => ({
  fetchProductsByShopId: (...args) => fetchProductsByShopId(...args),
}));

vi.mock("../components/Header", () => ({
  default: () => <header>Header</header>,
}));
vi.mock("../components/Footer", () => ({
  default: () => <footer>Footer</footer>,
}));
vi.mock("../components/BottomNav", () => ({
  default: () => <nav>Nav</nav>,
}));
vi.mock("../components/ProductGrid", () => ({
  default: ({ items }) => (
    <div>
      {items.map((p) => (
        <div key={p.id}>{p.name}</div>
      ))}
    </div>
  ),
}));

import ShopPage from "../pages/ShopPage";

describe("ShopPage", () => {
  beforeEach(() => {
    fetchShopById.mockReset();
    fetchProductsByShopId.mockReset();
  });

  it("shows shop name, verified badge, and products", async () => {
    fetchShopById.mockResolvedValue({
      id: "shop-1",
      shopName: "Karachi Steel",
      location: "Karachi",
      isVerified: true,
      verifiedLabel: "Verified",
    });
    fetchProductsByShopId.mockResolvedValue([
      { id: "p1", name: "Angle Iron" },
    ]);

    render(
      <MemoryRouter initialEntries={["/shop/shop-1"]}>
        <Routes>
          <Route path="/shop/:shopId" element={<ShopPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Karachi Steel")).toBeInTheDocument();
    });
    expect(screen.getByText("Verified")).toBeInTheDocument();
    expect(screen.getByText("Angle Iron")).toBeInTheDocument();
  });

  it("shows error state when shop is missing", async () => {
    fetchShopById.mockResolvedValue(null);
    fetchProductsByShopId.mockResolvedValue([]);

    render(
      <MemoryRouter initialEntries={["/shop/missing"]}>
        <Routes>
          <Route path="/shop/:shopId" element={<ShopPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Shop not found")).toBeInTheDocument();
    });
  });
});
