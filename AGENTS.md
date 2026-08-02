See CLAUDE.md.

When adding or changing code that mutates user documents, invalidate the auth user document cache for affected users. This includes single-user updates and bulk role/user mutations; otherwise OpenID JWT request burst caching can serve a stale `req.user` until its TTL expires.

## Base44 Dev Environment Notes

- **Architecture**: Monorepo with Vite React frontend (port 3090 in container → 3000 on host) + Express backend (port 3080). Vite proxies `/api` and `/oauth` to the backend.
- **Setup sequence**: `setup` service runs `npm ci` + `turbo build` for all packages except the frontend SPA. Backend needs a placeholder `client/dist/index.html` to boot (it tries to read it synchronously at startup).
- **node_modules**: Stored in Docker named volumes for persistence across restarts. The `setup` service populates them.
- **Vite host binding**: Uses `--host 0.0.0.0` CLI arg (overrides config). `HOST` env var is set to `backend` so the Vite proxy target resolves to the backend container. `VITE_ALLOWED_HOSTS` must include the preview hostname.
- **No external secrets required to boot**: All AI API keys are set to `user_provided`, meaning users enter them in the UI. The app boots and serves the login/registration page without any external API keys.
- **MongoDB**: No auth, runs on default port inside compose.
- **MeiliSearch**: Used for conversation/message search. Master key set to a dev value.
- **RAG API**: Not included in dev compose (optional). File uploads may show warnings.
