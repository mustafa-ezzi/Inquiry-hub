# Phase 0–1 completion notes

Completed in-repo for InquireHub.PK foundations + buyer discovery hardening.

## Phase 0 deliverables

- [x] Vitest + React Testing Library + jsdom
- [x] ESLint flat config (`eslint.config.js`)
- [x] Scripts: `test`, `test:watch`, `test:coverage`, `lint`, `build`
- [x] Root + frontend README
- [x] GitHub Actions CI (lint → test → build)
- [x] Smoke tests: routes, mappers, inquiry localStorage

## Phase 1 deliverables

- [x] Shared `mapProductRecord` used by product fetch + product details
- [x] Shop page `/shop/:shopId` + View shop wiring
- [x] Stub CTAs resolved (header account/cart removed; profile → waitlist; footer legal routes; vendor CTA → waitlist)
- [x] Distinct category/nav icons
- [x] Verified listing badge data-driven
- [x] Product search navigates home with `?q=`
- [x] Empty/error messaging for products/shops/categories
- [x] PWA offline behavior documented in `frontend/README.md`

## Gate command

```bash
cd frontend
npm run lint
npm run test
npm run test:coverage
npm run build
```

All of the above must pass at **100%** before Phase 2.
