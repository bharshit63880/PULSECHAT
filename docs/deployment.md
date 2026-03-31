# Deployment

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
