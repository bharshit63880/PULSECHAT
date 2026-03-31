import type { NextFunction, Request, Response } from 'express';
import type { AnyZodObject, ZodType } from 'zod';

type ValidationTarget = 'body' | 'query' | 'params';

export const validateRequest =
  <T>(schema: ZodType<T>, target: ValidationTarget = 'body') =>
  (request: Request, _response: Response, next: NextFunction) => {
    const parsed = schema.parse(request[target]);
    request[target] = parsed as Request[ValidationTarget];
    next();
  };

export const validateMultiRequest =
  (schemas: Partial<Record<ValidationTarget, AnyZodObject>>) =>
  (request: Request, _response: Response, next: NextFunction) => {
    if (schemas.body) {
      request.body = schemas.body.parse(request.body);
    }

    if (schemas.query) {
      request.query = schemas.query.parse(request.query) as Request['query'];
    }

    if (schemas.params) {
      request.params = schemas.params.parse(request.params);
    }

    next();
  };
