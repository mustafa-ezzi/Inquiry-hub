# Auth & security (Phase 2)

## Auth choice

**Primary (enabled):** Google Sign-In via Firebase Authentication.  
Public-facing name on Google’s consent screen: **Mart-Hub** (set in Firebase Console → Authentication → Google).

**Also supported in the app:** Email + password (enable that provider separately if you want the email forms to work).

**Phone OTP:** deferred (needs SMS provider).

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
| `/admin` | `admin` only (Phase 5) |

Shop field `verified` / `suspended` may only be changed by admins (Firestore rules). Members may update name, location, and response metrics.

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
- `storage.rules` — product image uploads under `product-images/{shopId}/…` for shop members / admins; public read
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
2. **Build → Authentication** → **Get started** if needed.
3. **Sign-in method**:
   - Enable **Google** (public-facing name e.g. **Mart-Hub**) → Save.
   - Optionally enable **Email/Password** for the email forms.
4. **Settings → Authorized domains**: keep `localhost` for local dev.
5. Confirm `frontend/.env` matches **Project settings → Your apps**.
6. Restart `npm run dev` after `.env` changes.
7. Deploy rules: `firebase deploy --only firestore:rules,storage`

### `CONFIGURATION_NOT_FOUND`

Auth (or the provider you called) is not enabled. Enable **Google** and/or **Email/Password**, then retry. Email forms will keep failing until Email/Password is enabled — use **Continue with Google** instead.
