import type { AttachmentDto } from '@chat-app/shared';

import { api } from '@/lib/axios';

export const uploadService = {
  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<{ data: AttachmentDto }>('/uploads/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    return response.data.data;
  },

  async uploadAttachment(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<{ data: AttachmentDto & { type: 'image' | 'file' } }>(
      '/uploads/attachment',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' }
      }
    );

    return response.data.data;
  }
};
