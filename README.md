# Store Rating Platform

Full-stack store rating app (NestJS + Prisma + PostgreSQL + React/Vite).

## Features

- Role-based access: **Admin**, **Normal user**, **Store owner**
- JWT auth (access + refresh), signup/login, password update
- Admin: dashboard stats, manage users and stores
- Users: browse/search stores, submit/update ratings
- Store owners: dashboard for their store ratings

## Stack

NestJS · Prisma · PostgreSQL · JWT · React 18 · Vite · Tailwind · TanStack Query · Zustand · Framer Motion · React Hook Form + Zod

## Quick start (local)

Prerequisites: **Node 20+**, **Docker Desktop** (for Postgres).

```bash
npm install
docker compose up -d postgres

cp apps/api/.env.example apps/api/.env

cd apps/api
npx prisma migrate deploy
npx prisma db seed
cd ../..

# Terminal 1 - API (http://localhost:3000/api/docs)
npm run dev:api

# Terminal 2 - Web (http://localhost:5173)
npm run dev:web
```

### Seeded logins

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@store-rating.local | Admin@123 |
| Store owner | owner1@store-rating.local | Owner@123 |
| Normal user | alice@store-rating.local | User@1234 |

### App routes

| Path | Role |
|------|------|
| `/login`, `/signup` | Public |
| `/admin`, `/admin/users`, `/admin/stores` | ADMIN |
| `/stores` | NORMAL_USER |
| `/owner` | STORE_OWNER |
| `/password` | Authenticated |

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev:api` / `dev:web` | Dev servers |
| `npm run lint` / `build` | Lint and build both apps |
| `npm run db:seed` | Seed database |
| `cd apps/api && npm test` | Backend unit tests |
| `cd apps/api && npm run test:e2e` | Backend e2e |
| `cd apps/web && npm test` | Frontend tests |

## Deployment

See **[DEPLOY.md](./DEPLOY.md)** for Vercel + Render + Neon, Docker Compose production, and env vars.

### Production env (summary)

- API: `DATABASE_URL`, `JWT_*`, `CORS_ORIGIN`
- Web build: `VITE_API_URL=https://your-api.example.com/api`

```bash
# Full stack via Docker
cp .env.example .env
docker compose up -d --build
# Web http://localhost:8080  ·  API http://localhost:3000/api
```

## License

Private / unlicensed unless otherwise specified.
