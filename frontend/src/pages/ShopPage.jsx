import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import Footer from "../components/Footer";
import Header from "../components/Header";
import ProductGrid from "../components/ProductGrid";
import { siteContent } from "../data/inquiryData";
import { fetchProductsByShopId } from "../services/productService";
import { fetchShopById } from "../services/shopsService";

function ShopPage() {
  const { shopId } = useParams();
  const navigate = useNavigate();
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeBottomNavItem, setActiveBottomNavItem] = useState("home");

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [shopData, shopProducts] = await Promise.all([
          fetchShopById(shopId),
          fetchProductsByShopId(shopId),
        ]);
        if (!mounted) return;
        if (!shopData) {
          setError("Shop not found");
          setShop(null);
          setProducts([]);
        } else {
          setShop(shopData);
          setProducts(shopProducts);
        }
      } catch (err) {
        console.error(err);
        if (!mounted) return;
        setError("Could not load this shop. Check your connection and try again.");
        setShop(null);
        setProducts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [shopId]);

  const handleBottomNavSelect = useCallback(
    (itemId) => {
      setActiveBottomNavItem(itemId);
      if (itemId === "home") navigate("/");
      if (itemId === "inquiry") navigate("/inquiries");
      if (itemId === "profile") navigate("/vendor-waitlist");
    },
    [navigate]
  );

  const handleInquiry = useCallback(
    (product) => {
      navigate(`/inquiry/${product.id}`);
    },
    [navigate]
  );

  return (
    <div className="min-h-screen bg-background text-slate-900">
      <Header
        brand={siteContent.brand}
        searchLabel={siteContent.header.searchLabel}
        searchValue=""
        onSearchChange={(e) => {
          const q = e.target.value;
          if (q) navigate(`/?q=${encodeURIComponent(q)}`);
        }}
      />

      <main className="mx-auto max-w-5xl px-4 py-7 pb-24 md:px-6 md:py-9 lg:px-8">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[#0F6B36] hover:underline"
        >
          ← Back to home
        </Link>

        {loading ? (
          <div className="flex flex-col items-center gap-3 py-24">
            <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#0F6B36] border-t-transparent" />
            <p className="text-sm text-slate-500">Loading shop…</p>
          </div>
        ) : error || !shop ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
            <p className="text-sm text-slate-600">{error || "Shop not found"}</p>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="mt-5 rounded-xl bg-[#0F6B36] px-6 py-2.5 text-sm font-semibold text-white"
            >
              Back to Home
            </button>
          </div>
        ) : (
          <>
            <header className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold text-[#111827]">
                    {shop.shopName}
                  </h1>
                  <p className="mt-1 text-sm text-slate-500">{shop.location}</p>
                </div>
                {shop.isVerified ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#0F6B36]/20 bg-[#f0faf5] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#0F6B36]">
                    {shop.verifiedLabel || "Verified"}
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                    Unverified
                  </span>
                )}
              </div>
            </header>

            <h2 className="mb-4 text-lg font-bold text-[#111827]">
              Products from this shop
            </h2>

            {products.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500 shadow-sm">
                No products listed for this shop yet.
              </div>
            ) : (
              <ProductGrid items={products} onInquiry={handleInquiry} />
            )}
          </>
        )}
      </main>

      <Footer
        brand={siteContent.brand}
        sections={siteContent.footer.sections}
        socialLinks={siteContent.footer.socialLinks}
        note={siteContent.footer.note}
      />
      <BottomNav
        items={siteContent.bottomNav}
        activeItemId={activeBottomNavItem}
        onItemSelect={handleBottomNavSelect}
      />
    </div>
  );
}

export default ShopPage;
