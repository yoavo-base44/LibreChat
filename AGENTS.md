See CLAUDE.md.

When adding or changing code that mutates user documents, invalidate the auth user document cache for affected users. This includes single-user updates and bulk role/user mutations; otherwise OpenID JWT request burst caching can serve a stale `req.user` until its TTL expires.

## Base44 Dev Setup

- `docker compose -f docker-compose.base44.yml up -d` starts the full stack.
- The **setup** service runs `npm install && npm run build:packages` (builds data-provider, data-schemas, api, client packages). It's a one-shot dependency.
- The **api** service runs the Express backend on port 3080 via nodemon.
- The **client** service runs Vite dev server on port 3090 (mapped to host 3000), proxying `/api` and `/oauth` to the api service.
- MongoDB and MeiliSearch are compose-managed infra services.
- A placeholder `client/dist/index.html` is needed so the Express server doesn't crash (it checks for it even in dev mode).
- AI API keys (OpenAI, Anthropic, Google) are configured as `user_provided` — users enter them in the LibreChat UI. No external secrets are required at boot.
- The vite config was patched to support `VITE_ALLOWED_HOSTS=all` (maps to `true`) and `BACKEND_HOST` env var for the proxy target.
