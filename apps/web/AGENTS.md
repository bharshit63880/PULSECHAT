## Web App Overview

`apps/web` contains the React + Vite secure messaging client. It is responsible for local device identity, browser-side encryption, optimistic UI, decrypted local search, and secure session UX.

## Frontend Organization

- Keep feature logic under `src/features/*`.
- Keep reusable presentational primitives under `src/components/common`.
- Keep chat shell and conversation UI under `src/components/chat`.
- Keep browser-only crypto helpers isolated under `src/features/encryption`.

## State Rules

- Use TanStack Query for API-backed server state.
- Use Zustand for app/UI/device/outbox state.
- Do not duplicate server state into Zustand unless it is genuinely client-owned.
- Persist only the minimum client-owned metadata needed for UX continuity.

## Crypto Boundary Rules

- Generate device keys in the browser only.
- Keep private keys in browser-controlled storage only.
- Do not add any debug logging around plaintext, decrypted search data, or key material.
- Do not move encryption into generic utilities outside the encryption feature.
- Treat device fingerprints and safety-number state as security UX, not cosmetic state.

## Local Storage and IndexedDB

- Use IndexedDB for browser key material and decrypted searchable message cache.
- Use local storage only for lightweight references such as the active local device id or persisted UI state.
- Do not cache decrypted message text in URLs, query params, or analytics payloads.

## UX Expectations

- Preserve mobile and desktop usability.
- Keep loading, error, and empty states explicit.
- Keep secure direct-chat UX clear: safety number, device state, disappearing timer, and local-only search should be understandable at a glance.
- Avoid misleading labels that imply secure group messaging when it is not implemented.
