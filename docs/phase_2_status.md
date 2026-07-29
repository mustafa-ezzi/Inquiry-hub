# Phase 2 status — Auth, roles & security

## Deliverables

- [x] Auth UI (login / register / logout + profile)
- [x] User profile document + role model (`buyer` / `vendor` / `admin`)
- [x] `firestore.rules` + `storage.rules` + `firebase.json` in repo
- [x] Protected routes: `/inquiries`, `/profile`, `/vendor`
- [x] Inquiry onboarding prefilled from profile when signed in
- [x] Create shop requires auth + sets `ownerUid` / vendor membership

## Auth choice

Email + password (documented in [`auth.md`](./auth.md)).

## Gate

```bash
cd frontend
npm run lint
npm run test
npm run test:coverage
npm run build
```

Deploy rules: `firebase deploy --only firestore:rules,storage` (see `auth.md`).
