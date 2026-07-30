# Phase 6 status — Launch readiness

## Deliverables

- [x] Legal pages with MVP Privacy / Terms / About / Contact copy
- [x] Inquiry consent checkbox + privacy link
- [x] Cookie / analytics consent banner
- [x] Prod vs staging documented ([`environments.md`](./environments.md))
- [x] Monitoring facade + optional `VITE_ERROR_WEBHOOK_URL`; inquiry failure reporting
- [x] Backup plan ([`backup.md`](./backup.md))
- [x] Deploy / rollback / incident / keys ([`runbooks.md`](./runbooks.md))
- [x] Performance budget ([`performance.md`](./performance.md))
- [x] Alpha launch checklist ([`alpha_launch_checklist.md`](./alpha_launch_checklist.md))
- [x] Version bump to `1.0.0-alpha.0`

## Gate

```bash
cd frontend
npm run lint
npm run test
npm run build
```

Tag when ready: `git tag v1.0.0-alpha.0`

**Exit criteria:** Release candidate tagged; Alpha go/no-go uses the checklist. Counsel review of legal copy before GA.
