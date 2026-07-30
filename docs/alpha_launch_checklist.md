# Alpha launch checklist

**Release:** InquireHub.PK `1.0.0-alpha.0`  
**Environment:** Production Firebase + production host  
**Operator:** _________________ **Date:** ________

## Go / no-go

- [ ] CI green on release tag (lint, test, build)
- [ ] `firebase deploy --only firestore:rules,firestore:indexes` on **production**
- [ ] Production `.env` / host secrets verified ([`environments.md`](./environments.md))
- [ ] Admin account promoted on production
- [ ] At least 1 curated vendor + shop + products live
- [ ] Buyer path: discover → inquire (with consent) → see thread
- [ ] Vendor path: inbox → reply → buyer sees message
- [ ] Report → admin reports queue works
- [ ] PWA: install prompt / offline shell acceptable on one Android Chrome
- [ ] Mobile inquiry usable (composer + keyboard)
- [ ] Legal pages (`/privacy`, `/terms`, `/contact`, `/about`) reviewed for Alpha
- [ ] Cookie banner appears once; Decline stops funnel analytics
- [ ] Uptime monitor pointed at production URL
- [ ] Error webhook configured **or** explicit waiver (console-only)
- [ ] Backup schedule noted ([`backup.md`](./backup.md))
- [ ] Support WhatsApp number updated from stub **or** email-only support accepted

## Sign-off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Eng | | | |
| Ops / founder | | | |

**Decision:** ☐ GO Alpha ☐ NO-GO (reason: ________________)

## Release notes (attach)

- Tag: `v1.0.0-alpha.0`
- Scope: Phases 0–6 MVP (discovery, auth, inquiries, vendor portal, trust/ops, launch docs)
- Out of scope: payments, RFQ 2.0, deep metals taxonomy
