## Mobile Workspace Overview

This workspace contains the React Native / Expo client for Pulse Private Messenger. It should mirror the backend contracts honestly without weakening the direct-message encryption boundary.

## Organization Rules

- Keep feature code under `src/features`, navigation under `src/navigation`, and reusable UI under `src/components`.
- Avoid giant screens. Extract cards, rows, and form controls once a screen becomes hard to review.
- Reuse `@chat-app/shared` DTOs and constants instead of redefining contracts locally.

## Accessibility and Responsive Rules

- Every tappable control must remain comfortable on mobile thumbs.
- Prefer clear touch targets, readable spacing, and safe-area aware layouts.
- Keep portrait-first layouts polished on phones before optimizing larger screens.

## State and Data Rules

- Use Zustand for auth/session and lightweight UI state.
- Use TanStack Query for chats, messages, devices, and profile data.
- Keep mutations close to the feature that owns them.
- Invalidate or patch cached data deliberately after realtime events.

## Crypto Boundary Rules

- Never move mobile private keys or plaintext message content to the API.
- Keep encryption helpers isolated under `src/features/encryption`.
- If the runtime cannot support the required crypto primitives, fail clearly instead of silently downgrading security.

## Local Storage Rules

- Use secure device storage for auth/session snapshots and serialized local device keys.
- Do not log or persist decrypted message text outside the explicit local encrypted-chat cache strategy.
- Do not store raw secrets or refresh tokens in plain async storage.

## Before Completing Mobile Changes

1. `npm run typecheck -w @chat-app/mobile`
2. `npm run lint -w @chat-app/mobile`
3. update `.env.example` if mobile env keys change
4. update `README.md` and `docs/architecture.md` when workflow or boundaries change
