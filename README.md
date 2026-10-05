# PulseChat

> A private, real-time messaging workspace built with React, Node.js, Socket.IO, MongoDB, Redis, and browser-side cryptography.

PulseChat is a full-stack messaging monorepo focused on **real-time communication, secure device sessions, client-side encryption for direct messages, encrypted media, and everyday messaging workflows**.

The project deliberately documents its security boundaries and current limitations instead of claiming production-grade cryptography or calling infrastructure that is not yet complete.

---

## 📸 Product Preview

| Private Conversations | Group Creation |
| --- | --- |
| ![PulseChat dark chat workspace](docs/media/chat-dark.png) | ![PulseChat group creation](docs/media/group-creation.png) |

| Media Sharing | Profile & Account Centre |
| --- | --- |
| ![PulseChat GIF picker](docs/media/gif-picker.png) | ![PulseChat profile settings](docs/media/profile-dark.png) |

| Outgoing Call State | Incoming Call State |
| --- | --- |
| ![PulseChat outgoing call](docs/media/outgoing-call.png) | ![PulseChat incoming call](docs/media/incoming-call.png) |

---

# 🎯 Why PulseChat?

Modern messaging applications require more than sending messages between two users.

PulseChat brings together:

- Real-time messaging
- Presence and typing indicators
- Delivery and seen states
- Reactions and unread counts
- Optimistic message sending
- Retryable offline outbox
- Direct-message client-side encryption
- Encrypted direct-chat media
- Device-aware authentication
- Rotating refresh tokens
- Session revocation
- Email verification
- Disappearing messages
- Local decrypted message search
- Group messaging
- WebSocket-based communication
- Redis-backed real-time infrastructure

The project is structured as a monorepo so that the web client, API, mobile scaffold, and shared contracts can evolve together.

---

# ✨ Core Features

## 💬 Real-Time Messaging

- One-to-one conversations
- Group conversations
- Real-time message delivery
- Presence indicators
- Typing indicators
- Delivery states
- Seen/read states
- Message reactions
- Unread counts
- Optimistic message sending
- Retryable outbox
- Real-time notifications

---

## 🔐 Private Direct Messages

Direct messages use browser-side encryption.

The basic model is:

```text
Plaintext Message
       ↓
Browser Web Crypto
       ↓
Encrypted Ciphertext
       ↓
Socket.IO / API
       ↓
Express API
       ↓
MongoDB
