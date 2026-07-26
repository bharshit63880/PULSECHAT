import type { DeviceSessionDto } from '@chat-app/shared';

import { api } from '@/lib/axios';

export const devicesApi = {
  async list() {
    const response = await api.get<{ data: DeviceSessionDto[] }>('/devices');
    return response.data.data;
  },

  async revoke(deviceId: string) {
    const response = await api.delete<{ data: DeviceSessionDto }>(`/devices/${deviceId}`);
    return response.data.data;
  }
};
