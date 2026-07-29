# Production phases — InquireHub.PK to 100% ready

This document is the **execution roadmap** to take the current frontend wedge (buyer discovery + demo inquiry chat) to a **production-ready, multi-sided marketplace**.

**Rules for every phase**

1. **Do not start the next phase until the current phase gate is green.**
2. **Every phase must pass its test suite at 100%** (zero failing tests). Flaky tests count as failures until fixed or quarantined with an explicit ticket.
3. Each phase has: **goal**, **scope**, **deliverables**, **test gate**, and **exit criteria**.
4. Related strategy lives in [`flow_management.md`](./flow_management.md). This file is the **build order**.

**Current baseline (as of roadmap creation)**

| Area | Status |
|------|--------|
| Buyer browse + product detail (Firestore) | Working |
| Buyer inquiry chat | Demo via `localStorage` unless `VITE_INQUIRY_API_BASE` is set |
| Vendor portal / inbox | Missing |
| Auth / roles | Missing |
| Firestore security rules in repo | Missing |
| Automated tests | **None** |
| CI/CD | **None** |
| Legal pages | Stub links |

---

## Phase overview

| Phase | Name | Outcome | Approx. focus |
|-------|------|---------|----------------|
| **0** | Foundations & quality gates | Repo can be tested and blocked on failure | Tests, lint, CI, README |
| **1** | Buyer discovery hardened | Production-safe catalog UX | Data mapping, shop pages, stubs, PWA polish |
| **2** | Auth, roles & security | Real users + locked data | Firebase Auth, RBAC, Firestore rules |
| **3** | Inquiry backend (production) | Real threads, not browser storage | Inquiry API + persistence + realtime |
| **4** | Vendor portal MVP | Vendors can reply and manage leads | `/vendor/*` inbox + catalog basics |
| **5** | Trust & operations | Verified shops, moderation, support path | Verification, admin, SLAs |
| **6** | Launch readiness (Alpha → GA) | Deployable production release | Legal, observability, runbooks, beta/GA |

Phases **0 → 6** are sequential. Work inside a phase may be parallelized across frontend / backend / ops as long as the **phase gate** is met before moving on.

---

## Phase 0 — Foundations & quality gates

### Goal
Make the project **measurable and safe to change**: every later phase can prove “100% tests pass.”

### Scope

- Add test runner: **Vitest** + React Testing Library (+ jsdom).
- Add **ESLint** (+ Prettier or project formatter) and wire `npm run lint`.
- Add scripts: `test`, `test:watch`, `test:coverage`, `lint`, keep `build`.
- Root + frontend **README**: setup, env vars, scripts, architecture sketch.
- **GitHub Actions CI**: on PR and `main` → install → lint → test → build.
- Smoke tests for existing critical paths (even if shallow):
  - App routes render without crash (`/`, `/product/:id`, `/inquiry/:id`, `/inquiries`).
  - `productService` / category / shop mappers with mock Firestore or fixtures.
  - Inquiry localStorage adapter create / list / send message.
- Coverage baseline report (no hard % yet; introduce floor in Phase 1).

### Deliverables

- [x] `frontend/package.json` scripts: `test`, `lint`, `build`
- [x] CI workflow under `.github/workflows/ci.yml`
- [x] README with env setup from `.env.example`
- [x] First unit/component suite for services + App routing smoke

### Test gate (must be 100% green)

| Suite | Requirement |
|-------|-------------|
| Unit / component | All new Phase-0 tests pass |
| Lint | Zero errors (warnings policy documented) |
| Build | `npm run build` succeeds in CI |

**Exit criteria:** CI is required on PRs; a failing test or lint blocks merge. No feature work starts until this is true.

---

## Phase 1 — Buyer discovery hardened

### Goal
Buyer-facing discovery is **complete, consistent, and production-usable** without depending on vendor tools yet.

### Scope

**Data & UX**

- Normalize product/shop/category mapping (`mapProductRecord`-style) on Home + Product Details (no raw-field drift).
- Real **shop page** route: `/shop/:shopId` (list products, verified badge when present).
- Wire “View shop” / vendor cards to shop pages.
- Replace inert UI or remove it deliberately:
  - Header Account / Cart behavior (hide until Auth, or link to login stub for Phase 2).
  - Bottom nav Profile.
  - Footer legal links → real routes (pages can be placeholder copy until Phase 6 legal review).
  - CTA “Register as Vendor” → onboarding entry (even if “coming in Phase 4” waitlist form).
- Category icons: real icons or curated set (stop single placeholder SVG for all).
- Verified listing badge: **data-driven** only (`vendorVerified` / shop verified), not always-on.
- Product details search: wire or remove no-op handler.
- Empty / error / loading states for Firestore failures (no silent empty grid without message).

**PWA**

- Confirm install + update flow per `frontend/docs/PWA.md` on staging.
- Offline: define what works offline (browse cache vs inquiry — document clearly).

### Deliverables

- [x] Shop detail page + routing
- [x] Stub controls resolved (wired or removed)
- [x] Consistent product/shop mappers
- [x] PWA offline behavior documented (`frontend/README.md`); staging install checklist still manual

### Test gate (100% green)

| Suite | Requirement |
|-------|-------------|
| Phase 0 suite | Still 100% pass |
| New tests | Shop page, mappers, ProductDetails verified badge logic, Footer/legal routes, empty/error states |
| Coverage floor | **≥ 40%** lines on `src/services` + `src/lib` (adjust only with team agreement) |
| E2E (optional but recommended) | Playwright: home → product → inquiry entry renders |
| Lint + build | Pass in CI |

**Exit criteria:** A buyer can discover products and shops end-to-end on staging with no dead primary CTAs; CI green at 100%.

---

## Phase 2 — Auth, roles & security

### Goal
Every privileged action has a **real user identity** and **Firestore (and API) rules** that enforce it.

### Scope

- **Firebase Auth**: phone and/or email (pick one primary for PK B2B; document choice).
- Roles: `buyer`, `vendor`, `admin` (custom claims or `users/{uid}` profile + role field).
- Link vendor users to `shops` (membership: owner/member).
- Protect routes: logged-in inquiries list; vendor routes prepared for Phase 4.
- Commit **`firestore.rules`** (+ indexes) to the repo; deploy via CI or documented CLI.
- Storage rules if product images upload starts here (or defer upload to Phase 4 with rules ready).
- Client: replace anonymous inquiry-only flow with authenticated contact profile (name/phone from account, editable).
- Session persistence + logout; secure env handling (no secrets in frontend beyond public Firebase config).

### Deliverables

- [x] Auth UI (login / register / logout)
- [x] User profile document + role model
- [x] `firestore.rules` + emulator tests
- [x] Protected routes for buyer inquiry history

### Test gate (100% green)

| Suite | Requirement |
|-------|-------------|
| Previous phases | 100% pass |
| Rules tests | Firebase emulator: buyer cannot write another shop; unauthenticated cannot read private threads (as designed); vendor membership enforced |
| Auth unit/integration | Login, logout, role gating components |
| Coverage floor | **≥ 50%** on auth + security-related modules |
| Lint + build | Pass |

**Exit criteria:** Staging enforces rules; unauthenticated users cannot mutate protected collections; auth flows tested at 100% pass.

---

## Phase 3 — Inquiry backend (production messaging)

### Goal
Inquiry threads are **server-persisted**, multi-device, and visible to the correct vendor — **no production reliance on `localStorage`**.

### Scope

- Implement inquiry service (Cloud Functions, separate Node API, or Firestore-native threads — **choose one** and document):
  - `POST /inquiries` (or equivalent)
  - `GET /inquiries` (buyer / vendor scoped)
  - `GET|POST .../messages`
- Persist: inquiry metadata (product, shop, buyer, status) + messages.
- Realtime or short polling for chat (Firestore `onSnapshot` or SSE/WebSocket).
- Migrate frontend `inquiryChatApi.js` to **require** API/Firestore in production builds; keep local adapter **only** behind `import.meta.env.DEV` or explicit demo flag.
- Status model: `open` | `awaiting_vendor` | `awaiting_buyer` | `closed` | `won` | `lost` (minimal set OK).
- Rate limits + basic abuse controls (message length, phone validation).
- Seed script / admin path for Alpha vendors.

### Deliverables

- [ ] Inquiry API or Firestore thread schema live on staging
- [ ] Frontend production path uses remote backend only
- [ ] Buyer “My inquiries” shows server data across devices
- [ ] OpenAPI or short API.md for the inquiry contract

### Test gate (100% green)

| Suite | Requirement |
|-------|-------------|
| Previous phases | 100% pass |
| API / Functions tests | Create inquiry, append message, list by buyer, reject unauthorized access — **100%** |
| Frontend contract tests | Client adapters against mocked API |
| Integration (emulator or staging smoke) | Buyer creates inquiry → message stored → listed |
| Coverage floor | **≥ 60%** on inquiry service + client API module |
| Lint + build | Pass |

**Exit criteria:** Demo localStorage is not used in production config; inquiry create → reply path works for a test buyer/vendor pair on staging with all tests green.

---

## Phase 4 — Vendor portal MVP

### Goal
Vendors can **receive and answer** inquiries and manage a minimal catalog — the multi-sided loop closes.

### Scope

- Routes under `/vendor/*` (layout separate from buyer):
  - Dashboard (counts: open leads, response time placeholder)
  - **Lead inbox** (filter by status/product)
  - Thread reply UI (same message model as buyer)
  - Shop profile edit
  - Product create/edit (basic fields + images if Storage ready)
- Email (or SMS) notification on new inquiry (transactional provider).
- “Register as Vendor” completes: create shop + vendor role claim/membership.
- Mobile-usable vendor inbox (PWA).

### Deliverables

- [ ] Vendor layout + inbox + reply
- [ ] Vendor product CRUD (MVP fields)
- [ ] New-inquiry notification
- [ ] Role-gated navigation (buyers never see vendor admin by accident)

### Test gate (100% green)

| Suite | Requirement |
|-------|-------------|
| Previous phases | 100% pass |
| Vendor E2E | Register vendor → receive inquiry → reply → buyer sees reply |
| Unit tests | Inbox filters, membership checks, product form validation |
| Coverage floor | **≥ 60%** on `vendor` modules + shared inquiry |
| Notification | Unit/integration with mocked provider |
| Lint + build | Pass |

**Exit criteria:** Closed loop on staging: buyer inquiry → vendor reply → buyer thread update; CI 100% green. This is the **Alpha technical ready** bar.

---

## Phase 5 — Trust & operations

### Goal
Enough **trust and ops** to invite real vendors beyond the founding set.

### Scope

- Shop verification workflow (admin approve / reject; badge in UI).
- Response-time or “replies quickly” badge (computed from inquiry metrics).
- Admin surface (`/admin/*`): verify shops, disable listings, view reported threads.
- Content moderation basics: report message/listing; hide flag.
- Spec templates for top 1–2 categories (metals-oriented fields) — optional but high value.
- Support channel documented (email/WhatsApp) in-app.
- Metrics events: inquiry created, first vendor reply, time-to-first-reply (Analytics or custom).

### Deliverables

- [ ] Verification + admin moderation MVP
- [ ] Trust badges backed by data
- [ ] Analytics events for core funnel
- [ ] Ops runbook: suspend shop, handle abuse

### Test gate (100% green)

| Suite | Requirement |
|-------|-------------|
| Previous phases | 100% pass |
| Admin/rules tests | Only admin can verify; suspended shop products hidden |
| Badge logic unit tests | 100% pass |
| Coverage floor | **≥ 65%** on admin + trust modules |
| Lint + build | Pass |

**Exit criteria:** Ops can verify a shop and suspend bad listings; metrics visible in a dashboard or Firebase Analytics; tests 100% green. Matches **Beta** trust bar in `flow_management.md`.

---

## Phase 6 — Launch readiness (Alpha → GA)

### Goal
Ship a **production release** that is operable, compliant enough to launch, and monitored.

### Scope

**Compliance & content**

- Real Privacy Policy, Terms, Contact, About (lawyer/review as needed).
- Consent copy for phone/contact collection on inquiry.
- Cookie/analytics disclosure if applicable.

**Reliability & ops**

- Production Firebase project (separate from staging).
- Error monitoring (e.g. Sentry) + uptime check on marketing URL.
- Logging/alerts on inquiry API failures.
- Backup / export plan for Firestore.
- Runbooks: deploy, rollback, incident, rotate keys.
- Performance budget: Lighthouse / Core Web Vitals targets on Home + Product.

**Release train**

- **Alpha**: curated vendors, one region/category, invite-only vendors.
- **Beta**: more vendors, moderation path live, return-visit tracked.
- **GA**: full categories, stable compliance story, monetization experiment optional (see `flow_management.md` §7–8).

**Out of scope for “100% ready” v1 (track as post-GA)**

- Payments / escrow
- Full RFQ multi-SKU + quote PDF
- Heavy metals taxonomy (ASTM/EN full matrix)
- Financing / LC workflows

### Deliverables

- [ ] Legal pages live and linked
- [ ] Prod vs staging environments documented
- [ ] Monitoring + alerts
- [ ] Alpha launch checklist signed
- [ ] Version bump from `0.0.0` to semver release

### Test gate (100% green)

| Suite | Requirement |
|-------|-------------|
| Full regression | All Phase 0–5 suites **100% pass** on release candidate |
| E2E critical path | Buyer discover → inquire → vendor reply → buyer read (prod-like staging) |
| Security smoke | Rules deploy verified; no open write on public collections |
| Build + lint | Pass |
| Manual UAT checklist | Signed (PWA install, mobile inquiry, vendor inbox) — attach to release notes |
| Coverage floor | **≥ 70%** overall on critical paths (`services`, `lib`, auth, inquiry, vendor) or explicit waiver list |

**Exit criteria:** Release candidate tagged; Alpha (then Beta/GA) go/no-go uses this gate. **App is “100% ready” for the agreed MVP scope** when Phase 6 exit criteria are met — not when every future marketplace feature exists.

---

## Definition of “100% ready” (MVP production)

The product is **100% production-ready for MVP** when all of the following are true:

1. Phases **0–6** exit criteria are met.
2. **Every automated test in CI is passing (100%)** on `main`.
3. Buyer can discover products/shops and complete an inquiry on **production**.
4. Vendor can receive and reply in a **vendor portal**.
5. Auth + Firestore rules prevent unauthorized data access.
6. Legal stubs are replaced; monitoring and deploy runbooks exist.
7. localStorage inquiry is **not** the production path.

Anything beyond this (payments, RFQ 2.0, deep metals taxonomy, monetization) is **post-MVP** and should be scheduled as Phase 7+ epics without blocking the MVP “ready” claim.

---

## Suggested Phase 7+ (post-MVP, not required for ready)

| Epic | Notes |
|------|--------|
| RFQ 2.0 | Multi-line basket, attachments (MTR), quote versioning |
| Monetization | Pro shop subscription or per-lead fee experiment |
| Search ranking | Response rate + quality signals |
| Deep taxonomy | Grades, finishes, standards fields |
| Notifications | WhatsApp / SMS digests |
| Separate vendor deployable | If team/scale needs it |

---

## How to run a phase (team ritual)

1. Create a GitHub milestone named `Phase N — <name>`.
2. Break scope into issues; each issue includes **test notes**.
3. Open PRs small; CI must stay green.
4. At phase end: run full suite → **100% pass** → write a short “Phase N completion” note in the milestone → unlock Phase N+1.
5. If a test fails mid-phase: **fix before new features** in that phase.

### Test policy (non-negotiable)

```text
merge to main  ⇒  lint PASS + tests PASS (100%) + build PASS
phase complete ⇒  all of the above + phase-specific gate above
```

No “fix tests later.” Quarantined tests require an issue and a max age (e.g. 48 hours) or they block the phase gate.

---

## Traceability

| This phase | Maps to `flow_management.md` |
|------------|------------------------------|
| 0 | Technical readiness / quality |
| 1 | Discovery checklist |
| 2–3 | Shared services: auth + messaging |
| 4 | Vendor MVP roadmap theme #1 |
| 5 | Trust theme #2 |
| 6 | Alpha / Beta / GA launch |
| 7+ | RFQ, monetization themes #3–4 |

---

## Document maintenance

- **Owner:** assign a single DRI (founder or tech lead).
- **Update when:** a phase completes, scope is cut, or “100% ready” definition changes.
- **Review cadence:** at the start of each phase and after Alpha launch.

---

*End of production phases document.*
