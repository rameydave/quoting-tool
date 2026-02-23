# Quoting Tool MVP

Production-oriented MVP for replacing spreadsheet quoting workflows.

## Stack
- Frontend: React + TypeScript (Vite)
- Backend: Node.js + TypeScript (Express)
- DB/ORM: PostgreSQL + Prisma schema/migrations

## Features implemented
- Mixed quote row model (`db_part`, `manual_part`, `note`) with backend calculation service.
- Quote numbering + versioning fields and revision endpoint shape.
- Part search with strict autocomplete payload (part # + description only).
- PO CSV export (part numbers only, repeats by qty, excludes notes).
- Customer quote HTML rendering path for PDF generation, including full-width note rows.
- Permission gate for master price updates and audit event creation.
- Prisma schema covering users, parts, quotes, quote_rows, audit, and rep settings.
- Seed placeholders for rep markups and starter user.

## Migration verification status
- `backend/prisma/schema.prisma` is defined.
- `backend/prisma/migrations/202602220001_init/migration.sql` is now a **real SQL migration** that creates enums, tables, constraints, and indexes.
- This replaced the prior placeholder-only migration.

## Route scaffold inventory (what is still missing)
This section is intentionally explicit so placeholders are visible.

### `backend/src/routes/quotes.ts`
Implemented now:
- Create quote (Prisma/Postgres-backed)
- Get quote by id
- Revise quote (new DB version record + cloned rows)
- Export PO CSV
- Export PDF (HTML response path)

Missing for production hardening:
- Prisma persistence/transactions
- Auth/session ownership checks
- full validation matrix and finalize rules
- status transitions (finalize/archive/unfinalize)
- dedicated row CRUD/reorder endpoints

### `backend/src/routes/parts.ts`
Implemented now:
- Search ranking (prefix > contains > description fallback)
- response fields constrained to `id`, `partNumber`, `description`

Missing for production hardening:
- Prisma-backed search over DB
- import endpoint (`/parts/import`) and import-runs tracking
- create/edit part endpoints with role checks and audit logs
- pagination + performance indexing validation for large datasets

### `backend/src/routes/pricing.ts`
Implemented now:
- Role-gated master price update flow
- audit event insertion shape

Missing for production hardening:
- DB transaction across part update + audit insert
- endpoint alignment to quote row context (`/quotes/:id/rows/:rowId/update-master-price`)
- confirmation semantics and snapshot refresh option
- robust error taxonomy and request correlation metadata

## Local setup (exact commands)
From repo root:

1. Install dependencies
```bash
npm install
```

2. Generate Prisma client
```bash
npm run -w backend prisma:generate
```

3. Run migrations
```bash
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/quoting_tool" npm run -w backend prisma:migrate
```

4. Seed data
```bash
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/quoting_tool" npm run -w backend prisma:seed
```

5. Start backend dev server
```bash
npm run -w backend dev
```

6. Start frontend dev server (separate terminal)
```bash
npm run -w frontend dev
```

7. Run tests
```bash
npm test
```

## First local verification checklist
1. Open frontend root page and verify you see **"Quoting Tool MVP"** plus the 4-item status list.
2. Hit backend health endpoint: `GET http://localhost:4000/health` should return `{ "ok": true }`.
3. Confirm Prisma migration applied by checking tables exist in Postgres (`users`, `parts`, `quotes`, `quote_rows`, `audit_log`, `rep_markup_settings`).
4. Run seed and confirm rep markup rows exist for `HOUSE`, `PGP`, `RB`, `WBE`.
5. Run test suite with `npm test` and verify backend + frontend tests execute.
6. Run a quick API check: create a quote via `POST /quotes` and verify response includes recalculated totals.
7. Run `GET /parts/search?q=ABC` and verify response items include only part number + description fields (no pricing field).

## Config placeholders
- Rep markup defaults seeded in `backend/prisma/seed.ts`
- PDF branding/terms placeholders in export templates (`backend/src/services/exportService.ts`)
- Finalize permission policy can be toggled in backend role checks.

## Tests
- Backend: calculations/rounding, permissions, audit event shape, PO CSV rules, revision snapshot behavior, PDF mixed-row rendering path.
- Frontend: autocomplete UI contract (no price), no-match manual action, root page status visibility.


## Phase 2A local DB refresh commands
Run from repo root after pulling this change:

```bash
npm install
npm run -w backend prisma:generate
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/quoting_tool" npm run -w backend prisma:migrate
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/quoting_tool" npm run -w backend prisma:seed
npm run -w backend dev
```

## Phase 2A quick API QA checklist
1. Create quote: `POST /quotes` then confirm 201 + calculated totals.
2. Read quote: `GET /quotes/:id` returns saved rows in order.
3. Revise quote: `POST /quotes/:id/revise` returns new id + incremented version.
4. Parts search: `GET /parts/search?q=ABC` returns at least one result and each item only has `id`, `partNumber`, `description`.
5. PO CSV: `POST /quotes/:id/export/po-csv` excludes note rows and repeats part number by qty.
6. PDF HTML path: `POST /quotes/:id/export/pdf` returns HTML containing note row with `colspan="5"`.
