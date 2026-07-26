## API App Overview

`apps/api` contains the Express API, Socket.io transport, Mongoose persistence, and background cleanup jobs for the secure messenger backend.

## Backend Structure Rules

- Keep controllers thin.
- Put reusable business logic into services.
- Keep persistence concerns in models and domain services, not controllers.
- Keep validation at the route boundary using shared Zod schemas whenever the contract is safe to share.

## Response and Logging Rules

- Return versioned REST responses under `/api/v1`.
- Use the shared response envelope consistently.
- Keep structured logs useful but minimal.
- Log auth outcomes, session revocations, socket connect/disconnect, upload failures, and suspicious validation/auth issues.

## Security Constraints

- The server must never store or log plaintext direct-message content.
- The server must never store or log private keys.
- The server may store public key bundles, ciphertext, encrypted attachment metadata, message ids, delivery/seen metadata, and presence/session metadata.
- Do not add decryption helpers to the backend.
- Keep disappearing-message cleanup honest and metadata-safe.

## Completion Checklist

Before shipping API changes:

1. typecheck passes
2. lint passes
3. tests pass
4. routes are validated
5. docs are updated for changed endpoints or socket events
6. no new sensitive field leaks into DTOs or logs
