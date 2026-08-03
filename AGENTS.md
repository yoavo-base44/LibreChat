See CLAUDE.md.

When adding or changing code that mutates user documents, invalidate the auth user document cache for affected users. This includes single-user updates and bulk role/user mutations; otherwise OpenID JWT request burst caching can serve a stale `req.user` until its TTL expires.

## Base44 Dev Setup Notes

- This is a Node.js monorepo (npm workspaces + turborepo) with `api/` (Express backend) and `client/` (Vite React frontend) plus shared `packages/`.
- The backend requires workspace packages to be built first (`npm run build:packages`). The `setup` service in `docker-compose.base44.yml` handles `npm ci` + package builds.
- The API server unconditionally reads `client/dist/index.html` at startup for SPA serving. In dev mode, a placeholder file must exist at that path — the Vite dev server handles actual client serving.
- The Vite dev server proxies `/api` and `/oauth` to the backend. The `HOST` env var in the client container is set to `api` (the compose service name) so the proxy target resolves to `http://api:3080`. The `--host 0.0.0.0` CLI flag overrides the bind address.
- MongoDB and MeiliSearch are required infra. RAG API + pgvector are optional (file upload features).
- AI provider keys default to `user_provided` — users enter their own API keys in the LibreChat UI settings.
- To verify: `curl http://localhost:3000/api/config` should return JSON with app configuration.
