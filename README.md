# Store Rating Platform

Full-stack monorepo for a role-based store rating application.

**Stack:** NestJS · Prisma · PostgreSQL · JWT · React 18 · Vite · Tailwind CSS · TanStack Query · Zustand · Framer Motion · React Hook Form + Zod

## Features

- Role-based access control: **Admin**, **Normal user**, **Store owner**
- JWT authentication (access + refresh), signup, login, password update
- Admin dashboard with stats, user management, and store management
- Normal users: browse/search stores, submit and update ratings with optional comments
- Store owners: dashboard for ratings, feedback, and store performance
- Responsive UI with guided onboarding tour

## Repository structure

```text
apps/
  api/   NestJS REST API, Prisma schema, migrations, seed
  web/   React (Vite) SPA
```

## Prerequisites

- Node.js **20+**
- npm **10+**
- Docker Desktop (for local PostgreSQL)

## Local setup

```bash
# 1. Install dependencies
npm install

# 2. Start PostgreSQL
docker compose up -d postgres

# 3. Configure API environment
cp apps/api/.env.example apps/api/.env

# 4. Apply migrations and seed demo data
cd apps/api
npx prisma migrate deploy
npx prisma db seed
cd ../..

# 5. Run services (two terminals)
npm run dev:api   # http://localhost:3000/api  ·  Swagger: /api/docs
npm run dev:web   # http://localhost:5173
```

### Environment files

| File | Purpose |
|------|---------|
| `apps/api/.env.example` | API env template (copy to `apps/api/.env`) |
| `apps/web/.env.example` | Optional web env (`VITE_API_URL` for production builds) |
| `.env.example` | Docker Compose / shared production-oriented template |

Real `.env` files are **gitignored**. Never commit production secrets.

### Demo accounts (local seed only)

After `npx prisma db seed`, local demo users are created by `apps/api/prisma/seed.ts`.  
Use those seeded emails/passwords for local testing. Do **not** reuse seed credentials in production.

### Application routes

| Path | Access |
|------|--------|
| `/login`, `/signup` | Public |
| `/admin`, `/admin/users`, `/admin/stores` | Admin |
| `/stores` | Normal user |
| `/owner` | Store owner |
| `/password` | Authenticated |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev:api` / `dev:web` | Start API or web in development |
| `npm run build` | Build API and web |
| `npm run lint` | Lint both apps |
| `npm test` | Run unit tests |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed database |
| `cd apps/api && npm run test:e2e` | API e2e tests |
| `cd apps/web && npm test` | Frontend tests |

## API overview

Base path: `/api`

- `POST /auth/signup`, `POST /auth/login`, `POST /auth/refresh`, `PATCH /auth/password`
- `GET/POST /admin/*` — dashboard, users, stores (admin)
- `GET /stores`, `POST|PATCH /stores/:id/ratings` — store listing & ratings
- `GET /store-owner/dashboard` — owner metrics and raters
- Swagger UI: `/api/docs`
- Health: `/api/health`

## Deployment

See **[DEPLOY.md](./DEPLOY.md)** for Vercel (web) + Render (API) + managed Postgres, Docker Compose, and required environment variables.

Summary:

- **API:** `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `CORS_ORIGIN`
- **Web build:** `VITE_API_URL=https://<your-api-host>/api`

```bash
cp .env.example .env   # set strong JWT secrets and CORS
docker compose up -d --build
# Web http://localhost:8080  ·  API http://localhost:3000/api
```

## Security notes

- Passwords are stored with **bcrypt** hashes only
- JWT access/refresh secrets must be strong random values in production
- CORS is restricted via `CORS_ORIGIN`
- Example env values are placeholders, not production credentials

## License

Private project unless otherwise specified.
