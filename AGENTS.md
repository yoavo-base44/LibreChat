# LibreChat – Dev Environment Notes

See also `CLAUDE.md` for codebase conventions.

## Quick Start
```bash
docker compose -f docker-compose.base44.yml up -d
```
First run takes ~3 min for `npm ci` + package builds (setup service).

## Architecture (dev mode)
- **client** (Vite dev server on port 3090, mapped to host 3000): proxies `/api` and `/oauth` to the `api` service.
- **api** (Node.js via nodemon on port 3080): Express backend; requires `client/dist/index.html` to exist (even a placeholder) or it crashes.
- **mongodb** (Mongo 8): no auth, data in named volume.
- **meilisearch**: full-text search index for conversations/messages.

## Key quirks
- The API `fs.readFileSync`s `client/dist/index.html` at startup, so a placeholder file is created by the setup service. The Vite dev server is the actual frontend entry point.
- Vite config uses `process.env.HOST` for BOTH `server.host` AND the backend proxy target URL. In compose, `HOST=api` points the proxy correctly; `--host 0.0.0.0` CLI flag overrides the listen address.
- `client/vite.config.ts` was patched to accept `VITE_ALLOWED_HOSTS=true` (Vite 8 boolean form) in addition to comma-separated hostnames.
- AI provider API keys default to `user_provided` — users enter them in the UI. No external secrets are required to boot.
- Internal packages (`packages/*`) must be built before the client or API can run: `npx turbo run build --filter='!@librechat/frontend'`.

## Auth defaults (dev)
- Registration enabled, social login disabled.
- CREDS_KEY, CREDS_IV, JWT_SECRET, JWT_REFRESH_SECRET use `.env.example` defaults (fine for dev, NOT for production).
