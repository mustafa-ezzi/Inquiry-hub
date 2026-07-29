import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PwaUpdateScreen from "./components/PwaUpdateScreen";
import HomePage from "./pages/HomePage";
import InquiriesListPage from "./pages/InquiriesListPage";
import InquiryChatPage from "./pages/InquiryChatPage";
import LegalPage from "./pages/LegalPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import ShopPage from "./pages/ShopPage";
import VendorWaitlistPage from "./pages/VendorWaitlistPage";

/** Route table without BrowserRouter — used by tests with MemoryRouter. */
export function AppRoutes() {
  return (
    <>
      <PwaUpdateScreen />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/product/:productId" element={<ProductDetailsPage />} />
        <Route path="/shop/:shopId" element={<ShopPage />} />
        <Route path="/inquiries" element={<InquiriesListPage />} />
        <Route path="/inquiry/:productId" element={<InquiryChatPage />} />
        <Route path="/vendor-waitlist" element={<VendorWaitlistPage />} />
        <Route path="/about" element={<LegalPage />} />
        <Route path="/contact" element={<LegalPage />} />
        <Route path="/privacy" element={<LegalPage />} />
        <Route path="/terms" element={<LegalPage />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
