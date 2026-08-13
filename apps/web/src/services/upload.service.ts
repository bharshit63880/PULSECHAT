import type { AttachmentDto } from '@chat-app/shared';

import { api } from '@/lib/axios';

export const uploadService = {
  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    // Let the browser set the multipart boundary. Supplying Content-Type manually
    // can omit it, which prevents Multer from receiving the selected file.
    const response = await api.post<{ data: AttachmentDto }>('/uploads/avatar', formData);

    return response.data.data;
  },

  async uploadAttachment(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<{ data: AttachmentDto & { type: 'image' | 'file' } }>(
      '/uploads/attachment',
      formData,
    );

    return response.data.data;
  },
};
