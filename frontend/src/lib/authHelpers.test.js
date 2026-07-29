import { describe, expect, it, vi } from "vitest";

vi.mock("./firebase", () => ({
  auth: {},
  db: {},
}));

const { authErrorMessage } = await import("../services/authService");
const { isValidRole, ROLES } = await import("./roles");

describe("roles", () => {
  it("validates known roles", () => {
    expect(isValidRole(ROLES.BUYER)).toBe(true);
    expect(isValidRole("hacker")).toBe(false);
  });
});

describe("authErrorMessage", () => {
  it("maps firebase codes to readable text", () => {
    expect(authErrorMessage({ code: "auth/email-already-in-use" })).toMatch(
      /already exists/i
    );
    expect(authErrorMessage({ code: "auth/invalid-credential" })).toMatch(
      /Incorrect/i
    );
    expect(
      authErrorMessage({
        code: "auth/internal-error",
        message: "CONFIGURATION_NOT_FOUND",
      })
    ).toMatch(/Google and\/or Email\/Password/i);
    expect(authErrorMessage({ message: "boom" })).toBe("boom");
  });
});
