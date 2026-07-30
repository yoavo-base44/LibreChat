See CLAUDE.md.

When adding or changing code that mutates user documents, invalidate the auth user document cache for affected users. This includes single-user updates and bulk role/user mutations; otherwise OpenID JWT request burst caching can serve a stale `req.user` until its TTL expires.

## Base44 Dev Setup Notes

- Run with: `docker compose -f docker-compose.base44.yml up -d`
- Frontend dev server (Vite) on port 3090 → mapped to host port 3000
- Backend (Express) on port 3080, same container as frontend
- Both run in a single `app` service; backend starts first, then Vite dev server
- `client/dist/index.html` is a minimal stub required for backend to boot (it reads this at startup even in dev mode)
- `npm-install` is a one-shot service that runs `npm ci` + `npx turbo run build --filter='!@librechat/frontend'` (builds all packages except the React client)
- Node volumes are named (not bind mounts) to avoid permission/caching issues
- Vite proxy to backend uses `BACKEND_HOST=127.0.0.1` (not `HOST`, which Vite 8 CLI overwrites with its `--host` arg)
- `client/vite.config.ts` was patched: `VITE_ALLOWED_HOSTS=all` maps to `allowedHosts: true`, and `BACKEND_HOST` env var takes precedence over `HOST` for proxy target
- On env var changes, use `docker compose -f docker-compose.base44.yml up -d --force-recreate app` (plain `restart` doesn't pick up new env vars)
- To add AI API keys (OpenAI, Anthropic, Google): set them via `/run/base44/app.env` secrets — they are optional at boot; app works without them (just no AI models available)
