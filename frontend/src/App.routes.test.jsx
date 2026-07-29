import { describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { AppRoutes } from "./App";

vi.mock("./lib/firebase", () => ({ db: {} }));

vi.mock("./components/PwaUpdateScreen", () => ({
  default: () => null,
}));

vi.mock("./pages/HomePage", () => ({
  default: () => <div>Home route</div>,
}));
vi.mock("./pages/ProductDetailsPage", () => ({
  default: () => <div>Product route</div>,
}));
vi.mock("./pages/InquiryChatPage", () => ({
  default: () => <div>Inquiry route</div>,
}));
vi.mock("./pages/InquiriesListPage", () => ({
  default: () => <div>Inquiries list route</div>,
}));
vi.mock("./pages/ShopPage", () => ({
  default: () => <div>Shop route</div>,
}));
vi.mock("./pages/VendorWaitlistPage", () => ({
  default: () => <div>Vendor waitlist route</div>,
}));
vi.mock("./pages/LegalPage", () => ({
  default: () => <div>Legal route</div>,
}));

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>
  );
}

describe("App routes smoke", () => {
  it.each([
    ["/", "Home route"],
    ["/product/abc", "Product route"],
    ["/inquiry/abc", "Inquiry route"],
    ["/inquiries", "Inquiries list route"],
    ["/shop/shop-1", "Shop route"],
    ["/vendor-waitlist", "Vendor waitlist route"],
    ["/privacy", "Legal route"],
    ["/about", "Legal route"],
  ])("renders %s", (path, label) => {
    renderAt(path);
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});
