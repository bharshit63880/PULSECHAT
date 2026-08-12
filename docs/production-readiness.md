# Production Readiness

## Current status

PulseChat is suitable for local development and portfolio/demo hosting after its provider configuration has been verified. It is **not** yet appropriate to present as a high-assurance production messenger.

The automated quality gate runs linting, type checking, production builds, API tests, mobile lint/type checks, and a current-tree secret-pattern scan.

## Verified in the repository

- Access tokens are memory-only in the web client. Reloads use the rotating HTTP-only refresh cookie, and legacy persisted auth data is removed during bootstrap.
- The API rotates refresh tokens and supports device-session revocation.
- Direct-chat content is encrypted in the browser before API persistence; direct encrypted attachments are uploaded as opaque Cloudinary `raw` assets.
- Account/profile data is rehydrated into settings forms when the authenticated user changes.
- API health, token, session, message validation/idempotency, socket authorization, email-token helpers, and encrypted-upload provider behavior have automated test coverage.

## Required before a public launch

1. Rotate every credential that was ever shared in a terminal, screenshot, chat, or old deployment configuration.
2. Use unique production JWT and refresh-token secrets (32+ random characters), HTTPS, `COOKIE_SECURE=true`, and a constrained `CLIENT_URL`.
3. Verify the email sender/domain with the selected provider and exercise real recipient delivery.
4. Configure a real managed Redis instance for multi-instance presence and Socket.IO scaling; in-memory fallback is demo-only.
5. Perform provider-account smoke tests for Cloudinary uploads/downloads using a non-production account.
6. Add a TURN service and complete two-browser/WebRTC testing before advertising calls as reliable.
7. Enable repository-level secret scanning, dependency alerts, branch protection, and required CI checks.

## Security boundaries and limitations

- Direct chats do not yet provide a Signal-style double ratchet, forward secrecy, or complete multi-device fan-out. A sender targets the current recipient device bundle.
- Group messages are explicitly a server-group text MVP and are not end-to-end encrypted.
- Message metadata, membership, presence, timestamps, ciphertext sizes, public device keys, and encrypted attachment metadata remain visible to the server.
- GIF discovery contacts the configured third-party provider from the browser; provider search/fetch metadata is outside the direct-message encryption boundary.
- Browser key storage depends on IndexedDB and has no encrypted backup/export or recovery workflow.
- Existing tests are focused API/unit/integration checks; they do not replace independent security review, load testing, mobile-device testing, or a real provider smoke test.

## Free-tier deployment limitation

Render Free can sleep after inactivity, which interrupts WebSocket clients and can delay the first API request by roughly a minute. It is appropriate for a demo, not availability-sensitive messaging.
