# Environments — staging vs production

## Projects

| Env | Purpose | Firebase project | Frontend host (example) |
|-----|---------|------------------|-------------------------|
| **Local** | Dev | Shared staging project or emulator | `localhost:5173` |
| **Staging** | QA / Alpha dry-run | `inquirehub-staging` (create) | Vercel/Netlify preview |
| **Production** | Live Alpha/Beta/GA | `inquirehub-prod` (create) | Production domain |

Never point a production build at the staging Firebase project.

## Frontend config

1. Copy [`frontend/.env.example`](../frontend/.env.example) → `.env.staging` / `.env.production` (or CI secrets).
2. Fill `VITE_FIREBASE_*` from the matching Firebase Console app.
3. Optional: `VITE_FIREBASE_MEASUREMENT_ID`, `VITE_ERROR_WEBHOOK_URL`.
4. **Never** set `VITE_INQUIRY_DEMO_LOCAL` in staging/production builds.

## Firebase CLI

```bash
# .firebaserc example (create at repo root)
# {
#   "projects": {
#     "default": "inquirehub-staging",
#     "staging": "inquirehub-staging",
#     "production": "inquirehub-prod"
#   }
# }

firebase use staging
firebase deploy --only firestore:rules,firestore:indexes,storage

firebase use production
firebase deploy --only firestore:rules,firestore:indexes,storage
```

## Auth domains

For each project: Authentication → Settings → Authorized domains — add `localhost` (dev) and your staging/production hostnames.

## Google OAuth

Public-facing name (e.g. Mart-Hub) and OAuth client must match the Firebase project serving that host.

## Checklist before promoting staging → prod

- [ ] Rules/indexes deployed to production project
- [ ] Env secrets in CI/host match production Firebase
- [ ] Admin UID promoted on **production** `users/{uid}`
- [ ] Smoke: login → inquire → vendor reply on staging first
