import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PwaUpdateScreen from "./components/PwaUpdateScreen";
import CookieConsentBanner from "./components/CookieConsentBanner";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/admin/AdminLayout";
import VendorLayout from "./components/vendor/VendorLayout";
import { AuthProvider } from "./context/AuthContext";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminReportsPage from "./pages/admin/AdminReportsPage";
import AdminShopsPage from "./pages/admin/AdminShopsPage";
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
          <Route path="shops" element={<AdminShopsPage />} />
          <Route path="reports" element={<AdminReportsPage />} />
        </Route>
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
