# Firestore backup & export

## Goal

Recover from accidental deletes, bad deploys, or account issues without losing inquiry history.

## Recommended (managed)

1. Firebase Console → project → **Firestore** → **Import/Export** (or Google Cloud Console → Firestore → Import/Export).
2. Create a GCS bucket in the same GCP project (e.g. `inquirehub-prod-firestore-backups`).
3. Schedule weekly exports (Cloud Scheduler + `gcloud firestore export`) for production.

Example (ops machine with gcloud):

```bash
gcloud config set project inquirehub-prod
gcloud firestore export gs://inquirehub-prod-firestore-backups/$(date +%Y%m%d)
```

## Collections to prioritize

- `users`, `shops`, `products`, `inquiries` (+ `messages` subcollections), `reports`

## Restore drill

1. Export a staging snapshot.
2. Restore into a throwaway project or temporary database.
3. Document time-to-restore in the incident log.

## Retention

Keep at least **4 weekly** production exports. Purge older exports per cost policy.

## Related

- Deploy/rollback: [`runbooks.md`](./runbooks.md)
- Incidents: same file § Incident
