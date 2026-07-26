# Backend Deployment Guide (Render)

This backend is an Express + Socket.io API that runs on Render as a Web Service.

## Render Service Settings

- Runtime: Node
- Root Directory: `backend`
- Build Command: `npm install && npm run build`
- Start Command: `npm start`

The `build` script is a no-op for this project and exists to satisfy platforms that expect a build phase.

## Required Environment Variables

Set these in Render for the backend service:

- `NODE_ENV=production`
- `PORT=10000` (Render sets this automatically, but you can leave it visible)
- `PAYSTACK_SECRET_KEY=<your_paystack_secret_key>`
- `PAYSTACK_CALLBACK_URL=https://<your-render-service>.onrender.com/paystack/callback`
- `DATABASE_URL=<render_postgres_external_database_url>`

Optional:

- `DB_SSL=true` (enabled automatically in production, but explicit is fine)

## Database Notes

- The backend now supports `DATABASE_URL` directly (recommended for Render Postgres).
- In production mode, Postgres SSL is enabled automatically.
- If you prefer split DB vars locally, use: `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`.

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Create `backend/.env` and set local values.

3. Run locally:

```bash
npm run dev
```

## Health Check

Use this endpoint in Render health checks:

- `GET /health`

Expected response:

```json
{ "success": true, "message": "VEX backend is running" }
```
