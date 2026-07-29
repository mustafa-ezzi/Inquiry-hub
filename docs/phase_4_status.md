# Phase 4 status — Vendor portal MVP

## Deliverables

- [x] Vendor layout + nested routes (`/vendor`, inbox, products, shop)
- [x] Lead inbox with status/product/search filters + realtime shop subscription
- [x] Vendor thread reply (`sendVendorMessage` / Firestore)
- [x] Product CRUD (MVP fields; image via HTTPS URL)
- [x] Shop profile edit (`updateShop`)
- [x] New-inquiry notification hook (`notifyInquiry` — mockable; browser Notification optional)
- [x] Role-gated `/vendor/*` (vendor/admin only; buyers redirected)

## Deploy

Re-deploy rules so vendors can delete their own products:

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

## Gate

```bash
cd frontend
npm run lint
npm run test
npm run test:coverage
npm run build
```

**Exit criteria:** Closed loop buyer inquiry → vendor reply → buyer thread update on staging; CI green.
