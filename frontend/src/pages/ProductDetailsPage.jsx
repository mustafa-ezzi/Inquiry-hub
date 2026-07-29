import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { siteContent } from "../data/inquiryData";
import { isProductVerified, mapProductRecord } from "../lib/mapProduct";
import { getPrimaryProductImageUrl } from "../lib/productMedia";
import Header from "../components/Header";
import Footer from "../components/Footer";
import BottomNav from "../components/BottomNav";

/* ── tiny helpers ─────────────────────────────────────────── */

function SectionTitle({ children }) {
    return (
        <h2 className="mb-4 flex items-center gap-2.5 text-lg font-extrabold text-[#111827]">
            <span className="inline-block h-[18px] w-1 rounded-full bg-[#0F6B36]" />
            {children}
        </h2>
    );
}

function InfoCard({ label, children }) {
    return (
        <div className="rounded-[14px] border border-slate-200 bg-white p-3.5">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                {label}
            </p>
            <div className="text-sm font-bold text-[#111827]">{children}</div>
        </div>
    );
}

/* ── skeleton / states ────────────────────────────────────── */

function LoadingState() {
    return (
        <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#0F6B36] border-t-transparent" />
                <p className="text-sm text-slate-500">Loading product…</p>
            </div>
        </div>
    );
}

function ErrorState({ message, onBack }) {
    return (
        <div className="flex flex-col items-center justify-center gap-5 py-24">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f0faf5]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="#0F6B36" strokeWidth="1.5" />
                    <path
                        d="M12 8v4M12 16h.01"
                        stroke="#0F6B36"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                    />
                </svg>
            </div>
            <p className="text-sm text-slate-600">{message || "Product not found"}</p>
            <button
                type="button"
                onClick={onBack}
                className="rounded-xl bg-[#0F6B36] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0d5f30]"
            >
                Back to Home
            </button>
        </div>
    );
}

/* ── main page ────────────────────────────────────────────── */

function ProductDetailsPage() {
    const { productId } = useParams();
    const navigate = useNavigate();
    const [activeBottomNavItem, setActiveBottomNavItem] = useState("home");
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchValue, setSearchValue] = useState("");

    const handleBottomNavSelect = useCallback(
        (itemId) => {
            setActiveBottomNavItem(itemId);
            if (itemId === "home") navigate("/");
            if (itemId === "inquiry") navigate("/inquiries");
            if (itemId === "profile") navigate("/vendor-waitlist");
            if (itemId === "categories") navigate("/");
        },
        [navigate]
    );

    useEffect(() => {
        const fetchProductDetails = async () => {
            try {
                const docRef = doc(db, "products", productId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setProduct(
                        mapProductRecord(
                            { id: docSnap.id, ...docSnap.data() },
                            docSnap.id
                        )
                    );
                    setError("");
                } else {
                    setProduct(null);
                    setError("Product not found");
                }
            } catch (err) {
                setProduct(null);
                setError("Failed to load product details");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProductDetails();
    }, [productId]);

    const header = (
        <Header
            brand={siteContent.brand}
            searchLabel={siteContent.header.searchLabel}
            searchValue={searchValue}
            onSearchChange={(event) => {
                const next = event.target.value;
                setSearchValue(next);
                if (next.trim()) {
                    navigate(`/?q=${encodeURIComponent(next.trim())}`);
                }
            }}
        />
    );
    const footer = (
        <Footer
            brand={siteContent.brand}
            sections={siteContent.footer.sections}
            socialLinks={siteContent.footer.socialLinks}
            note={siteContent.footer.note}
        />
    );
    const bottomNav = (
        <BottomNav
            items={siteContent.bottomNav}
            activeItemId={activeBottomNavItem}
            onItemSelect={handleBottomNavSelect}
        />
    );

    if (loading) {
        return (
            <>
                {header}
                <LoadingState />
                {footer}
                {bottomNav}
            </>
        );
    }

    if (error || !product) {
        return (
            <>
                {header}
                <ErrorState message={error} onBack={() => navigate("/")} />
                {footer}
                {bottomNav}
            </>
        );
    }

    const hasVariants =
        product.variants_color?.length > 0 || product.variants_size?.length > 0;
    const hasMeasurements = product.measurements?.length > 0;

    const primaryImageUrl = getPrimaryProductImageUrl(product);

    return (
        <div className="min-h-screen bg-background">
            {header}

            <main className="mx-auto max-w-5xl px-4 py-7 pb-24 md:px-6 md:py-9 lg:px-8">

                {/* ── Back button ── */}
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 inline-flex items-center gap-1.5 rounded-xl border border-transparent px-3 py-1.5 text-sm font-semibold text-[#0F6B36] transition-all hover:border-[#0F6B36]/20 hover:bg-[#f0faf5]"
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path
                            d="M10 13L5 8L10 3"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                    Back to Products
                </button>

                {/* ── Hero grid ── */}
                <div className="grid gap-6 md:grid-cols-2 md:gap-8">

                    {/* Image */}
                    <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-100">
                        {primaryImageUrl ? (
                        <img
                            src={primaryImageUrl}
                            alt={product.name || "Product"}
                            className="h-full w-full object-cover"
                            loading="eager"
                            decoding="async"
                        />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-slate-100">
                                <span className="text-4xl font-bold tracking-wide text-slate-300 sm:text-5xl">
                                    {(product.name || "?")
                                        .trim()
                                        .split(/\s+/)
                                        .filter(Boolean)
                                        .slice(0, 2)
                                        .map((w) => w[0])
                                        .join("")
                                        .toUpperCase() || "?"}
                                </span>
                            </div>
                        )}
                        {isProductVerified(product) ? (
                        <span className="absolute left-3.5 top-3.5 inline-flex items-center gap-1.5 rounded-full bg-[#0F6B36] px-3 py-1.5 shadow-sm">
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                <path
                                    d="M2 5.5L4 7.5L8 3"
                                    stroke="white"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                            <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-white">
                                Verified Listing
                            </span>
                        </span>
                        ) : null}
                    </div>

                    {/* Detail column */}
                    <div className="flex flex-col gap-5">

                        {/* Category + name */}
                        <div>
                            {product.category && (
                                <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#0F6B36]">
                                    {product.category}
                                </p>
                            )}
                            <h1 className="text-2xl font-extrabold leading-tight text-[#111827] sm:text-3xl">
                                {product.name}
                            </h1>
                            {product.description && (
                                <p className="mt-2.5 text-sm leading-7 text-[#6b7280]">
                                    {product.description}
                                </p>
                            )}
                        </div>

                        {/* Price card */}
                        <div className="rounded-2xl border border-[#0F6B36]/20 bg-[#f0faf5] p-4">
                            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.1em] text-[#0F6B36]/70">
                                Wholesale Price
                            </p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-extrabold text-[#0F6B36]">
                                    {product.price}
                                </span>
                                <span className="text-base font-semibold text-[#0F6B36]/70">
                                    {product.currency || "PKR"}
                                </span>
                            </div>
                            {product.price_unit && (
                                <p className="mt-1 text-xs text-[#6b7280]">
                                    per {product.price_unit}
                                </p>
                            )}
                        </div>

                        {/* Meta grid */}
                        <div className="grid grid-cols-2 gap-2.5">
                            {product.quantity && (
                                <InfoCard label="Quantity">
                                    {product.quantity}
                                    {product.quantity_unit && (
                                        <span className="ml-1.5 text-xs font-normal text-[#6b7280]">
                                            {product.quantity_unit}
                                        </span>
                                    )}
                                </InfoCard>
                            )}
                            {product.brand && product.brand !== "-" && (
                                <InfoCard label="Brand">{product.brand}</InfoCard>
                            )}
                            {product.status && (
                                <InfoCard label="Status">
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f0faf5] px-2.5 py-0.5 text-xs font-semibold text-[#0F6B36]">
                                        <span className="h-1.5 w-1.5 rounded-full bg-[#0F6B36]" />
                                        {product.status}
                                    </span>
                                </InfoCard>
                            )}
                            {product.created_at && (
                                <InfoCard label="Listed">
                                    {new Date(product.created_at.toDate()).toLocaleDateString(
                                        "en-PK",
                                        { month: "short", year: "numeric" }
                                    )}
                                </InfoCard>
                            )}
                        </div>

                        {/* CTA */}
                        <button
                            type="button"
                            onClick={() => navigate(`/inquiry/${productId}`)}
                            className="flex min-h-[50px] w-full items-center justify-center gap-2 rounded-xl bg-[#0F6B36] px-4 text-base font-bold text-white shadow-sm transition-all duration-200 hover:bg-[#0d5f30] hover:shadow-md active:scale-[0.98]"
                        >
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                <path
                                    d="M2 2h2.5l1.5 8h8L16 6H5.5"
                                    stroke="white"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <circle cx="8" cy="15" r="1.2" fill="white" />
                                <circle cx="13" cy="15" r="1.2" fill="white" />
                            </svg>
                            Send Inquiry
                        </button>
                    </div>
                </div>

                {/* ── Measurements ── */}
                {hasMeasurements && (
                    <section className="mt-10 border-t border-[#e9f5ee] pt-10">
                        <SectionTitle>Measurements</SectionTitle>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {product.measurements.map((m, idx) => (
                                <InfoCard key={idx} label={m.label}>
                                    {m.value}
                                    {m.unit && (
                                        <span className="ml-1.5 text-xs font-normal text-[#6b7280]">
                                            {m.unit}
                                        </span>
                                    )}
                                </InfoCard>
                            ))}
                        </div>
                    </section>
                )}

                {/* ── Additional Details ── */}
                <section className="mt-10 border-t border-[#e9f5ee] pt-10">
                    <SectionTitle>Product Details</SectionTitle>
                    <div className="grid gap-3 sm:grid-cols-2">
                        {product.unit_of_measure && (
                            <InfoCard label="Unit of Measure">{product.unit_of_measure}</InfoCard>
                        )}
                        {product.language && (
                            <InfoCard label="Language">{product.language}</InfoCard>
                        )}
                        {product.status && (
                            <InfoCard label="Status">
                                <span className="capitalize">{product.status}</span>
                            </InfoCard>
                        )}
                        {product.created_at && (
                            <InfoCard label="Created">
                                {new Date(product.created_at.toDate()).toLocaleDateString()}
                            </InfoCard>
                        )}
                    </div>
                </section>

                {/* ── Variants ── */}
                {hasVariants && (
                    <section className="mt-10 border-t border-[#e9f5ee] pt-10">
                        <SectionTitle>Variants</SectionTitle>
                        <div className="grid gap-6 md:grid-cols-2">
                            {product.variants_color?.length > 0 && (
                                <div>
                                    <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                                        Colors
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {product.variants_color.map((color, idx) => (
                                            <span
                                                key={idx}
                                                className="rounded-full border border-[#c0e8cc] bg-[#f7fdf9] px-3.5 py-1 text-xs font-semibold text-[#0F6B36]"
                                            >
                                                {color}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {product.variants_size?.length > 0 && (
                                <div>
                                    <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                                        Sizes
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {product.variants_size.map((size, idx) => (
                                            <span
                                                key={idx}
                                                className="rounded-full border border-[#c0e8cc] bg-[#f7fdf9] px-3.5 py-1 text-xs font-semibold text-[#0F6B36]"
                                            >
                                                {size}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                )}
            </main>

            {footer}
            {bottomNav}
        </div>
    );
}

export default ProductDetailsPage;