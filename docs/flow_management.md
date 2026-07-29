# Flow management — product, inquiries, vendors, and go-to-market

This document captures research-and-design (RnD) thinking for **launch**, **inquiry flows**, **split customer vs vendor operations**, **go-to-market (GTM)**, **multi-tenant direction**, **alignment with a metal-industry marketplace vision**, and **pricing / revenue** ideas. It is a living strategy note, not a legal or financial commitment.

---

## 1. How the product can be launched (RnD)

### 1.1 Phased launch (recommended)

| Phase | Goal | Scope (example) | Success signals |
|-------|------|------------------|-----------------|
| **Alpha** | Prove inquiry → response loop | Hand-picked vendors + single region/category | Time-to-first-reply, qualitative feedback |
| **Beta** | Prove repeat usage + trust | More vendors, basic moderation/dispute path | Return visits, completed conversations |
| **GA** | Scale acquisition | Full categories, stable payments/compliance story | GMV proxy, vendor retention, NPS |

### 1.2 Technical readiness checklist (directional)

- **Discovery**: search, categories, vendor/shop pages, product detail, mobile-friendly UX (PWA helps field buyers).
- **Trust**: verified shops, clear “who am I talking to,” message history, optional SLAs for response time.
- **Operations**: vendor onboarding, content moderation, support channel, incident response.
- **Data**: product and shop sources of truth (e.g. Firestore), inquiry API or equivalent for threads, analytics events.
- **Compliance**: privacy policy, consent for phone/contact, regional rules for B2B quotes and advertising.

### 1.3 Launch risks to plan for

- **Cold start**: few vendors → empty search; mitigate with curated inventory and “request a vendor” flows.
- **Quality**: duplicate listings, wrong specs (critical in metals: grades, dimensions, certifications).
- **Liquidity**: inquiries without replies; consider nudges, vendor dashboards, and fallback to platform-assisted routing.

---

## 2. How an inquiry works — customer end vs vendor end

### 2.1 Customer journey (conceptual)

1. **Discover** — Browse categories, filters (location, price band), product cards, shop context.
2. **Intent** — “Send inquiry” / “Get quote” on a product (or RFQ-style form later).
3. **Identity & contact** — Name, phone, first message (your app already supports onboarding + thread).
4. **Conversation** — Thread with buyer/vendor roles, polling or realtime updates, notifications (email/SMS/WhatsApp later).
5. **Outcome** — Quote received, order placed off-platform or in-app (future), or archived as “no deal.”

### 2.2 Vendor journey (conceptual)

1. **Onboarding** — Create shop, verification, payout/tax info (when monetization requires it).
2. **Catalog** — SKUs, specs, MOQ, lead times, certifications (especially important for metals).
3. **Lead inbox** — Unified view of inquiries across products; filters by status, product, buyer type.
4. **Response** — Reply in thread, attach revised quote, suggest alternates (grades/sizes).
5. **Conversion** — Mark won/lost, reasons (price, lead time, spec mismatch) for analytics.

### 2.3 What to build next (gap analysis vs a full marketplace)

| Capability | Customer value | Vendor value |
|------------|----------------|--------------|
| Inquiry threads | High | Medium (needs inbox) |
| Vendor-specific inbox + notifications | Medium | **High** |
| RFQ / multi-line basket | High | High |
| Quote PDF + validity | High | High |
| Payments / escrow (optional) | High later | High later |
| Ratings & dispute | Medium | Medium |

Your current direction (shops, categories, product detail, **buyer-side chat + “my inquiries”**) is a **solid wedge** for the customer side; the **vendor-side mirror** (dashboard, leads, SLA) is the usual next pillar for multi-vendor scale.

---

## 3. Managing customer-side vs vendor-side **separately**

Separation is both **product** (different apps or areas) and **operations** (different playbooks).

### 3.1 Product separation

- **Customer app / surface**: discovery, inquiries, order/quote history, help, refunds (if applicable).
- **Vendor app / surface**: catalog, pricing rules, lead queue, analytics, billing for subscriptions/commissions.
- **Shared services**: auth (with roles), messaging, notifications, search index, media, audit log.
- **Platform admin**: moderation, vendor approval, fraud, feature flags, global config.

Implementation patterns: **role-based access (RBAC)**, separate routes/layouts (`/vendor/*` vs `/`), optional **separate deployable** vendor portal later without blocking MVP.

### 3.2 Operational separation

| Area | Customer ops | Vendor ops |
|------|--------------|------------|
| Support | “Where is my quote?” “How do I contact?” | “How do I list?” “Why was my shop suspended?” |
| SLAs | First response expectations | Listing quality, response rate KPIs |
| Content | Buyer safety, harassment | Spec accuracy, counterfeit certs |
| Growth | SEO, demand campaigns | Supply onboarding, enablement webinars |

### 3.3 Metrics (examples)

- **Customer**: activation (first inquiry), reply rate, time-to-first-vendor-message, repeat inquiry rate.
- **Vendor**: listings live, inquiry volume, win rate, median response time, churn, ARPA.

---

## 4. Go-to-market (GTM) strategies

### 4.1 Supply-first vs demand-first

- **Metals B2B** often benefits from **supply-first** in a geography: lock in credible mills/stockists/distributors, then run targeted demand (procurement teams, fabricators).
- **Demand-first** works if you have a strong SEO/content moat or existing audience.

### 4.2 Concrete GTM tactics

- **Vertical focus**: one sub-vertical first (e.g. stainless sheet, aluminum extrusions, scrap) to deepen taxonomy and trust.
- **Geographic cluster**: one city/industrial belt → logistics and relationship density.
- **Partnerships**: industry associations, trade fairs, ERP/marketplace integrators.
- **Content**: spec guides, comparison tables, compliance explainers (REACH, RoHS where relevant) → SEO + credibility.
- **Referrals**: vendor brings buyers; buyers bookmark shops; dual-sided incentives (careful with subsidy economics).

### 4.3 Positioning one-liner (example)

> “The fastest way for metal buyers to get verified quotes from multiple vendors — and for vendors to turn inbound into revenue.”

---

## 5. Is the app going in the right direction for **multiple vendors and customers**?

**Short answer: yes, as an MVP wedge — with clear next steps for true multi-sided scale.**

**Already aligned**

- Multi-vendor data model direction (shops, categories, products from services rather than one static catalog).
- Buyer inquiry entry point tied to **product** and **shop context** (scales with more vendors).
- PWA and mobile UX suit on-site buyers and field sales.

**What multi-vendor maturity usually requires next**

- **Vendor identity**: each listing tied to shop; vendor users belonging to shops.
- **Vendor console**: leads, threads, team members, maybe assignment rules.
- **Search ranking**: fairness + quality signals (response rate, reviews, fulfillment).
- **Governance**: duplicate detection, spec templates by material type, enforcement.

Without vendor tooling and trust signals, you can still host many vendors technically, but **liquidity and retention** will cap growth.

---

## 6. Vision check: hosting the **metal industry**

**Fit**

- **Inquiry-led buying** matches how much of B2B metals works (specs, MOQ, lead time, mill certs).
- **Geography and logistics** matter; your filters and shop metadata support that narrative.

**Gaps to close over time (industry-specific)**

- **Taxonomy depth**: grades, finishes, tolerances, standards (ASTM, EN, JIS, etc.) — structured fields, not only free text.
- **Documents**: mill test reports (MTRs), datasheets, certificates — upload + access control.
- **Logistics**: weight/dimensions for freight estimates, incoterms, warehouse vs ex-mill.
- **Credit & terms**: net-30, LC — often outside v1 but shapes trust and vendor tiering.

**Conclusion**: the path (marketplace discovery + structured inquiries) is **consistent** with a metal-industry platform vision; depth of **spec + document + vendor workflow** is what turns a generic marketplace into a **vertical winner**.

---

## 7. Pricing checks and revenue ideas

*Not financial advice — use for internal brainstorming and validation with advisors.*

### 7.1 Pricing principles

- **Avoid taxing the first transaction** too heavily if liquidity is the bottleneck (early stage).
- **Price on outcomes** (qualified leads, closed deals) once attribution is credible.
- **Segment**: small stockists vs large distributors have different willingness to pay.

### 7.2 Revenue from **vendors** (common models)

| Model | Pros | Cons |
|-------|------|------|
| **Subscription** (shop tiers) | Predictable | Hard before proven ROI |
| **Per-lead / per-inquiry** | Aligns to value | Needs lead quality controls |
| **Take rate on GMV** | Scales with volume | Needs payments on-platform |
| **Featured listings / ads** | Simple to ship | Can hurt trust if overdone |
| **Data & insights** (aggregated) | High margin | Sensitive ethically/legal |

**Hybrid** (low base subscription + performance fee) is common in B2B marketplaces.

### 7.3 Revenue from **customers** (use carefully)

| Model | Notes |
|-------|--------|
| **Freemium inquiries** | Default; builds liquidity |
| **Premium buyer** (faster routing, dedicated support, RFQ tools) | Works for procurement teams |
| **Payment fees** | If you facilitate checkout |
| **Financing / invoice factoring** | Partner-led; regulatory complexity |

Many B2B verticals **subsidize buyers** early and **monetize supply** once density exists.

### 7.4 Sanity checks before locking prices

- Unit economics: CAC (vendor + buyer), contribution margin per inquiry, support cost per account.
- Compare to **alternatives**: phone broker, Alibaba, local WhatsApp groups — your fee must be justified by **speed, trust, or reach**.
- Legal: **intermediary** rules, VAT/GST on fees, advertising disclosures.

---

## 8. Suggested roadmap themes (tie-back)

1. **Vendor MVP** — Auth + shop membership + inquiry inbox + email alerts.
2. **Trust** — Shop verification, response badges, spec templates for top categories.
3. **RFQ 2.0** — Multi-SKU inquiries, attachments (MTR), quote versioning.
4. **Monetization experiment** — One clear vendor SKU (e.g. “Pro shop” subscription) after baseline metrics exist.

---

## 9. Document maintenance

- **Owner**: product + founder (single owner name when you assign one).
- **Review cadence**: monthly pre-launch; quarterly post-launch.
- **Link to execution**: map each section to epics/issues when you formalize the backlog.

---

*End of document.*
