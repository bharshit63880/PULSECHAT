# Pulse Private Messenger

A production-style MERN monorepo for a secure, WhatsApp-inspired private messenger. The current implementation focuses on encrypted direct messaging with browser-side key generation, device-aware sessions, encrypted attachments, hybrid message search, realtime notifications, infinite-scroll history, disappearing timers, reliability-aware Socket.io delivery, and an honest server-group text MVP for group conversations.

## Features

- JWT auth with rotating refresh tokens and secure HTTP-only cookies
- Email verification with signed links and resend flow
- Per-device session tracking and revocation
- Browser-generated direct-message encryption keys
- Ciphertext-only direct-message transport and storage
- Encrypted image/file attachments uploaded as opaque blobs
- Encrypted GIF sharing and built-in sticker pack support for direct chats
- Group chat creation and server-group text messaging MVP for small teams
- Tabbed media drawer with emoji insertion, GIF search, and encrypted sticker sending
- Hybrid message search: local decrypted search for direct chats and server-assisted search for group chats
- In-app notification center with realtime socket notifications and browser notification hooks
- Infinite-scroll message history loading with optimistic reconciliation
- Upload provider abstraction with Cloudinary and S3-compatible backends
- Expo-based mobile app scaffold with secure auth, direct-chat list, mobile thread UI, devices, and settings screens
- Safety-number verification UX
- Presence, last seen, typing, reactions, unread counts, delivered/seen states
- Disappearing message timers for direct chats
- Local-only search over decrypted content stored in browser IndexedDB
- Optimistic UI with retry-safe outbox queue and socket acknowledgements
- Responsive React UI with dark mode, empty/error/loading states, and Framer Motion polish
- Redis-ready presence and short-lived recent-chat caching with in-memory fallback
- Docker-ready API + web containers plus local MongoDB/Redis compose stack

## Stack

- Frontend: React, Vite, TypeScript, Tailwind CSS, Zustand, TanStack Query, Framer Motion, Socket.io client
- Backend: Node.js, Express, TypeScript, MongoDB, Mongoose, Redis, JWT, bcryptjs, Zod, Socket.io, Multer, Cloudinary, AWS S3 SDK
- Shared package: constants, DTOs, Zod schemas, response helpers
- Crypto: Browser Web Crypto APIs with ECDH P-256 and AES-GCM

## Monorepo Structure

```text
/
  apps/
    api/
    mobile/
    web/
  packages/
    shared/
  docs/
  .github/workflows/
  AGENTS.md
  DECISIONS.md
```

## Local Setup

1. Install dependencies:
   `npm install`
2. Copy values from `.env.example` into `.env`
3. Start MongoDB locally or point `MONGODB_URI` to MongoDB Atlas
4. Choose an upload provider:
   - set `UPLOAD_PROVIDER=cloudinary` and add Cloudinary credentials, or
   - set `UPLOAD_PROVIDER=s3` and add S3-compatible credentials
5. Add SMTP credentials if you want real email verification delivery
6. Start Redis locally if you want multi-node-ready presence/cache behavior
7. Seed demo users:
   `npm run seed`
8. Start the workspace:
   `npm run dev`

Default URLs:

- web: `http://localhost:5173`
- api: `http://localhost:5000`
- mobile Expo dev server: `npm run dev:mobile`

## Demo Accounts

After `npm run seed`, you can sign in with:

- `aarav@example.com` / `Password123!`
- `sara@example.com` / `Password123!`
- `rohan@example.com` / `Password123!`
- `nina@example.com` / `Password123!`

## Environment Variables

### Shared / API

- `NODE_ENV`
- `PORT`
- `CLIENT_URL`
- `APP_URL`
- `MONGODB_URI`
- `JWT_SECRET`
- `REDIS_URL`
- `REDIS_KEY_PREFIX`
- `CHAT_LIST_CACHE_TTL_SEC`
- `PRESENCE_CACHE_TTL_SEC`
- `JWT_EXPIRES_IN`
- `REFRESH_TOKEN_SECRET`
- `REFRESH_TOKEN_EXPIRES_IN`
- `COOKIE_SECURE`
- `COOKIE_DOMAIN`
- `RATE_LIMIT_WINDOW_MS`
- `RATE_LIMIT_MAX`
- `AUTH_RATE_LIMIT_MAX`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `MAIL_FROM`
- `UPLOAD_PROVIDER`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `S3_BUCKET`
- `S3_REGION`
- `S3_ENDPOINT`
- `S3_ACCESS_KEY_ID`
- `S3_SECRET_ACCESS_KEY`
- `S3_FORCE_PATH_STYLE`
- `MAX_FILE_SIZE_MB`

### Web

- `VITE_API_URL`
- `VITE_SOCKET_URL`
- `VITE_GIPHY_API_KEY`

### Mobile

- `EXPO_PUBLIC_API_URL`
- `EXPO_PUBLIC_SOCKET_URL`

Use a LAN-accessible backend URL for mobile instead of `localhost` when running on a device or simulator.

See [`.env.example`](/C:/Users/h2883/Downloads/chat-app/.env.example).

## Scripts

- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run dev:mobile`
- `npm run mobile:typecheck`
- `npm run mobile:lint`
- `npm run format`
- `npm run seed`

## Architecture Summary

- `apps/web` owns browser crypto, notification UX, infinite-scroll history state, local/group search behavior, local device keys, decrypted search cache, and the secure chat UX.
- `apps/mobile` owns the React Native / Expo client, secure mobile auth/session storage, mobile-friendly direct-chat surfaces, and the mobile crypto adapter boundary.
- `apps/api` owns auth, device sessions, public key bundle distribution, ciphertext persistence, search orchestration, notifications fan-out, uploads, sockets, and disappearing-message cleanup.
- `packages/shared` keeps DTOs, socket names, and Zod schemas aligned between both apps.
- Group chats currently use the same chat domain with `server-group` mode so the product can support collaboration flows without pretending those messages are end-to-end encrypted.

More detail lives in [architecture.md](/C:/Users/h2883/Downloads/chat-app/docs/architecture.md) and [system-architecture.md](/C:/Users/h2883/Downloads/chat-app/docs/system-architecture.md).

## E2EE Summary

- Direct-message plaintext is encrypted in the browser before transport.
- Group-chat plaintext is currently a documented server-group MVP and is not end-to-end encrypted.
- The mobile workspace is scaffolded for the same direct-message E2EE model and uses a dedicated runtime adapter instead of moving crypto into the API.
- The server stores ciphertext, delivery metadata, device public keys, and encrypted attachment metadata only.
- Private keys remain client-side only.
- Direct-chat search runs against decrypted browser storage only.
- Group-chat search is explicitly server-assisted for text and attachment names.
- GIF search, when enabled, queries GIPHY directly from the browser before the selected asset is re-fetched and encrypted for transport.

Important current limitation:

- secure direct chats target one active peer device bundle per conversation in this version
- group chats currently support text-only server-group messaging; secure group ratchets are future work
- the mobile scaffold currently focuses on secure text threads first; richer mobile media, stickers, and offline outbox polish can layer on next
- this is a strong, honest MVP foundation, not a full Signal-style multi-device ratchet

See [e2ee.md](/C:/Users/h2883/Downloads/chat-app/docs/e2ee.md).

## Device and Session Summary

- login and registration bind the session to a local browser device identity
- local accounts stay in a verification gate until their email link is confirmed
- `/devices` lists active device sessions
- stale device sessions can be revoked
- direct chats expose a safety number based on local and peer fingerprints

## API Overview

REST endpoints are versioned under `/api/v1`.

- `/auth`
- `/users`
- `/devices`
- `/keys`
- `/chats`
- `/messages`
- `/uploads`

Notable auth endpoints:

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/verify-email`
- `POST /auth/resend-verification`

See [api.md](/C:/Users/h2883/Downloads/chat-app/docs/api.md).

## Socket Events Summary

- `setup`
- `join-chat`
- `leave-chat`
- `send-message`
- `receive-message`
- `message-ack`
- `notification-created`
- `typing-start`
- `typing-stop`
- `messages-seen`
- `presence-online`
- `presence-offline`
- `sync-missed-events`

See [socket-events.md](/C:/Users/h2883/Downloads/chat-app/docs/socket-events.md).

## Deployment Notes

Deployment guidance is documented in [deployment.md](/C:/Users/h2883/Downloads/chat-app/docs/deployment.md).

Local container stack:

- `docker compose up --build`

## Testing

Current automated verification includes:

- token service coverage for device-aware JWT payloads
- email verification helper coverage and auth schema validation checks
- encrypted message schema validation checks
- API health integration test
- monorepo typecheck, lint, and build verification

See [testing.md](/C:/Users/h2883/Downloads/chat-app/docs/testing.md).

## Future Roadmap

- full multi-device session fan-out per direct message
- stronger forward secrecy via ratcheting
- secure group messaging with sender keys or group ratchets
- Redis-backed Socket.io scaling
- broader integration and realtime transport coverage
