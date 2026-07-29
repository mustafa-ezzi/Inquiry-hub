import { describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { AppRoutes } from "./App";

vi.mock("./lib/firebase", () => ({ db: {}, auth: {} }));

vi.mock("./context/AuthContext", () => ({
  AuthProvider: ({ children }) => children,
  useAuth: () => ({
    user: null,
    profile: null,
    loading: false,
    isAuthenticated: false,
    role: null,
    shopIds: [],
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    refreshProfile: vi.fn(),
    saveContact: vi.fn(),
    linkShop: vi.fn(),
  }),
}));

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
vi.mock("./pages/LoginPage", () => ({
  default: () => <div>Login route</div>,
}));
vi.mock("./pages/RegisterPage", () => ({
  default: () => <div>Register route</div>,
}));
vi.mock("./pages/ProfilePage", () => ({
  default: () => <div>Profile route</div>,
}));
vi.mock("./pages/VendorPortalPlaceholderPage", () => ({
  default: () => <div>Vendor portal route</div>,
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
    ["/shop/shop-1", "Shop route"],
    ["/vendor-waitlist", "Vendor waitlist route"],
    ["/privacy", "Legal route"],
    ["/about", "Legal route"],
    ["/login", "Login route"],
    ["/register", "Register route"],
  ])("renders %s", (path, label) => {
    renderAt(path);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it("sends unauthenticated users from /inquiries to login", () => {
    renderAt("/inquiries");
    expect(screen.getByText("Login route")).toBeInTheDocument();
  });
});
