import { beforeEach, describe, expect, it, vi } from 'vitest';

const uploadStreamMock = vi.fn();

vi.mock('../src/config/cloudinary', () => ({
  cloudinary: {
    uploader: {
      upload_stream: uploadStreamMock,
    },
  },
}));

vi.mock('../src/services/logger.service', () => ({
  logger: {
    error: vi.fn(),
  },
}));

describe('Cloudinary encrypted attachment storage', () => {
  beforeEach(() => {
    uploadStreamMock.mockReset();
  });

  it('uploads encrypted attachments as raw assets rather than decodable media', async () => {
    uploadStreamMock.mockImplementation((options, callback) => ({
      end: () =>
        callback(null, {
          secure_url: 'https://res.cloudinary.com/example/raw/upload/v1/blob.bin',
          public_id: 'chat-app/files/blob',
          resource_type: options.resource_type,
        }),
    }));

    const { cloudinaryStorageProvider } =
      await import('../src/services/storage/cloudinary-storage.provider');
    const asset = await cloudinaryStorageProvider.uploadAttachment({
      buffer: Buffer.from('encrypted bytes'),
      originalname: 'photo.jpg',
      mimetype: 'image/jpeg',
      size: 15,
    });

    expect(uploadStreamMock).toHaveBeenCalledWith(
      expect.objectContaining({ folder: 'chat-app/files', resource_type: 'raw' }),
      expect.any(Function),
    );
    expect(asset.fileName).toBe('photo.jpg');
    expect(asset.url).toContain('/raw/');
  });
});
