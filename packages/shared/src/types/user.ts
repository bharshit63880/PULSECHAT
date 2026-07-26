export type AuthProvider = 'local';

export type UserSummary = {
  id: string;
  name: string;
  username: string;
  email: string;
  avatarUrl?: string | null;
  bio?: string | null;
  isEmailVerified: boolean;
  authProvider: AuthProvider;
  isOnline: boolean;
  lastSeen?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AuthUser = UserSummary;
