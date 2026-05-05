# Codex Rules – Hardware B2B Marketplace (React App)

## Project Overview

Build a **modern, mobile-first B2B marketplace homepage** for Pakistani hardware vendors.

The platform allows users to:

* Search hardware products
* Send inquiries to vendors
* Connect directly with shopkeepers

UI should feel like:

* Alibaba (structure)
* ERP dashboard (clean & practical)
* Fast, no-nonsense UX

---

## Tech Stack

* React (with hooks)
* Tailwind CSS (for styling)
* JSON-based local data (mock API)
* Component-based architecture

---

## Global UI/UX Rules

### Design Principles

* Clean, minimal, professional
* No visual clutter
* Focus on usability over decoration
* Mobile-first always

### Layout

* Max width: `1280px`
* Centered content
* Use grid system:

  * Mobile: 1 column
  * Tablet: 2 columns
  * Desktop: 3–4 columns

### Spacing

* Section padding: `py-10 md:py-16`
* Container padding: `px-4 md:px-8`
* Gap: `gap-4 md:gap-6`

### Colors

* Background: `#f9fafb` (light gray)
* Primary: `#2563eb` (blue)
* Text: `#111827` (dark)
* Subtext: `#6b7280`

### Components Style

* Rounded corners: `rounded-2xl`
* Shadows: `shadow-sm hover:shadow-md`
* Transitions: `transition-all duration-200`

---

## Data Handling Rules

* All data must come from a local JSON file

* Structure:

  * products[]
  * categories[]
  * vendors[]

* No hardcoding UI data

* Use `.map()` to render lists

---

## Component Structure

Create reusable components:

* `Header`
* `SearchBar`
* `HeroSection`
* `CategoryCard`
* `ProductCard`
* `VendorCard`
* `HowItWorks`
* `WhyChooseUs`
* `CTASection`
* `Footer`
* `BottomNav`

---

## Section-by-Section Rules

### 1. Header

* Left: Logo text
* Center: Search bar
* Right: Icons (login, cart optional)
* Sticky top
* Height: `h-16`

---

### 2. Hero Section

* Headline (bold, large)
* Subtext (smaller, muted)
* Large search bar
* CTA button: "Post Inquiry"

---

### 3. Categories Section

* Horizontal scroll on mobile
* Grid on desktop
* Each item:

  * Icon
  * Name

---

### 4. Featured Products

Each product card must include:

* Image (object-cover)
* Product name
* Price OR "Get Quote"
* Vendor name
* Button: "Send Inquiry"

Card rules:

* Hover effect
* Clickable

---

### 5. Top Vendors

Vendor card must include:

* Shop name
* Location
* Verified badge
* Button: "View Shop"

---

### 6. How It Works

3-step layout:

1. Search Product
2. Send Inquiry
3. Connect with Vendor

Use icons + short text

---

### 7. Why Choose Us

Show 3 key benefits:

* Verified Vendors
* Direct Contact
* Best Prices

Use icon + title + short description

---

### 8. CTA Section

* Text: "Are you a seller? Join now"
* Button: "Register as Vendor"
* Center aligned
* Highlighted background

---

### 9. Footer

Include:

* About
* Contact
* Privacy
* Social icons

---

### 10. Mobile Bottom Navigation

Sticky bottom bar with:

* Home
* Categories
* Inquiry
* Profile

Icons + labels

---

## Search Functionality Rules

* Filter products from JSON
* Case-insensitive search
* Instant filtering (no API delay)

---

## Performance Rules

* Lazy load images
* Avoid unnecessary re-renders
* Use keys properly in lists

---

## Code Quality Rules

* Use functional components only
* Use hooks (useState, useEffect)
* Keep components small & reusable
* No inline large logic blocks

---

## Accessibility Rules

* Buttons must be clickable (min height 44px)
* Use alt text for images
* Maintain contrast

---

## UX Rules (Important)

* User should:

  * Find product in < 3 seconds
  * Send inquiry in 1 click
  * Never feel lost

* Avoid:

  * Complex filters
  * Too many colors
  * Heavy animations

---

## Final Behavior Rule for Codex

When generating code:

* Always follow mobile-first approach
* Always use Tailwind classes
* Always use reusable components
* Never overcomplicate UI
* Prioritize speed + clarity over aesthetics

---

## Output Expectation

Codex should generate:

* Clean React components
* Tailwind styled UI
* Proper folder structure
* JSON-driven rendering

---

End of Rules

  