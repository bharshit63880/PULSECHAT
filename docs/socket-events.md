# Socket Events

## Client -> Server

### `setup`

Sent after socket authentication completes.

```json
{}
```

### `join-chat`

```json
{
  "chatId": "66401234567890abcdef123"
}
```

### `leave-chat`

```json
{
  "chatId": "66401234567890abcdef123"
}
```

### `send-message`

Ack-driven secure send.

```json
{
  "chatId": "66401234567890abcdef123",
  "clientMessageId": "0f4b2f16-1e31-4a0e-8f51-fd444c733f1a",
  "senderDeviceId": "2b2d9d7a-5cc4-4524-9d26-7a9fc6c04511",
  "recipientDeviceId": "1f8b0b19-c6b4-4e14-8905-5d5a581f6fd8",
  "type": "text",
  "ciphertext": "base64-ciphertext",
  "encryptionVersion": "dm-e2ee-v1",
  "iv": "base64-iv",
  "digest": "base64-digest"
}
```

Ack payload:

```json
{
  "ok": true,
  "message": {
    "id": "66401234567890abcdef999",
    "clientMessageId": "0f4b2f16-1e31-4a0e-8f51-fd444c733f1a"
  }
}
```

Failed ack:

```json
{
  "ok": false,
  "code": "MESSAGE_SEND_FAILED",
  "message": "Unable to send message"
}
```

### `typing-start`

```json
{
  "chatId": "66401234567890abcdef123"
}
```

### `typing-stop`

```json
{
  "chatId": "66401234567890abcdef123"
}
```

### `messages-seen`

```json
{
  "chatId": "66401234567890abcdef123"
}
```

### `sync-missed-events`

Used after reconnect to request messages newer than the local checkpoint.

```json
{
  "chatId": "66401234567890abcdef123",
  "after": "2026-03-24T10:45:00.000Z"
}
```

Ack payload:

```json
{
  "ok": true,
  "messages": []
}
```

## Server -> Client

### `receive-message`

```json
{
  "chatId": "66401234567890abcdef123",
  "message": {
    "id": "66401234567890abcdef999",
    "clientMessageId": "0f4b2f16-1e31-4a0e-8f51-fd444c733f1a",
    "senderDeviceId": "2b2d9d7a-5cc4-4524-9d26-7a9fc6c04511",
    "recipientDeviceId": "1f8b0b19-c6b4-4e14-8905-5d5a581f6fd8",
    "type": "text",
    "ciphertext": "base64-ciphertext",
    "iv": "base64-iv",
    "digest": "base64-digest"
  }
}
```

### `message-ack`

Broadcast back to the sender room once the message is persisted.

```json
{
  "chatId": "66401234567890abcdef123",
  "clientMessageId": "0f4b2f16-1e31-4a0e-8f51-fd444c733f1a",
  "message": {
    "id": "66401234567890abcdef999"
  }
}
```

### `notification-created`

Delivered to recipient user rooms for chats that are not currently active on that client.

```json
{
  "id": "chatId:messageId",
  "chatId": "66401234567890abcdef123",
  "title": "Sara Khan",
  "body": "Sent a new secure message",
  "messageId": "66401234567890abcdef999",
  "createdAt": "2026-03-24T10:15:00.000Z"
}
```

### `presence-online`

```json
{
  "userId": "66401234567890abcdef321"
}
```

### `presence-offline`

```json
{
  "userId": "66401234567890abcdef321",
  "lastSeen": "2026-03-24T10:15:00.000Z"
}
```

### `messages-seen`

```json
{
  "chatId": "66401234567890abcdef123",
  "userId": "66401234567890abcdef321",
  "messageIds": ["66401234567890abcdef999"]
}
```

### `typing-start` / `typing-stop`

```json
{
  "chatId": "66401234567890abcdef123",
  "userId": "66401234567890abcdef321"
}
```

## Retry and Reconnect Notes

- clients persist encrypted unsent payloads in the outbox
- `clientMessageId` deduplicates retries
- sender waits for `message-ack` and callback ack
- reconnect sync asks for messages newer than the last local message timestamp
