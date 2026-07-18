# @store-rating/api

NestJS REST API for the Store Rating Platform.

## Endpoints

| Path | Description |
|------|-------------|
| `/api/docs` | Swagger UI |
| `/api/health` | Health check |
| `/api/auth/*` | Auth (signup, login, refresh, password) |
| `/api/admin/*` | Admin users & stores |
| `/api/stores/*` | Store listing and ratings |
| `/api/store-owner/*` | Owner dashboard |

## Local development

From the monorepo root:

```bash
cp apps/api/.env.example apps/api/.env
docker compose up -d postgres
cd apps/api
npx prisma migrate deploy
npx prisma db seed
npm run start:dev
```

See the root [README.md](../../README.md) and [DEPLOY.md](../../DEPLOY.md) for full setup and production notes.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run start:dev` | Dev server with watch |
| `npm run build` / `start:prod` | Production build & run |
| `npm test` | Unit tests |
| `npm run test:e2e` | E2E tests |
| `npx prisma migrate deploy` | Apply migrations |
| `npx prisma db seed` | Seed demo data |
