import { describe, expect, it } from 'vitest';

import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken
} from '../src/services/token.service';

describe('token service', () => {
  it('signs and verifies access tokens', () => {
    const token = signAccessToken({
      userId: 'user-123',
      sessionId: 'session-123',
      deviceId: 'device-123'
    });
    const payload = verifyAccessToken(token);

    expect(payload.userId).toBe('user-123');
    expect(payload.sessionId).toBe('session-123');
    expect(payload.deviceId).toBe('device-123');
  });

  it('signs and verifies refresh tokens', () => {
    const token = signRefreshToken({
      userId: 'user-456',
      sessionId: 'session-456',
      deviceId: 'device-456'
    });
    const payload = verifyRefreshToken(token);

    expect(payload.userId).toBe('user-456');
    expect(payload.sessionId).toBe('session-456');
    expect(payload.deviceId).toBe('device-456');
    expect(payload.exp).toBeGreaterThan(payload.iat);
  });
});
