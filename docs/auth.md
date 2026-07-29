# Auth & security (Phase 2)

## Auth choice

**Primary:** Email + password via Firebase Authentication.

**Why not phone-first:** Phone OTP needs an SMS provider and Firebase phone Auth setup; email is enough for B2B PK Alpha without that ops cost. Phone can be added later as a second factor or alternate sign-in.

## Roles

Stored on `users/{uid}`:

| Role | Access |
|------|--------|
| `buyer` (default) | Browse, inquire, own profile, inquiry list |
| `vendor` | Buyer + shop membership + `/vendor` portal (Phase 4 UI) |
| `admin` | Moderation / full writes (set only in console / Admin SDK) |

Creating a shop sets `ownerUid`, appends `shopIds`, and upgrades role to `vendor`.

## Client routes

| Path | Gate |
|------|------|
| `/login`, `/register` | Public |
| `/inquiries`, `/profile` | Signed in |
| `/vendor` | `vendor` or `admin` |

## Deploy rules

From repo root (Firebase CLI):

```bash
firebase login
firebase use <your-project-id>
firebase deploy --only firestore:rules,storage
```

Files:

- `firestore.rules`
- `firestore.indexes.json`
- `storage.rules` (deny-all until Phase 4 uploads)
- `firebase.json`

## Policy tests

Unit tests in `frontend/src/lib/accessControl.test.js` mirror rule decisions (buyer cannot update another shop; unauthenticated cannot read private inquiries; vendor membership enforced).

Optional emulator (when Firebase emulators are running):

```bash
firebase emulators:start --only firestore,auth
# then run any @firebase/rules-unit-testing suite you add later
```

## Console checklist

1. Enable **Email/Password** in Firebase Auth.
2. Deploy Firestore rules before relying on create-shop in production.
3. Keep API keys as public web config only (already the case with `VITE_*`).
