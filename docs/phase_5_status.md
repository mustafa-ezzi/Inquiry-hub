# Phase 5 status — Trust & operations

## Deliverables

- [x] Admin-only shop verification / suspension (rules + UI)
- [x] Admin surface `/admin` (dashboard, shops, reports)
- [x] Report / hide moderation (`reports` collection + product/inquiry hidden)
- [x] “Replies quickly” badge from first-reply metrics
- [x] Analytics facade (`inquiry_created`, `first_vendor_reply`, …)
- [x] Support channel on Contact + WhatsApp footer link
- [x] Ops runbook: [`ops_runbook.md`](./ops_runbook.md)
- [x] Owner console expansion (waitlist, users, catalog, settings): [`admin_panel.md`](./admin_panel.md)

## Deploy

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

Promote an admin in Console: set `users/{uid}.role` to `admin`.

## Gate

```bash
cd frontend
npm run lint
npm run test
npm run test:coverage
npm run build
```

**Exit criteria:** Ops can verify a shop, suspend sellers, hide listings from reports; badges and analytics events fire; CI green.
