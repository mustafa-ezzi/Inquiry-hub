import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PwaUpdateScreen from "./components/PwaUpdateScreen";
import CookieConsentBanner from "./components/CookieConsentBanner";
import ProtectedRoute from "./components/ProtectedRoute";
import ScrollToTop from "./components/ScrollToTop";
import AdminLayout from "./components/admin/AdminLayout";
import VendorLayout from "./components/vendor/VendorLayout";
import { AuthProvider } from "./context/AuthContext";
import { SiteConfigProvider } from "./context/SiteConfigContext";
import AdminCategoriesPage from "./pages/admin/AdminCategoriesPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminInquiriesPage from "./pages/admin/AdminInquiriesPage";
import AdminProductsPage from "./pages/admin/AdminProductsPage";
import AdminReportsPage from "./pages/admin/AdminReportsPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";
import AdminShopsPage from "./pages/admin/AdminShopsPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminWaitlistPage from "./pages/admin/AdminWaitlistPage";
import HomePage from "./pages/HomePage";
import InquiriesListPage from "./pages/InquiriesListPage";
import InquiryChatPage from "./pages/InquiryChatPage";
import LegalPage from "./pages/LegalPage";
import LoginPage from "./pages/LoginPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import ProfilePage from "./pages/ProfilePage";
import RegisterPage from "./pages/RegisterPage";
import ShopPage from "./pages/ShopPage";
import VendorDashboardPage from "./pages/vendor/VendorDashboardPage";
import VendorInboxPage from "./pages/vendor/VendorInboxPage";
import VendorProductsPage from "./pages/vendor/VendorProductsPage";
import VendorShopPage from "./pages/vendor/VendorShopPage";
import VendorThreadPage from "./pages/vendor/VendorThreadPage";
import VendorWaitlistPage from "./pages/VendorWaitlistPage";
import { ROLES } from "./lib/roles";

/** Route table without BrowserRouter — used by tests with MemoryRouter. */
export function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <PwaUpdateScreen />
      <CookieConsentBanner />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/product/:productId" element={<ProductDetailsPage />} />
        <Route path="/shop/:shopId" element={<ShopPage />} />
        <Route path="/inquiry/:productId" element={<InquiryChatPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/vendor-waitlist" element={<VendorWaitlistPage />} />
        <Route path="/about" element={<LegalPage />} />
        <Route path="/contact" element={<LegalPage />} />
        <Route path="/privacy" element={<LegalPage />} />
        <Route path="/terms" element={<LegalPage />} />

        <Route
          path="/inquiries"
          element={
            <ProtectedRoute>
              <InquiriesListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor"
          element={
            <ProtectedRoute roles={[ROLES.VENDOR, ROLES.ADMIN]}>
              <VendorLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<VendorDashboardPage />} />
          <Route path="inbox" element={<VendorInboxPage />} />
          <Route path="inbox/:inquiryId" element={<VendorThreadPage />} />
          <Route path="products" element={<VendorProductsPage />} />
          <Route path="shop" element={<VendorShopPage />} />
        </Route>
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={[ROLES.ADMIN]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="waitlist" element={<AdminWaitlistPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="shops" element={<AdminShopsPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="inquiries" element={<AdminInquiriesPage />} />
          <Route path="reports" element={<AdminReportsPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <SiteConfigProvider>
        <Router>
          <AppRoutes />
        </Router>
      </SiteConfigProvider>
    </AuthProvider>
  );
}

export default App;
