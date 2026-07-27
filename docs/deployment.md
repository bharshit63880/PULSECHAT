# Deployment

## Free hobby deployment: Vercel + Render + Atlas + Upstash

This repository includes [`vercel.json`](../vercel.json) and [`render.yaml`](../render.yaml) for a no-cost hobby deployment:

| Service | Provider | Purpose |
| --- | --- | --- |
| Web client | Vercel | React/Vite SPA and HTTPS |
| API and Socket.IO | Render Free Web Service | REST API, auth, realtime messaging, call signaling |
| Database | MongoDB Atlas Free cluster | Persistent application data |
| Redis | Upstash Free Redis | Presence, cache, and Socket.IO adapter |
| Media | Cloudinary Free plan | Avatars and encrypted attachment blobs |

### 1. Create managed services

1. Create one MongoDB Atlas Free cluster and a database user. In Atlas Network Access, allow `0.0.0.0/0` **only for this hobby deployment**; use a strong database password.
2. Create an Upstash Redis Free database in a region close to the API and copy its TLS connection string (`rediss://...`).
3. Create a Cloudinary account and obtain a new cloud name, API key, and API secret.
4. Configure a dedicated email sender. Gmail requires an App Password; use a transactional provider if the project grows.

### 2. Deploy the API on Render

1. In Render, select **New → Blueprint** and choose this GitHub repository. Render reads `render.yaml`.
2. Create the service on the **Free** plan.
3. Fill the requested secrets. Do not put them in GitHub, `render.yaml`, or frontend environment variables.
4. Before the first deploy, temporarily set `CLIENT_URL` and `APP_URL` to the expected Vercel URL (for example, `https://pulsechat.vercel.app`). Update them once Vercel provides the final URL.
5. After deploy, confirm `https://<your-render-service>.onrender.com/api/v1/health` returns `status: ok`.

`COOKIE_SAME_SITE=none` is intentionally set in the blueprint: Vercel and Render use different sites, and refresh-session cookies must be `Secure` and cross-site. If you later use `app.example.com` and `api.example.com`, set `COOKIE_SAME_SITE=lax` and `COOKIE_DOMAIN=.example.com` instead.

### 3. Deploy the web app on Vercel

1. Import the same GitHub repository in Vercel. Keep the repository root as the project root; `vercel.json` supplies the monorepo build and SPA fallback.
2. Add these **Production** environment variables:

   ```text
   VITE_API_URL=https://<your-render-service>.onrender.com/api/v1
   VITE_SOCKET_URL=https://<your-render-service>.onrender.com
   VITE_GIPHY_API_KEY=<optional Giphy browser key>
   ```

3. Deploy, then copy the Vercel URL into Render's `CLIENT_URL` and `APP_URL`, and redeploy the Render service.
4. Register a new account, verify the email link, sign out/in, send a message in a second browser, and upload a small file.

### Free-tier trade-offs

- Render Free sleeps after 15 minutes without traffic. The first request or WebSocket reconnect can take roughly a minute; active Socket.IO clients will reconnect after a sleep.
- Atlas, Upstash, Cloudinary, and email providers have their own quotas. Monitor their dashboards.
- This is appropriate for a portfolio, demo, or small hobby community—not an availability-guaranteed production product.
- WebRTC calling still needs a TURN service and real two-browser testing before it can be described as reliable. A dependable TURN relay is generally not available as a permanently free hosted service.

### Security before deploying

- Rotate any SMTP, database, and Cloudinary credentials that were ever pasted into chats, screenshots, or source control.
- Use Render-generated JWT secrets; never reuse development secrets.
- Keep `.env` ignored and use each platform's secret manager.
- Restrict MongoDB network access and rotate database credentials after demo use.

## Local Environment

- run MongoDB locally or use Atlas
- provide Cloudinary credentials if you want encrypted attachment uploads
- provide SMTP credentials if you want real verification emails
- keep `COOKIE_SECURE=false` for local HTTP development

## Production Environment

- set `CLIENT_URL` to the public frontend origin
- set `VITE_API_URL` to the public `/api/v1` origin
- set `VITE_SOCKET_URL` to the public API origin
- use strong production secrets for both JWT values
- set `APP_URL` to the public frontend verification URL origin
- configure SMTP for verification delivery
- set `COOKIE_SECURE=true`
- set `COOKIE_SAME_SITE=none` when the frontend and API have different parent domains; otherwise keep `lax`
- set `COOKIE_DOMAIN` when frontend and backend share a parent domain and cookie scoping is needed

## CORS

- restrict `CLIENT_URL` to trusted production origins
- keep credentials enabled because refresh rotation relies on HTTP-only cookies
- avoid permissive wildcard origins in production
- keep `APP_URL` aligned with the exact deployed frontend origin used in verification links

## MongoDB Notes

- MongoDB Atlas is recommended for production
- keep indexes created for users, chats, device sessions, refresh tokens, and messages
- monitor TTL behavior for refresh tokens and disappearing-message cleanup

## Cloudinary Notes

- attachment uploads store encrypted blobs, not plaintext payloads
- avatars are not end-to-end encrypted
- use folder separation for avatars vs encrypted attachments

## Frontend Deployment

- Vercel, Netlify, Cloudflare Pages, or an nginx-based static host all work
- the browser must support IndexedDB and Web Crypto for the secure direct-message flow

## Backend Deployment

- any Node-capable container host works
- terminate TLS before the API
- add structured log shipping and health monitoring
- horizontal socket scaling will need a shared adapter such as Redis
- SMTP credentials should be stored in the platform secret manager, not committed to the repo

## Health Checks

- REST health: `/api/v1/health`
- verify MongoDB connectivity
- verify Cloudinary creds during attachment smoke tests
- verify refresh cookie flow from the deployed frontend origin
