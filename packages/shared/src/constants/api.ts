export const API_PREFIX = '/api/v1';

export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 50;

export const MESSAGE_TYPES = ['text', 'image', 'file', 'gif', 'sticker'] as const;
export const MESSAGE_DELIVERY_STATES = ['sent', 'delivered', 'seen'] as const;
export const CHAT_ENCRYPTION_MODES = ['e2ee-direct', 'server-group'] as const;
export const VERIFICATION_STATUSES = ['unverified', 'verified', 'changed'] as const;
export const DISAPPEARING_MESSAGE_OPTIONS = [0, 300, 3600, 86400, 604800] as const;
export const ENCRYPTION_VERSION = 'dm-e2ee-v1';
