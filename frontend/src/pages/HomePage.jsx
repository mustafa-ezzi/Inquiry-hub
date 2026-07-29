import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import Footer from "../components/Footer";
import FilterBar from "../components/FilterBar";
import Header from "../components/Header";
import MobileCategoryDrawer from "../components/MobileCategoryDrawer";
import SidebarCategories from "../components/SidebarCategories";
import {
  fallbackProducts,
  siteContent,
} from "../data/inquiryData";
import { productMatchesCategory } from "../lib/productCategory";
import { fetchCategories } from "../services/categoriesService";
import { fetchProducts } from "../services/productService";
import { fetchShops } from "../services/shopsService";
import CTASection from "../sections/CTASection";
import FeaturedProductsSection from "../sections/FeaturedProductsSection";
import HeroSection from "../sections/HeroSection";
import HowItWorks from "../sections/HowItWorks";
import TopVendorsSection from "../sections/TopVendorsSection";
import WhyChooseUs from "../sections/WhyChooseUs";

function HomePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [locationFilter, setLocationFilter] = useState("");
  const [priceFilter, setPriceFilter] = useState("");
  const [activeBottomNavItem, setActiveBottomNavItem] = useState("home");
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productLoadError, setProductLoadError] = useState("");
  const sections = siteContent.sections;
  const [lastDoc, setLastDoc] = useState(null);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [shops, setShops] = useState([]);
  const [isLoadingShops, setIsLoadingShops] = useState(true);
  const [shopsError, setShopsError] = useState("");
  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");

  const loadCategories = useCallback(async () => {
    setCategoriesError("");
    try {
      const list = await fetchCategories();
      setCategories(list);
    } catch (err) {
      console.error(err);
      setCategories([]);
      setCategoriesError("Could not load categories.");
    } finally {
      setIsLoadingCategories(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const loadShops = useCallback(async () => {
    setShopsError("");
    try {
      const list = await fetchShops();
      setShops(list);
    } catch (err) {
      console.error(err);
      setShops([]);
      setShopsError(
        "Could not load shops. Check your connection and Firestore rules."
      );
    } finally {
      setIsLoadingShops(false);
    }
  }, []);

  useEffect(() => {
    loadShops();
  }, [loadShops]);

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      setProductLoadError("");
      try {
        const productItems = await fetchProducts();

        if (!isMounted) return;

        setProducts(productItems.products);
        setLastDoc(productItems.lastDoc);
        setHasMore(productItems.products.length === 20);
      } catch (error) {
        console.error(error);
        if (!isMounted) return;

        setProducts(fallbackProducts);
        setHasMore(false);
        setProductLoadError(
          "Could not load live products. Showing sample catalog offline."
        );
      } finally {
        if (isMounted) setIsLoadingProducts(false);
      }
    };

    

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);


  const loadMoreProducts = async () => {
      if (!lastDoc || isFetchingMore || !hasMore) return;

      setIsFetchingMore(true);

      try {
        const res = await fetchProducts(lastDoc);

        setProducts((prev) => [...prev, ...res.products]);
        setLastDoc(res.lastDoc);

        if (res.products.length < 20) {
          setHasMore(false); // no more data
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsFetchingMore(false);
      }
    };

  const observerRef = useRef();

  useEffect(() => {
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreProducts();
        }
      },
      { threshold: 1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) observer.unobserve(observerRef.current);
    };
  }, [lastDoc, hasMore, isFetchingMore]);

  const heroData = useMemo(
    () => ({
      ...siteContent.hero,
      statCards: siteContent.hero.statCards.map((card) => {
        if (card.id === "stat-1") {
          return { ...card, value: String(categories.length) };
        }

        if (card.id === "stat-2") {
          return { ...card, value: String(products.length) };
        }

        if (card.id === "stat-3") {
          return { ...card, value: String(shops.length) };
        }

        return card;
      }),
    }),
    [products.length, shops.length, categories.length]
  );

  const locationOptions = useMemo(
    () =>
      [
        ...new Set(
          products
            .map((p) => p.location)
            .filter((loc) => loc && loc.trim() !== "")
        ),
      ],
    [products]
  );

  const normalizedQuery = useMemo(
    () => searchQuery.trim().toLowerCase(),
    [searchQuery]
  );

  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];

    return products.filter((product) => {
      const name = product.name || "";
      const location = product.location || product.vendorLocation || "";
      const price = product.numericPrice;

      return (
        name.toLowerCase().includes(normalizedQuery) &&
        (!activeCategoryId ||
          productMatchesCategory(product, activeCategoryId, categories)) &&
        (!locationFilter || location === locationFilter) &&
        (() => {
          if (!priceFilter) return true;

          if (priceFilter === "quote") return product.isQuoteOnly;

          if (!price) return false;

          if (priceFilter === "under-5000") return price < 5000;
          if (priceFilter === "5000-20000")
            return price >= 5000 && price <= 20000;
          if (priceFilter === "over-20000") return price > 20000;

          return true;
        })()
      );
    });
  }, [
    products,
    normalizedQuery,
    activeCategoryId,
    locationFilter,
    priceFilter,
    categories,
  ]);

  const handleSearchChange = useCallback((event) => {
    setSearchQuery(event.target.value);
  }, []);

  const handleCategorySelect = useCallback((categoryId) => {
    setActiveCategoryId(categoryId);
    setActiveBottomNavItem(categoryId ? "categories" : "home");
  }, []);

  const handleMobileDrawerChange = useCallback((isOpen) => {
    setActiveBottomNavItem(isOpen ? "categories" : "home");
  }, []);

  const handleCategoryFilterChange = useCallback((event) => {
    const nextValue = event.target.value;
    setActiveCategoryId(nextValue === "" ? null : nextValue);
  }, []);

  const handleLocationChange = useCallback((event) => {
    setLocationFilter(event.target.value);
  }, []);

  const handlePriceChange = useCallback((event) => {
    setPriceFilter(event.target.value);
  }, []);

  const handleInquiry = useCallback(
    (product) => {
      navigate(`/inquiry/${product.id}`);
    },
    [navigate]
  );

  const handleBottomNavSelect = useCallback(
    (itemId) => {
      setActiveBottomNavItem(itemId);
      if (itemId === "home") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      if (itemId === "inquiry") navigate("/inquiries");
      if (itemId === "profile") navigate("/vendor-waitlist");
      if (itemId === "categories") {
        document
          .getElementById("top")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
    [navigate]
  );

  const filterBar = useMemo(
    () => (
      <FilterBar
        searchValue={searchQuery}
        onSearchChange={handleSearchChange}
        searchPlaceholder={siteContent.header.searchLabel}
        categoryValue={activeCategoryId ? String(activeCategoryId) : ""}
        onCategoryChange={handleCategoryFilterChange}
        categories={categories}
        locationValue={locationFilter}
        onLocationChange={handleLocationChange}
        locations={locationOptions}
        priceValue={priceFilter}
        onPriceChange={handlePriceChange}
      />
    ),
    [
      activeCategoryId,
      handleCategoryFilterChange,
      handleLocationChange,
      handlePriceChange,
      handleSearchChange,
      locationFilter,
      locationOptions,
      priceFilter,
      searchQuery,
      categories,
    ]
  );

  return (
    <div id="top" className="min-h-screen bg-background text-slate-900">
      <Header
        brand={siteContent.brand}
        searchLabel={siteContent.header.searchLabel}
        searchValue={searchQuery}
        onSearchChange={handleSearchChange}
      />

      <main className="pb-24 md:pb-0">
        <HeroSection
          {...heroData}
          searchValue={searchQuery}
          onSearchChange={handleSearchChange}
        />
        <div className="mx-auto flex max-w-container flex-col gap-6 px-4 md:px-8 lg:flex-row lg:items-start lg:gap-5">
          <SidebarCategories
            title={sections.categories.title}
            description={
              categoriesError
                ? categoriesError
                : sections.categories.description
            }
            items={categories}
            isLoading={isLoadingCategories}
            activeCategoryId={activeCategoryId}
            onSelectCategory={handleCategorySelect}
          />

          <div className="min-w-0 flex-1 lg:w-[77%]">
            <div className="mb-3 lg:hidden">
              <MobileCategoryDrawer
                title={sections.categories.title}
                description={sections.categories.description}
                items={categories}
                isLoading={isLoadingCategories}
                activeCategoryId={activeCategoryId}
                onSelectCategory={handleCategorySelect}
                onOpenChange={handleMobileDrawerChange}
              />
            </div>
            <FeaturedProductsSection
              title={sections.products.title}
              description={sections.products.description}
              emptyStateTitle={sections.products.emptyStateTitle}
              emptyStateDescription={sections.products.emptyStateDescription}
              isLoading={isLoadingProducts}
              errorMessage={productLoadError}
              filterBar={filterBar}
              onInquiry={handleInquiry}
              items={filteredProducts}
              loaderRef={observerRef}
              isFetchingMore={isFetchingMore}
              hasMore={hasMore}
            />
            <TopVendorsSection
              title={sections.vendors.title}
              description={sections.vendors.description}
              items={shops}
              isLoading={isLoadingShops}
              errorMessage={shopsError}
              onShopsRefresh={loadShops}
            />
            <HowItWorks
              title={sections.howItWorks.title}
              description={sections.howItWorks.description}
              items={sections.howItWorks.items}
            />
            <WhyChooseUs
              title={sections.whyChooseUs.title}
              description={sections.whyChooseUs.description}
              items={sections.whyChooseUs.items}
            />
            <CTASection
              title={sections.cta.title}
              description={sections.cta.description}
              actionLabel={sections.cta.actionLabel}
            />
          </div>
        </div>
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

export default HomePage;
