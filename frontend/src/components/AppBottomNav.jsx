import { memo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import BottomNav from "./BottomNav";
import { siteContent } from "../data/inquiryData";

/**
 * Shared buyer-site bottom nav (mobile).
 * @param {{
 *   onCategories?: () => void,
 *   activeItemId?: string,
 * }} props
 */
function AppBottomNav({ onCategories, activeItemId }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const resolvedActive =
    activeItemId ||
    (pathname.startsWith("/profile")
      ? "profile"
      : pathname.startsWith("/inquiries") || pathname.startsWith("/inquiry")
        ? "inquiry"
        : pathname === "/"
          ? "home"
          : "home");

  const onItemSelect = useCallback(
    (itemId) => {
      if (itemId === "home") {
        navigate("/");
        return;
      }
      if (itemId === "inquiry") {
        navigate("/inquiries");
        return;
      }
      if (itemId === "profile") {
        navigate("/profile");
        return;
      }
      if (itemId === "categories") {
        if (onCategories) {
          onCategories();
          return;
        }
        navigate("/?categories=1");
      }
    },
    [navigate, onCategories]
  );

  return (
    <BottomNav
      items={siteContent.bottomNav}
      activeItemId={resolvedActive}
      onItemSelect={onItemSelect}
    />
  );
}

export default memo(AppBottomNav);
