# Launch runbooks — deploy, rollback, incident, keys

See also: [`ops_runbook.md`](./ops_runbook.md) (admin/moderation), [`environments.md`](./environments.md), [`backup.md`](./backup.md).

## Deploy (frontend)

1. Ensure CI green on the release commit (`lint` + `test` + `build`).
2. Set host env vars from the **correct** Firebase project (staging or production).
3. Build: `cd frontend && npm ci && npm run build`.
4. Deploy `frontend/dist` to the host (Vercel/Netlify/Firebase Hosting).
5. Smoke: `/` loads, `/login` Google works, create inquiry on a test product.

## Deploy (Firestore rules / indexes)

```bash
firebase use staging   # or production
firebase deploy --only firestore:rules,firestore:indexes,storage
```

Confirm in Console that rules version updated. Run security smoke: unauthenticated cannot write `products`/`shops.verified`.

## Rollback (frontend)

1. Redeploy previous known-good build artifact or git tag (`git checkout v1.0.0-alpha.0` → build → deploy).
2. If a bad env var caused the issue, fix secrets first, then redeploy.
3. Notify team in chat; note tag + time in release notes.

## Rollback (rules)

1. Revert `firestore.rules` / `firestore.indexes.json` to last good commit.
2. `firebase deploy --only firestore:rules,firestore:indexes`.
3. If data was corrupted, restore from export ([`backup.md`](./backup.md)).

## Incident response

| Severity | Examples | Actions |
|----------|----------|---------|
| SEV1 | Auth down, mass data leak, site unreachable | Page on-call; disable OAuth client if compromised; status note; fix or rollback |
| SEV2 | Inquiry create failing widely | Check Firebase status + `VITE_ERROR_WEBHOOK` logs; hotfix or rollback |
| SEV3 | Single shop/report issue | Use admin console; document in ops notes |

**Comms:** update `#incidents` (or email), then postmortem within 48h for SEV1/2.

## Rotate keys

1. Firebase Console → Project settings → Your apps → regenerate Web API key only if leaked (update all env hosts).
2. Google Cloud → restrict API key by HTTP referrer to production/staging domains.
3. Rotate `VITE_ERROR_WEBHOOK_URL` secret if exposed.
4. Force sign-out: users refresh tokens after Auth settings changes; ask admins to re-login.
5. Never commit `.env` or service account JSON to git.

## Uptime monitoring

Configure an external check (UptimeRobot, Better Stack, Cloudflare Health) hitting:

- `GET https://<production-host>/` every 5 minutes
- Alert to email/Slack on 2 consecutive failures

Optional: ping a static `/health` if you add one later; marketing URL is enough for Alpha.
