See CLAUDE.md.

When adding or changing code that mutates user documents, invalidate the auth user document cache for affected users. This includes single-user updates and bulk role/user mutations; otherwise OpenID JWT request burst caching can serve a stale `req.user` until its TTL expires.

## Base44 Dev Setup

- **Architecture**: Monorepo with Express API (port 3080) + Vite React frontend (port 3090), MongoDB, MeilSearch.
- **Workspace packages** (`packages/data-provider`, `packages/data-schemas`, `packages/api`, `packages/client`) must be built before the app starts: `npm run build:packages`.
- **API server** requires `client/dist/index.html` to exist (it serves the SPA in production). A placeholder file is created by the setup service for dev mode.
- **Vite dev server** proxies `/api` and `/oauth` to `http://localhost:3080` (the Express backend). Both run in the same container so localhost works.
- **Allowed hosts**: Vite config reads `VITE_ALLOWED_HOSTS` env var (comma-separated) for its `server.allowedHosts`. Must include the preview domain.
- **AI API keys**: Default to `user_provided` — users enter them in the LibreChat UI. No external secrets needed for basic boot.
- **Auth**: Local email login with registration enabled by default. JWT secrets are set inline in compose for dev.
- **Health check**: API exposes `/health` (not `/api/health`).
- **Node**: Requires Node 22 (uses npm workspaces).
