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

1. Open [Firebase Console](https://console.firebase.google.com) → your project.
2. Go to **Build → Authentication** (first visit may ask you to click **Get started**).
3. Open **Sign-in method** → enable **Email/Password** → **Save**.
4. Confirm `frontend/.env` values match **Project settings → Your apps** (same `apiKey` / `projectId` / `appId`).
5. Restart `npm run dev` after any `.env` change.
6. Deploy Firestore rules before create-shop in production:
   `firebase deploy --only firestore:rules,storage`

### `CONFIGURATION_NOT_FOUND`

This almost always means Authentication (or Email/Password) was never enabled for that project. Complete steps 2–3 above, then retry register/login.