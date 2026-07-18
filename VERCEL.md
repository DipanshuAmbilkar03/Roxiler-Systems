# Vercel deploy (web only)

This monorepo deploys the **frontend** from the GitHub `master` branch.

## Recommended project settings

Open Vercel project ? **Settings**

### General
- **Root Directory**: `apps/web`  (Edit ? set to `apps/web` ? Save)
- **Include source files outside of the Root Directory**: **ON** / enabled  
  (required so workspace install can reach the monorepo root)

### Build & Development Settings
Use values from `apps/web/vercel.json` (or paste manually):

| Setting | Value |
|--------|--------|
| Framework Preset | Vite |
| Build Command | `npm run build --prefix ../.. -w @store-rating/web` |
| Output Directory | `dist` |
| Install Command | `npm install --prefix ../..` |
| Development Command | `npm run dev` |

### Environment Variables (Production)
```text
VITE_API_URL=https://YOUR-RENDER-API-HOST/api
```

Redeploy after changing env vars.

## Alternative: Root Directory empty

If Root Directory is left empty (repo root), use root `vercel.json`:

| Setting | Value |
|--------|--------|
| Install | `npm ci` |
| Build | `npm run build -w @store-rating/web` |
| Output | `apps/web/dist` |

## After frontend is live

1. Deploy Nest API (Render) + Postgres (Neon)
2. Set API `CORS_ORIGIN` to your Vercel URL
3. Set Vercel `VITE_API_URL` to `https://api-host/api` and redeploy web

Frontend alone without API will show login UI but API calls will fail.
