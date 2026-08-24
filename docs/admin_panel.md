# Owner admin panel

App owners (`role: admin`) manage the marketplace from `/admin`.

## Navigation

| Page | Purpose |
|------|---------|
| Dashboard | Pending waitlist count + shortcuts |
| Waitlist | Review vendor applicants (`vendorWaitlist`) |
| Users | Change `role` (buyer / vendor / admin) |
| Shops | Verify / suspend / disable listings |
| Products | Search, hide / unhide listings |
| Categories | Create / edit / order catalog categories |
| Inquiries | Recent platform threads |
| Reports | Abuse queue |
| Settings | `config/site` — support email, WhatsApp URL, homepage CTA |

## Waitlist approve flow

1. Applicant signs in and submits `/vendor-waitlist` → Firestore `vendorWaitlist` (`status: pending`, optional `applicantUid`).
2. Admin opens `/admin/waitlist` → **Approve**.
3. Approve creates a shop stub (if needed), sets the applicant to `vendor`, and links `shopIds`.
4. Applicant uses `/vendor` once membership is linked.

## Site settings

Edits at `/admin/settings` write `config/site`. Public clients read that doc for:

- Homepage CTA label / path
- Footer WhatsApp link
- Contact support buttons (email / WhatsApp)

Fallbacks live in `frontend/src/lib/legalContent.js` via `siteConfigService`.

## Shop ↔ user ↔ products

On **Shops**:

1. Select the owner user (e.g. Mustafa Ezzi) → **Link owner** (sets `ownerUid` / `memberUids` and `users.shopIds`).
2. For **Antaria Steels** (`nJOJGDZfrGjFOmuTnlbW`): **Associate all products** or use Products → **Assign all → Antaria**.
3. **Fix product vendors** backfills `vendorName` / `shopName` so listings no longer show “Unknown vendor”.

On **Products**: create with shop + Firebase categories; hide/unhide; repair associations.

## Deploy (required after rules/index changes)

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

Also promote the first admin in Console: `users/{uid}.role = admin` (see [`ops_runbook.md`](./ops_runbook.md)).
