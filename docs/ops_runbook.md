# Ops runbook — Trust & moderation (Phase 5)

## Promote an admin

1. Firebase Console → Authentication → copy the user’s UID.
2. Firestore → `users/{uid}` → set `role` to `admin` (string).
3. User signs out/in, then opens **Profile → Admin console** (`/admin`).

Do **not** grant admin from the client app.

## Verify a shop

1. `/admin/shops`
2. Find the shop → **Approve** (sets `verified: true`).
3. **Unverify** clears the badge.

Only admins can change `verified` (Firestore rules).

## Suspend a shop

1. `/admin/shops` → **Suspend** (optional reason stored as `suspendedReason`).
2. Suspended shops are filtered from public shop lists; members cannot create/update products while suspended.
3. **Unsuspend** restores access.

## Disable listings

1. `/admin/shops` → **Disable listings** hides all visible products for that shop (`hidden: true`).
2. Hidden products are not returned in public catalog queries and are denied by rules for non-admins.

## Handle an abuse report

1. Buyer/vendor taps **Report** on product or inquiry thread.
2. `/admin/reports` → open queue.
3. **Hide product & resolve** or **Hide inquiry & resolve**, or **Resolve only** if no action needed.

## Support channel

- Defaults: `frontend/src/lib/legalContent.js`
- Live overrides: Admin → **Settings** (`config/site`) — email, WhatsApp URL, homepage CTA
- See [`admin_panel.md`](./admin_panel.md) for waitlist approve and full owner console

## Vendor waitlist

1. Applicant signs in → `/vendor-waitlist` → creates `vendorWaitlist/{id}` (`pending`).
2. `/admin/waitlist` → filter status → **Approve** (creates shop + vendor membership when `applicantUid` is set), **Reject**, or **Contacted** + notes.
3. Deploy rules/indexes after first rollout: `firebase deploy --only firestore:rules,firestore:indexes`

## Related runbooks

- Deploy / rollback / incident / keys: [`runbooks.md`](./runbooks.md)
- Environments: [`environments.md`](./environments.md)
- Backups: [`backup.md`](./backup.md)

## Analytics events (console / optional FA)

| Event | When |
|-------|------|
| `inquiry_created` | New Firestore inquiry |
| `first_vendor_reply` | First vendor message on a thread (+ TTFR ms) |
| `report_created` | User submits a report |
| `shop_verified` / `shop_suspended` | Admin actions |

Inject a custom tracker via `setAnalyticsTracker` for production FA wiring.
