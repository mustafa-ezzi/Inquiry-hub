import { memo } from "react";
import SearchBar from "./SearchBar";

function FilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  categoryValue,
  onCategoryChange,
  categories,
  locationValue,
  onLocationChange,
  locations,
  priceValue,
  onPriceChange,
}) {
  return (
    <div className="sticky top-20 z-20 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm md:p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <SearchBar
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={onSearchChange}
          compact
          className="w-full lg:flex-1"
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:w-auto lg:min-w-[520px]">
          <label className="flex min-h-[44px] items-center rounded-2xl border border-slate-200 bg-background px-3 shadow-sm transition-all duration-200 hover:border-secondary/25 hover:bg-white hover:shadow-md focus-within:border-secondary/25">
            <select
              value={categoryValue}
              onChange={onCategoryChange}
              className="w-full bg-transparent text-sm text-[#111827] outline-none"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={String(category.id)}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex min-h-[44px] items-center rounded-2xl border border-slate-200 bg-background px-3 shadow-sm transition-all duration-200 hover:border-secondary/25 hover:bg-white hover:shadow-md focus-within:border-secondary/25">
            <select
              value={locationValue}
              onChange={onLocationChange}
              className="w-full bg-transparent text-sm text-[#111827] outline-none"
            >
              <option value="">All Locations</option>
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </label>

          <label className="flex min-h-[44px] items-center rounded-2xl border border-slate-200 bg-background px-3 shadow-sm transition-all duration-200 hover:border-secondary/25 hover:bg-white hover:shadow-md focus-within:border-secondary/25">
            <select
              value={priceValue}
              onChange={onPriceChange}
              className="w-full bg-transparent text-sm text-[#111827] outline-none"
            >
              <option value="">All Prices</option>
              <option value="quote">Get Quote</option>
              <option value="under-5000">Under Rs 5,000</option>
              <option value="5000-20000">Rs 5,000 - Rs 20,000</option>
              <option value="over-20000">Over Rs 20,000</option>
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}

export default memo(FilterBar);
