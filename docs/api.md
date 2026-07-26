# API Reference

Base URL: `/api/v1`

## Response Envelope

Success:

```json
{
  "success": true,
  "message": "Optional message",
  "data": {},
  "meta": {}
}
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": {}
  }
}
```

## Auth

### `POST /auth/register`

Creates a user and binds the session to a browser device registration payload.

### `POST /auth/login`

Authenticates and updates or creates the current device session.

### `POST /auth/verify-email`

Consumes a verification token from the email link and marks the account as verified.

### `POST /auth/resend-verification`

Requires the current authenticated session and resends a verification link for unverified local accounts.

### `POST /auth/refresh`

Rotates the refresh-token cookie and returns a fresh access token plus current device-session summary.

### `POST /auth/logout`

Revokes the current refresh token for the active browser session.

### `GET /auth/me`

Returns the current user summary.

## Users

### `GET /users`

Lists users for direct-message discovery.

This endpoint requires a verified email.

### `PATCH /users/me`

Updates profile fields and avatar URL.

## Devices

### `GET /devices`

Returns current and historical device sessions for the signed-in user.

### `DELETE /devices/:deviceId`

Revokes a non-current device session and its associated refresh tokens.

## Keys

### `GET /keys/:userId`

Returns the published public key bundle for the target user’s active devices.

The server returns public keys and fingerprints only. It never returns private keys.

This endpoint requires a verified email.

## Chats

### `GET /chats`

Lists chats ordered by most recent activity.

This endpoint requires a verified email.

### `POST /chats/direct`

Creates or returns the direct chat for the current user and target peer.

## Groups

### `POST /groups`

Creates a group chat in `server-group` mode.

Expected payload includes:

- `name`
- `participantIds`

Current behavior:

- the creator is added automatically
- a group needs at least three unique members including the creator
- current MVP supports text messaging first and does not claim group E2EE

### `PATCH /chats/:chatId/disappearing-mode`

Updates the direct-chat disappearing timer in seconds.

Supported values:

- `0`
- `300`
- `3600`
- `86400`
- `604800`

## Messages

### `GET /messages/:chatId`

Returns paginated ciphertext messages and delivery metadata.

This endpoint requires a verified email.

### `GET /messages/:chatId/search`

Searches messages inside a chat.

Expected query params:

- `query`
- optional `limit`

Current behavior:

- direct chats only search attachment names server-side safe metadata is available for, while decrypted text search remains local to the client
- group chats support server-assisted search across group text payloads and attachment names

### `POST /messages`

Creates a new message for either an encrypted direct chat or a `server-group` chat.

Expected payload includes:

- `chatId`
- `clientMessageId`
- `senderDeviceId`
- `recipientDeviceId`
- `type`
- `ciphertext`
- `encryptionVersion`
- `iv`
- `digest`
- optional encrypted attachment metadata
- optional `replyToId`

Current behavior:

- direct chats expect browser-encrypted ciphertext
- group chats currently support text-only `server-group` payloads and do not use direct-chat E2EE

Supported message `type` values:

- `text`
- `image`
- `file`
- `gif`
- `sticker`

### `POST /messages/:chatId/seen`

Marks unseen messages as seen for the current user.

### `POST /messages/:messageId/reactions`

Adds or toggles a reaction on a message.

## Uploads

### `POST /uploads/avatar`

Uploads a profile avatar.

### `POST /uploads/attachment`

Uploads an encrypted attachment blob. The API stores storage metadata only and does not inspect plaintext file contents.

This endpoint requires a verified email.

Current behavior:

- `UPLOAD_PROVIDER=cloudinary` uses Cloudinary storage
- `UPLOAD_PROVIDER=s3` uses an S3-compatible bucket via the provider abstraction
