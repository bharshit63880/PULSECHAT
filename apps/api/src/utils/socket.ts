import type { RequestHandler } from 'express';
import type { Server } from 'socket.io';

export const attachIo =
  (io: Server): RequestHandler =>
  (request, _response, next) => {
    request.io = io;
    next();
  };
