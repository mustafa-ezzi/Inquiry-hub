import { describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Footer from "../components/Footer";
import { SiteConfigProvider } from "../context/SiteConfigContext";
import { siteContent } from "../data/inquiryData";

vi.mock("../lib/firebase", () => ({ db: {} }));
vi.mock("../services/siteConfigService", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    fetchSiteConfig: vi.fn(async () => actual.defaultSiteConfig()),
  };
});

describe("Footer legal links", () => {
  it("links About and Privacy to real routes", async () => {
    const user = userEvent.setup();
    render(
      <SiteConfigProvider>
        <MemoryRouter initialEntries={["/"]}>
          <Footer
            brand={siteContent.brand}
            sections={siteContent.footer.sections}
            socialLinks={siteContent.footer.socialLinks}
            note={siteContent.footer.note}
          />
          <Routes>
            <Route path="/" element={<div>home</div>} />
            <Route path="/about" element={<div>About page body</div>} />
            <Route path="/privacy" element={<div>Privacy page body</div>} />
            <Route path="/terms" element={<div>Terms page body</div>} />
          </Routes>
        </MemoryRouter>
      </SiteConfigProvider>
    );

    await user.click(screen.getByRole("link", { name: "About Us" }));
    expect(screen.getByText("About page body")).toBeInTheDocument();
  });
});
