# Deployment

Public production guide. Internal phase notes are local-only and not published.

## Architecture

| Layer | Recommended host | Notes |
|-------|------------------|-------|
| Web (Vite SPA) | Vercel / Netlify / Cloudflare Pages | Set `VITE_API_URL` |
| API (NestJS) | Render / Railway | Node 20, run migrations on start |
| Postgres | Neon / Supabase / Render Postgres | Set `DATABASE_URL` |

Or run everything with Docker Compose on a single VPS.

## Required secrets

### API

| Variable | Example |
|----------|---------|
| `DATABASE_URL` | `postgresql://user:pass@host:5432/db?schema=public` |
| `JWT_ACCESS_SECRET` | long random string |
| `JWT_REFRESH_SECRET` | long random string |
| `CORS_ORIGIN` | `https://your-app.vercel.app` (comma-separated OK) |
| `PORT` | often injected by host (`3000` default) |
| `JWT_ACCESS_TTL` | `15m` (optional) |
| `JWT_REFRESH_TTL` | `7d` (optional) |

### Web (build-time)

| Variable | Example |
|----------|---------|
| `VITE_API_URL` | `https://your-api.onrender.com/api` |

Local dev: leave `VITE_API_URL` empty so the Vite proxy serves `/api`.

## Option A - Vercel (web) + Render (API) + Neon (DB)

See also **[VERCEL.md](./VERCEL.md)** for exact Vercel dashboard clicks.

### 1. Database

1. Create a Neon/Supabase Postgres project.
2. Copy the connection string.
3. From your machine (once):

```bash
cd apps/api
# export DATABASE_URL=...
npx prisma migrate deploy
npx prisma db seed   # optional local demo data
```

### 2. API on Render

1. New Web Service from this repo (or use `render.yaml`).
2. Build: `npm ci && npm run build -w @store-rating/api && npm exec -w @store-rating/api -- prisma generate`
3. Start: `cd apps/api && npx prisma migrate deploy && npm run start:prod`
4. Set env vars listed above (`CORS_ORIGIN` = your Vercel URL).
5. Note the public API URL, e.g. `https://store-rating-api.onrender.com`.

### 3. Web on Vercel

**Recommended: monorepo root settings** (uses root `vercel.json`)

1. Import the GitHub repo on Vercel.
2. In Project Settings â†’ General:
   - **Root Directory:** leave empty / `.` (repo root)
   - **Framework Preset:** Other
3. In Project Settings â†’ Build & Development (or use `vercel.json`):
   - **Install Command:** `npm ci`
   - **Build Command:** `npm run build -w @store-rating/web`
   - **Output Directory:** `apps/web/dist`
4. Environment Variables (Production):
   - `VITE_API_URL=https://<your-api-host>/api`  
     Example: `https://store-rating-api.onrender.com/api`
5. Redeploy.

**Do not set Root Directory to `apps/web`** unless you also change install/build
to work without the monorepo workspace root. Prefer the root settings above.

SPA rewrites are configured in root `vercel.json`.

### 4. Smoke test

- Open the Vercel URL - login / signup
- API docs: `https://your-api/api/docs`
- Health: `https://your-api/api/health`

## Option B - Docker Compose (single host)

```bash
cp .env.example .env
# edit JWT secrets, CORS_ORIGIN, VITE_API_URL if needed
docker compose up -d --build
```

| Service | URL |
|---------|-----|
| Web | http://localhost:8080 |
| API | http://localhost:3000/api |
| Swagger | http://localhost:3000/api/docs |

For a public VPS, point a reverse proxy (Caddy/Nginx) at web:80 and api:3000, set real JWT secrets, and set:

- `CORS_ORIGIN=https://your-domain.com`
- `VITE_API_URL=https://api.your-domain.com/api` (rebuild web after change)

## Local development (unchanged)

```bash
npm install
docker compose up -d postgres
cp apps/api/.env.example apps/api/.env
cd apps/api && npx prisma migrate deploy && npx prisma db seed
npm run dev:api   # :3000
npm run dev:web   # :5173
```

## Checklist before go-live

- [ ] Strong JWT secrets (not the example values)
- [ ] `CORS_ORIGIN` matches the real frontend origin
- [ ] `VITE_API_URL` includes the `/api` prefix
- [ ] Migrations applied (`prisma migrate deploy`)
- [ ] Seed only if you want local demo data
- [ ] Free Render services may sleep (cold start)


