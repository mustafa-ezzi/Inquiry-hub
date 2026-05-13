import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PwaUpdateScreen from "./components/PwaUpdateScreen";
import HomePage from "./pages/HomePage";
import InquiriesListPage from "./pages/InquiriesListPage";
import InquiryChatPage from "./pages/InquiryChatPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";

function App() {
  return (
    <Router>
      <PwaUpdateScreen />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/product/:productId" element={<ProductDetailsPage />} />
        <Route path="/inquiries" element={<InquiriesListPage />} />
        <Route path="/inquiry/:productId" element={<InquiryChatPage />} />
      </Routes>
    </Router>
  );
}

export default App;
