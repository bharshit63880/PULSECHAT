# Testing

## Current Automated Coverage

- device-aware JWT token signing and verification
- encrypted direct-message request schema validation
- API health integration smoke test
- monorepo `typecheck`, `lint`, `build`, and root `test`

## Current Commands

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npm run test`

## Manual Verification Checklist

1. register or log in from a fresh browser profile
2. open a direct chat and send an encrypted text message
3. send an encrypted image or file attachment
4. verify delivered and seen states across two browser sessions
5. revoke a non-current device session from `/devices`
6. enable a disappearing timer and confirm cleanup
7. mark the safety number as verified and confirm the UI updates
8. reload and use local-only search to find previously decrypted content

## Recommended Next Automated Tests

- socket delivery ack and reconnect sync integration
- direct-message service deduplication by `clientMessageId`
- disappearing-message cleanup job behavior
- browser crypto helper flow in a web-focused test harness
- device-session revoke and refresh-rotation integration coverage
