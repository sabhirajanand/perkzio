# Perkzio API

Node.js (LTS), **TypeScript**, **Express**, **TypeORM** (`DataSource`), PostgreSQL, Redis.

## Prerequisites

- Node.js 20+
- Docker Desktop (optional, only for Postgres + Redis via `docker-compose.yml`)

## Environment

Copy `.env.example` to `.env` and set:

- `DATABASE_URL` — PostgreSQL connection string
- `REDIS_URL` — Redis connection URL
- `CORS_ORIGINS` — comma-separated allowed origins

### Schema sync (development only)

- `DB_SYNC=true` — TypeORM will **synchronize** the schema from entities on startup. Use only on local/dev databases.
- Production uses **migrations** (`npm run migration:run` after `npm run build`).

## Run locally

```bash
# Optional: run Postgres + Redis in Docker (API still runs on your machine)
docker compose up -d
npm install
# Set DB_SYNC=true in .env for first-time local schema creation
npm run dev
```

- Health: `GET http://localhost:8000/health`
- Readiness: `GET http://localhost:8000/ready` (DB + Redis)
- API stub: `GET http://localhost:8000/v1`

## TypeORM migrations

```bash
npm run build
npm run migration:run
```

Generate a new migration (requires an existing DB; compares DB to entities):

```bash
npm run build
npx typeorm migration:generate dist/migrations/MigrationName -d dist/config/data-source.js
```

## Architecture

See `docs/backend/` — layered **routes → controllers → services → repositories**, entities under `src/entities/`, `AppDataSource` in `src/config/data-source.ts`.
