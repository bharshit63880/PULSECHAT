# Architecture

## High-Level Layout

- `apps/web`: React client, browser crypto, local device state, decrypted search cache, outbox queue
- `apps/mobile`: Expo / React Native client, secure session storage, mobile thread UI, mobile crypto adapter boundary
- `apps/api`: Express API, Socket.io server, MongoDB models, device sessions, ciphertext persistence, cleanup jobs
- `packages/shared`: socket names, DTOs, Zod schemas, response helpers

## Frontend Boundary

The web app owns:

- local device generation and persistence
- direct-message encryption and decryption
- explicit server-group rendering for non-E2EE group chats
- encrypted attachment wrapping before upload
- encrypted GIF and sticker media wrapping before upload
- provider-backed GIF discovery in the browser before selected assets are re-encrypted for transport
- decrypted message cache and local-only search
- safety-number verification UX
- outbox queue and retry-safe message send

The web app must not:

- leak plaintext into logs
- send private keys to the server
- treat transport encryption as end-to-end encryption

## Mobile Boundary

The mobile app owns:

- secure auth/session persistence in device storage
- mobile-first navigation and chat surfaces
- direct-chat encryption and decryption through a mobile runtime adapter
- future mobile group-chat UI that must preserve the same honest `server-group` vs `e2ee-direct` distinction
- mobile key generation and public bundle registration

The mobile app must not:

- fall back to plaintext messaging if the runtime cannot satisfy crypto requirements
- move private keys or plaintext message content into the API
- imply that unsupported mobile runtime features are already production-complete

## Backend Boundary

The API owns:

- auth and refresh-token rotation
- device session registration and revocation
- public key bundle distribution
- chat and message metadata persistence
- ciphertext persistence
- server-group text persistence for group chats
- encrypted attachment metadata persistence
- realtime presence and delivery orchestration
- disappearing-message cleanup

The API must not:

- store or log direct-message plaintext
- store private keys
- perform message decryption

## Shared Boundary

The shared package includes only contracts that are safe for both sides:

- DTOs
- event names
- request validation schemas
- pagination helpers
- response envelopes

It does not include:

- backend-only persistence logic
- browser-only CryptoKey handling
- secrets or private key material

## Message Flow

1. browser ensures a local device identity exists
2. sender fetches the peer public key bundle for direct chats or opens a `server-group` chat for group text
3. direct-chat plaintext is encrypted locally before send
4. sender optionally encrypts direct-chat attachment bytes locally
5. ciphertext, or server-group plaintext for the documented group MVP, is sent to the API
6. API stores message content and metadata according to the chat mode
7. Socket.io emits the new message to relevant participants
8. direct-chat recipients decrypt locally after receipt or pagination load, while group recipients render the server-group text payload directly
9. recipient marks seen and the API updates metadata only

The mobile client follows the same ciphertext contract, but uses secure device storage and a runtime-specific crypto adapter instead of browser storage APIs.

## Reliability Flow

- client generates `clientMessageId`
- optimistic message enters UI immediately
- encrypted payload is added to the persisted outbox
- socket send waits for ack
- on success, optimistic message is reconciled with the stored message
- on timeout/failure, item stays in the outbox for retry
- reconnect sync requests missed messages after the last known timestamp
