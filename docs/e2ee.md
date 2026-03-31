# End-to-End Encryption

## Threat Model

This implementation protects direct-message plaintext from the application server. The server still sees transport metadata, chat participants, device public keys, presence state, delivery state, and encrypted attachment metadata. Group chats currently ship as a documented `server-group` text MVP and are outside the end-to-end encryption boundary.

## Session Establishment

1. the browser creates a local device identity
2. the browser publishes public identity and agreement keys through auth/device registration
3. the sender fetches the peer public key bundle
4. the sender derives a shared transport key using ECDH P-256
5. plaintext is encrypted locally with AES-GCM before send

## Key Lifecycle

- private keys are generated client-side
- private keys remain in browser storage
- public keys and fingerprints are stored server-side
- device sessions may be revoked server-side
- new browser/device instances create new device identities

## What the Server Can Read

- account profile fields
- chat membership
- current server-group text message bodies
- sender and recipient device ids
- ciphertext length and timestamps
- attachment size, mime type, storage URL, sanitized file name
- delivery, seen, presence, and last-seen metadata

## What the Server Cannot Read

- direct-message plaintext
- decrypted attachment file bytes
- local decrypted search corpus
- private identity or agreement keys

## Encrypted Payload Structure

Each direct message stores:

- `ciphertext`
- `encryptionVersion`
- `iv`
- `digest`
- `senderDeviceId`
- `recipientDeviceId`
- optional encrypted attachment metadata

## Encrypted Attachments

- file bytes are encrypted in the browser with a random AES-GCM key
- the file key is wrapped locally using the derived transport key
- the opaque encrypted blob is uploaded to storage
- the API stores only storage metadata and wrapped-key metadata
- GIFs and stickers selected for chat are sent through the same encrypted attachment flow

## Third-Party Media Discovery

- if GIF search is enabled, search terms go directly from the browser to the configured GIF provider
- the selected GIF asset is then fetched in the browser, encrypted locally, and uploaded as an opaque blob
- the API still cannot read the GIF bytes, but the provider can observe the search query and media fetch

## Disappearing Messages

- direct chats can configure a timer
- the API stores `expiresAt`
- a background cleanup job purges expired ciphertext and updates latest-message pointers

## Safety Numbers

- the UI computes a combined fingerprint from local and peer device fingerprints
- verification state is stored locally in the browser
- if peer device identity changes, the conversation should be re-verified

## Limitations

- this is not a full Signal-style ratchet
- current direct-message delivery targets one active peer device bundle per conversation
- browser key persistence depends on IndexedDB support
- no encrypted backup export is implemented yet
- group chats currently support text-only server-group messaging rather than secure sender-key or ratcheted E2EE
- provider-backed GIF discovery sits outside the strict E2EE boundary

## Future Roadmap

- multi-device fan-out per direct message
- stronger forward secrecy and key evolution
- secure group sender keys or group ratchets
- richer verification sync across a user’s own devices
