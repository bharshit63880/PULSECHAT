import type { Server } from 'socket.io';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        username: string;
        sessionId: string;
        deviceId: string;
        isEmailVerified: boolean;
      };
      io?: Server;
    }
  }
}

export {};
