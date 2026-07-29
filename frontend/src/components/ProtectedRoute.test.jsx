import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import ProtectedRoute from "./ProtectedRoute";
import { ROLES } from "../lib/roles";

const authState = {
  loading: false,
  isAuthenticated: false,
  role: null,
};

vi.mock("../context/AuthContext", () => ({
  useAuth: () => authState,
}));

describe("ProtectedRoute", () => {
  beforeEach(() => {
    authState.loading = false;
    authState.isAuthenticated = false;
    authState.role = null;
  });

  it("redirects unauthenticated users to login", () => {
    render(
      <MemoryRouter initialEntries={["/inquiries"]}>
        <Routes>
          <Route
            path="/inquiries"
            element={
              <ProtectedRoute>
                <div>Secret inquiries</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login page</div>} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText("Login page")).toBeInTheDocument();
    expect(screen.queryByText("Secret inquiries")).not.toBeInTheDocument();
  });

  it("renders children when authenticated", () => {
    authState.isAuthenticated = true;
    authState.role = ROLES.BUYER;
    render(
      <MemoryRouter initialEntries={["/inquiries"]}>
        <Routes>
          <Route
            path="/inquiries"
            element={
              <ProtectedRoute>
                <div>Secret inquiries</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText("Secret inquiries")).toBeInTheDocument();
  });

  it("blocks buyers from vendor-only routes", () => {
    authState.isAuthenticated = true;
    authState.role = ROLES.BUYER;
    render(
      <MemoryRouter initialEntries={["/vendor"]}>
        <Routes>
          <Route path="/" element={<div>Home</div>} />
          <Route
            path="/vendor"
            element={
              <ProtectedRoute roles={[ROLES.VENDOR, ROLES.ADMIN]}>
                <div>Vendor portal</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.queryByText("Vendor portal")).not.toBeInTheDocument();
  });

  it("allows vendors into vendor routes", () => {
    authState.isAuthenticated = true;
    authState.role = ROLES.VENDOR;
    render(
      <MemoryRouter initialEntries={["/vendor"]}>
        <Routes>
          <Route
            path="/vendor"
            element={
              <ProtectedRoute roles={[ROLES.VENDOR, ROLES.ADMIN]}>
                <div>Vendor portal</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText("Vendor portal")).toBeInTheDocument();
  });
});
