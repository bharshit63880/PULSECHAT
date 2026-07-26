import { describe, expect, it } from 'vitest';

import { verifyEmailSchema } from '@chat-app/shared';

import { hashVerificationToken } from '../src/modules/auth/email-verification.service';

describe('email verification helpers', () => {
  it('hashes the same token consistently', () => {
    const token = 'sample-verification-token-1234567890';

    expect(hashVerificationToken(token)).toBe(hashVerificationToken(token));
  });

  it('produces different hashes for different tokens', () => {
    expect(hashVerificationToken('token-one')).not.toBe(hashVerificationToken('token-two'));
  });

  it('accepts valid verification payload schema', () => {
    const verifyPayload = verifyEmailSchema.parse({ token: 'sample-verification-token-1234567890' });

    expect(verifyPayload.token).toContain('sample-verification-token');
  });
});
