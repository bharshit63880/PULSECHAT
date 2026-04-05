# System Architecture

## Text Diagram

```text
Clients
  ├─ Web (React + Zustand + TanStack Query + Tailwind + Framer Motion)
  └─ Mobile (Expo / React Native)
        │
        ▼
API Gateway / Realtime Edge
  ├─ Express REST API
  ├─ Socket.io Gateway
  ├─ JWT auth + refresh cookie boundary
  └─ Validation / rate limiting / upload policy
        │
        ├─ Redis
        │   ├─ Socket.io adapter pub/sub
        │   ├─ Presence counters
        │   └─ Recent chat list cache
        │
        ├─ MongoDB
        │   ├─ Users
        │   ├─ Chats
        │   ├─ Messages
        │   ├─ Device sessions
        │   └─ Refresh tokens
        │
        └─ Cloud Storage
            └─ Cloudinary encrypted attachment storage
```

## Folder Structure

```text
chat-app/
├─ apps/
│  ├─ api/
│  │  ├─ src/
│  │  │  ├─ config/
│  │  │  ├─ middleware/
│  │  │  ├─ models/
│  │  │  ├─ modules/
│  │  │  │  ├─ auth/
│  │  │  │  ├─ chats/
│  │  │  │  ├─ groups/
│  │  │  │  ├─ messages/
│  │  │  │  ├─ presence/
│  │  │  │  └─ uploads/
│  │  │  ├─ routes/
│  │  │  ├─ services/
│  │  │  ├─ sockets/
│  │  │  └─ server.ts
│  │  └─ Dockerfile
│  ├─ web/
│  │  ├─ src/
│  │  │  ├─ app/
│  │  │  ├─ components/
│  │  │  ├─ features/
│  │  │  ├─ hooks/
│  │  │  ├─ lib/
│  │  │  ├─ pages/
│  │  │  ├─ routes/
│  │  │  ├─ store/
│  │  │  └─ styles/
│  │  ├─ Dockerfile
│  │  └─ nginx.conf
│  └─ mobile/
├─ packages/
│  └─ shared/
├─ docs/
│  └─ system-architecture.md
└─ docker-compose.yml
```

## Production Notes

- Direct chats stay E2EE.
- Group chat is currently a `server-group` MVP for text and realtime collaboration.
- Redis is optional in local development and automatically falls back to in-memory cache/presence.
- Chat list reads are cached briefly to reduce repeated aggregation work.
- Socket.io automatically upgrades to the Redis adapter when `REDIS_URL` is configured.
