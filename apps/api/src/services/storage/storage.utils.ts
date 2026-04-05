import path from 'node:path';

export const sanitizeFileName = (value: string) =>
  path
    .basename(value)
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 255);

export const resolveAssetType = (mimeType: string) =>
  mimeType.startsWith('image/') ? 'image' : 'file';
