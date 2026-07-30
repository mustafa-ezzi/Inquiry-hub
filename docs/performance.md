# Performance budget (Phase 6)

## Targets (Home + Product detail)

| Metric | Budget (mobile, mid-tier) |
|--------|---------------------------|
| Lighthouse Performance | ≥ 80 |
| LCP | ≤ 2.5 s |
| CLS | ≤ 0.1 |
| INP / FID | ≤ 200 ms |
| Total JS (gzip, main) | Prefer &lt; 300 kB; current bundle may exceed — track reductions |

## How to measure

```bash
cd frontend
npm run build && npm run preview
# Then Chrome DevTools Lighthouse against http://localhost:4173/
# Paths: /  and  /product/<id>
```

Or PageSpeed Insights against staging/production URL.

## Known hotspots

- Single large JS chunk (~800 kB pre-split) — consider route-based `lazy()` for vendor/admin.
- Firebase SDK weight — keep auth/firestore imports centralized.

## Gate policy

- Alpha: measure and record scores in [`alpha_launch_checklist.md`](./alpha_launch_checklist.md); no hard CI fail yet.
- GA: add Lighthouse CI or explicit waiver in release notes if under budget.
