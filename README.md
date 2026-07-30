# InquireHub.PK

B2B inquiry marketplace for hardware and metals suppliers across Pakistan.

## Structure

| Path | Role |
|------|------|
| `frontend/` | Vite + React PWA (buyer discovery, inquiry chat, shop pages) |
| `docs/` | Product strategy and production phase roadmap |

## Quick start

```bash
cd frontend
cp .env.example .env   # fill Firebase web config
npm install
npm run dev
```

## Quality gates (Phase 0+)

```bash
cd frontend
npm run lint
npm run test
npm run build
```

CI runs lint → test → build on every PR and push to `main` (see `.github/workflows/ci.yml`).

**Policy:** failing tests or lint errors block merge. Every production phase must pass its suite at **100%**.

## Roadmap

- Strategy: [`docs/flow_management.md`](docs/flow_management.md)
- Execution phases: [`docs/production_phases.md`](docs/production_phases.md)

## Environments

See [`docs/environments.md`](docs/environments.md) for staging vs production Firebase projects.

Copy `frontend/.env.example` → `frontend/.env`. Required Firebase keys are listed there. Production inquiry path is **Firestore** (do not set `VITE_INQUIRY_DEMO_LOCAL` in prod). Optional `VITE_ERROR_WEBHOOK_URL` for error alerts.

## Launch docs

- Phase 6 status: [`docs/phase_6_status.md`](docs/phase_6_status.md)
- Alpha checklist: [`docs/alpha_launch_checklist.md`](docs/alpha_launch_checklist.md)
- Runbooks: [`docs/runbooks.md`](docs/runbooks.md)
