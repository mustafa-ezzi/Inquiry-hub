# Cursor Rules – Phase: Data Integration + Branding (Alibaba Style)

## Objective

Transform the existing skeleton UI into a **fully populated, branded homepage** using:

* Real data from JSON
* Green & white color palette
* Marketplace-style content (similar to Alibaba)

The UI must feel:

* Trustworthy
* Dense but clean
* Product-focused
* Ready for real users

---


## Color Palette Rules (STRICT)

Apply these colors globally:

* Primary Green: `#0F6B36`
* Background White: `#F9FAFC`

### Usage Guidelines:

* Buttons → Green background + white text
* CTA sections → Green highlight
* Links / accents → Green
* Background → White or very light gray
* Text:

  * Primary → Dark (`#111827`)
  * Secondary → Gray (`#6b7280`)

### Tailwind Mapping (Required):

Extend Tailwind config:

* `primary: #0F6B36`
* `background: #F9FAFC`

Use:

* `bg-primary`
* `text-primary`

---

## Data Integration Rules

Use `schema.json` as the ONLY data source.

### Must Implement:

* Map products dynamically
* Map categories dynamically
* Map vendors dynamically

### Strict Constraints:

* No hardcoded UI data
* No placeholder arrays
* Use `.map()` for all lists
* Add `key` for each item

---

## Content Replacement Rules

Replace ALL placeholder text with realistic marketplace content.

### Header

* Logo text: "PakHardware"
* Search placeholder: "Search for tools, electrical, plumbing items..."

---

### Hero Section

Headline:
"Find Trusted Hardware Suppliers Across Pakistan"

Subtext:
"Connect directly with verified vendors and get the best wholesale deals"

CTA Button:
"Post Your Inquiry"

---

### Categories

Use realistic Pakistani hardware categories:

* Tools
* Electrical
* Plumbing
* Machinery
* Paint & Chemicals
* Safety Equipment

---

### Products

Each product must show:

* Realistic product names:

  * "Heavy Duty Electric Drill Machine"
  * "Industrial Water Pump"
  * "PVC Pipe Fittings Set"
* Price:

  * Either number OR "Get Quote"
* Vendor name (from vendors data)

---

### Vendors

Vendor data must feel local:

Examples:

* "Al-Madina Hardware Store"
* "Karachi Tools Center"
* "Punjab Industrial Suppliers"

Include:

* Location (Karachi, Lahore, Faisalabad, etc.)
* Verified badge if true

---

### How It Works

Step 1:
"Search for products"

Step 2:
"Send inquiry to multiple vendors"

Step 3:
"Receive quotes and connect مباشرة"

---

### Why Choose Us

* Verified Vendors → "All suppliers are verified for trust"
* Direct Contact → "No middleman, deal directly"
* Best Prices → "Get competitive wholesale rates"

---

### CTA Section

Text:
"Are you a hardware supplier? Start selling today"

Button:
"Register as Vendor"

---

### Footer

Replace placeholders with:

Links:

* About Us
* Contact
* Privacy Policy

Add:

* Simple copyright
* Social icons (dummy allowed)

---

## UI Enhancement Rules (Alibaba Style)

### Layout Behavior:

* Slightly dense layout (not too spaced out)
* More products visible per screen
* Grid:

  * Mobile: 2 columns for products
  * Desktop: 4 columns

---

### Card Improvements:

ProductCard:

* Image height fixed
* Title max 2 lines (truncate)
* Button full width

VendorCard:

* Compact layout
* Highlight verified badge in green

---

### Visual Hierarchy:

* Section titles bold (`text-xl md:text-2xl font-semibold`)
* Subtext muted
* Buttons prominent (green)

---

## Interaction Rules

* Hover:

  * Cards → slight shadow increase
  * Buttons → darker green

* Buttons:

  * Always clickable
  * Minimum height: 44px

---

## Performance Rules

* Use `loading="lazy"` for images
* Avoid unnecessary state duplication
* Memoize if needed (only if required)

---

## Code Rules

* Do not rewrite existing structure
* Only enhance and extend
* Keep components reusable
* No large monolithic components

---

## Final Behavior Rule for Cursor

When updating code:

* Replace placeholders with real content
* Apply green-white branding consistently
* Use JSON data only
* Keep UI clean but slightly dense like Alibaba
* Do not overdesign or add unnecessary animations

---

## Output Expectation

Cursor should:

* Update existing components (not rebuild)
* Inject real data into UI
* Apply consistent color palette
* Replace all placeholder content
* Improve UI density and usability

---

End of Rules
