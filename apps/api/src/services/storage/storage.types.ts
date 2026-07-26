export type UploadedFile = {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
};

export type StoredAsset = {
  url: string;
  publicId: string | null;
  fileName: string;
  mimeType: string;
  size: number;
  type: 'image' | 'file';
};

export type StorageProvider = {
  uploadAvatar: (file: UploadedFile) => Promise<StoredAsset>;
  uploadAttachment: (file: UploadedFile) => Promise<StoredAsset>;
};
