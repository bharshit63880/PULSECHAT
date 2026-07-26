import { beforeEach, describe, expect, it, vi } from 'vitest';

const findOneAndUpdateMock = vi.fn();
const findByIdAndUpdateMock = vi.fn();
const updateManyMock = vi.fn();

vi.mock('../src/models/RefreshToken', () => ({
  RefreshTokenModel: {
    findOneAndUpdate: findOneAndUpdateMock,
    updateMany: updateManyMock
  },
  hashRefreshToken: (value: string) => `hashed:${value}`
}));

vi.mock('../src/models/DeviceSession', () => ({
  DeviceSessionModel: {
    findByIdAndUpdate: findByIdAndUpdateMock,
    updateMany: updateManyMock
  }
}));

vi.mock('../src/models/User', () => ({
  UserModel: {}
}));

vi.mock('../src/modules/devices/devices.service', () => ({
  devicesService: {
    registerOrRotateDevice: vi.fn(),
    touchDeviceSession: vi.fn()
  }
}));

vi.mock('../src/services/token.service', () => ({
  signAccessToken: vi.fn(),
  signRefreshToken: vi.fn(),
  verifyRefreshToken: vi.fn()
}));

vi.mock('../src/services/mapper.service', () => ({
  mapUserSummary: vi.fn()
}));

describe('auth session logout behavior', () => {
  beforeEach(() => {
    findOneAndUpdateMock.mockReset();
    findByIdAndUpdateMock.mockReset();
    updateManyMock.mockReset();
  });

  it('revokes only the refresh token on logout and keeps the device session published', async () => {
    const { authSessionService } = await import('../src/services/auth-session.service');

    findOneAndUpdateMock.mockResolvedValue({
      id: 'token-record-id',
      deviceSession: 'device-session-id'
    });

    await authSessionService.revokeSession('refresh-token-value');

    expect(findOneAndUpdateMock).toHaveBeenCalledTimes(1);
    expect(findByIdAndUpdateMock).not.toHaveBeenCalled();
  });
});
