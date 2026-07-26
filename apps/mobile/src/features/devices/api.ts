import type { ApiSuccessResponse, DeviceSessionDto } from '@chat-app/shared';

import { api } from '@/lib/api';

export const devicesApi = {
  async list() {
    const response = await api.get<ApiSuccessResponse<DeviceSessionDto[]>>('/devices');
    return response.data.data;
  },

  async revoke(deviceId: string) {
    const response = await api.delete<ApiSuccessResponse<DeviceSessionDto>>(`/devices/${deviceId}`);
    return response.data.data;
  }
};
