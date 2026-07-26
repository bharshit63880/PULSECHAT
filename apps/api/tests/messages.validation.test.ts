import { describe, expect, it } from 'vitest';

import { sendMessageSchema } from '@chat-app/shared';

describe('sendMessageSchema', () => {
  it('rejects empty text messages', () => {
    const result = sendMessageSchema.safeParse({
      chatId: '123456789012345678901234',
      senderDeviceId: 'device-123',
      recipientDeviceId: 'device-456',
      type: 'text',
      ciphertext: '',
      iv: 'iv-value',
      digest: 'digest-value-1234'
    });

    expect(result.success).toBe(false);
  });

  it('rejects image messages without attachment metadata', () => {
    const result = sendMessageSchema.safeParse({
      chatId: '123456789012345678901234',
      senderDeviceId: 'device-123',
      recipientDeviceId: 'device-456',
      type: 'image',
      ciphertext: 'ciphertext',
      iv: 'iv-value',
      digest: 'digest-value-1234'
    });

    expect(result.success).toBe(false);
  });

  it('accepts valid file messages', () => {
    const result = sendMessageSchema.safeParse({
      chatId: '123456789012345678901234',
      senderDeviceId: 'device-123',
      recipientDeviceId: 'device-456',
      type: 'file',
      ciphertext: 'ciphertext',
      iv: 'iv-value',
      digest: 'digest-value-1234',
      attachment: {
        url: 'https://example.com/file.pdf',
        publicId: 'file-1',
        fileName: 'file.pdf',
        mimeType: 'application/pdf',
        size: 1024,
        isEncrypted: true,
        encryption: {
          algorithm: 'AES-GCM',
          wrappedFileKey: 'wrapped-key-material',
          iv: 'wrap-iv-123',
          digest: 'attachment-digest'
        }
      }
    });

    expect(result.success).toBe(true);
  });

  it('accepts valid GIF messages', () => {
    const result = sendMessageSchema.safeParse({
      chatId: '123456789012345678901234',
      senderDeviceId: 'device-123',
      recipientDeviceId: 'device-456',
      type: 'gif',
      ciphertext: 'ciphertext',
      iv: 'iv-value',
      digest: 'digest-value-1234',
      attachment: {
        url: 'https://example.com/clip.gif',
        publicId: 'gif-1',
        fileName: 'clip.gif',
        mimeType: 'image/gif',
        size: 2048,
        isEncrypted: true,
        encryption: {
          algorithm: 'AES-GCM',
          wrappedFileKey: 'wrapped-key-material',
          iv: 'wrap-iv-123',
          digest: 'attachment-digest'
        }
      }
    });

    expect(result.success).toBe(true);
  });

  it('accepts valid sticker messages', () => {
    const result = sendMessageSchema.safeParse({
      chatId: '123456789012345678901234',
      senderDeviceId: 'device-123',
      recipientDeviceId: 'device-456',
      type: 'sticker',
      ciphertext: 'ciphertext',
      iv: 'iv-value',
      digest: 'digest-value-1234',
      attachment: {
        url: 'https://example.com/sticker.svg',
        publicId: 'sticker-1',
        fileName: 'thumbs-up.svg',
        mimeType: 'image/svg+xml',
        size: 1024,
        isEncrypted: true,
        encryption: {
          algorithm: 'AES-GCM',
          wrappedFileKey: 'wrapped-key-material',
          iv: 'wrap-iv-123',
          digest: 'attachment-digest'
        }
      }
    });

    expect(result.success).toBe(true);
  });
});
