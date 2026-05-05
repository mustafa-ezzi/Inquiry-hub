# Cursor Rules – Advanced UI (Alibaba-Level Enhancements)

## Objective

Upgrade the homepage into a **high-utility B2B marketplace UI** with:

* Sidebar categories
* Sticky filters
* Dense product grid
* Fast browsing UX

The design must feel:

* Efficient
* Information-rich
* Fast to scan
* Built for buyers, not designers

colors used will be #0F6B36 and #FFFFFF
---

## 1. Layout Upgrade (CRITICAL)

Replace simple vertical layout with:

* Left Sidebar (Categories)
* Main Content (Products + Filters)

### Structure:

* Desktop:

  * Sidebar: 20–25% width
  * Main content: 75–80%

* Mobile:

  * Sidebar becomes horizontal scroll OR drawer

### Implementation:

* Use `flex` layout
* Sidebar must be visible on desktop at all times

---

## 2. Sidebar Categories (LIKE ALIBABA)

### Behavior:

* Vertical list of categories
* Always visible (desktop)
* Sticky while scrolling

### UI:

Each category item:

* Icon (optional)
* Name
* Hover effect → background highlight
* Active state → green highlight

### Example Categories:

* Tools
* Electrical
* Plumbing
* Machinery
* Paint & Chemicals
* Safety Equipment

### Rules:

* Use `position: sticky`
* Top offset: same as header height
* Add scroll if overflow

---

## 3. Sticky Filter Bar (HIGH VALUE)

Place filter bar above products.

### Behavior:

* Sticky when scrolling
* Always accessible

### Filters to include:

* Search input (reuse SearchBar)
* Category dropdown
* Location filter (Karachi, Lahore, etc.)
* Price filter (optional simple range)

### UI:

* Horizontal layout
* Light background
* Subtle shadow

### Rules:

* Keep filters SIMPLE (no complex logic)
* Focus on quick filtering

---

## 4. Product Grid Optimization

### Grid Rules:

* Mobile: 2 columns
* Tablet: 3 columns
* Desktop: 4–5 columns

### Behavior:

* Dense layout (less empty space)
* More products visible

### ProductCard Enhancements:

* Image fixed height
* Title max 2 lines (truncate)
* Vendor name smaller
* CTA button full width

### Add:

* “Verified” tag (if vendor verified)
* Optional “Popular” badge

---

## 5. Quick Inquiry UX (VERY IMPORTANT)

Make inquiry super easy.

### Add:

* Button: "Send Inquiry" on every product
* Optional:

  * Quick modal OR
  * Simple alert placeholder

### Rule:

User should NOT navigate away to send inquiry.

---

## 6. Vendor Trust Signals

Boost credibility.

### Add to ProductCard:

* Vendor name
* Verified badge (green)
* Location

### Add to VendorCard:

* Highlight verified vendors
* Slight border or badge

---

## 7. Mobile UX Upgrade 📱

### Replace Sidebar with:

Option A:

* Horizontal scroll categories

Option B:

* Slide-in drawer (recommended)

### Sticky Bottom Nav (already exists):

Enhance:

* Add active state (green)
* Icons + labels

---

## 8. Section Density (Alibaba Style)

Reduce excessive spacing.

### Rules:

* Reduce vertical gaps slightly
* Fit more content in viewport
* Avoid large empty sections

---

## 9. Hover + Interaction

### Add:

* Product card → lift effect
* Button → darker green on hover
* Category → highlight on hover

### Keep:

* Fast transitions (`duration-200`)
* No heavy animations

---

## 10. Performance Considerations

* Lazy load product images
* Avoid unnecessary filters re-renders
* Keep filtering logic simple

---

## 11. Code Structure Updates

### New Components to Create:

* `SidebarCategories`
* `FilterBar`
* `ProductGrid`

### Rules:

* Do not mix logic in UI
* Keep filtering logic in parent component
* Pass props cleanly

---

## 12. Final Behavior Rule for Cursor

When implementing:

* Do NOT redesign everything
* Extend existing layout
* Focus on usability over visuals
* Keep UI dense but clean
* Maintain green-white branding

---

## Output Expectation

Cursor should:

* Add sidebar categories (desktop)
* Add sticky filter bar
* Improve product grid density
* Enhance inquiry UX
* Maintain performance and responsiveness

---

End of Rules
