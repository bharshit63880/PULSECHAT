import { describe, expect, it } from 'vitest';

import { createDecisionSchema, createTaskSchema } from '@chat-app/shared';

describe('conversation context schemas', () => {
  it('requires encrypted content when callers do not provide group content', () => {
    expect(createTaskSchema.safeParse({}).success).toBe(false);
    expect(createTaskSchema.safeParse({ content: 'Ship the mobile polish' }).success).toBe(true);
  });

  it('accepts a direct-chat encrypted decision payload without plaintext', () => {
    expect(
      createDecisionSchema.safeParse({
        encryptedContent: { ciphertext: 'ciphertext', iv: 'iv', digest: 'digest' },
        status: 'proposed',
      }).success,
    ).toBe(true);
  });

  it('rejects plaintext and encrypted content together', () => {
    expect(
      createDecisionSchema.safeParse({
        content: 'Use the purple theme',
        encryptedContent: { ciphertext: 'ciphertext', iv: 'iv', digest: 'digest' },
      }).success,
    ).toBe(false);
  });
});
