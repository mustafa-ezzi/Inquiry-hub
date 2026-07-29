# Phase 3 status — Inquiry backend

## Choice

**Firestore-native** inquiry threads + realtime `onSnapshot` (no separate Node API required).

## Deliverables

- [x] Schema: `inquiries` + `messages` subcollection
- [x] Frontend production path uses Firestore (localStorage only with `VITE_INQUIRY_DEMO_LOCAL=true` in DEV)
- [x] Buyer “My inquiries” loads by `buyerUid` across devices
- [x] Contract doc: [`inquiry_api.md`](./inquiry_api.md)
- [x] Status model + phone/message validation
- [x] Composite indexes in `firestore.indexes.json`

## Deploy

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

Verified: **61+** tests; lint 0 errors; build OK. Deploy indexes/rules before staging:

`firebase deploy --only firestore:rules,firestore:indexes`
